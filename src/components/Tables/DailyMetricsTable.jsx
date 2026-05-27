import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Chip from '../Chip/Chip';
import JiraLink from '../JiraLink/JiraLink';
import { healthColor } from '../../services/healthUtils';
import {
  rmDailyTicketsLink,
  rmDailyDefectsLink,
  rmDailyPriorityLink,
  rmDailyHealthScoreLink,
  rmMonthlyTicketsLink,
  rmMonthlyDefectsLink,
  rmMonthlyPriorityLink,
  rmMonthlyHealthScoreLink,
} from '../../services/jiraLinks';
import { groupByWeek } from '../../utils/weeklyRollup';
import './Tables.scss';

function Sparkline({ values, color = '#0284c7', width = 120, height = 28 }) {
  const nums = (values || []).filter(v => v != null && !isNaN(v));
  if (nums.length < 2) return null;
  const max   = Math.max(...nums);
  const min   = Math.min(...nums);
  const range = max - min || 1;
  const pts   = nums.map((v, i) => {
    const x = (i / (nums.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} aria-hidden="true" style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

Sparkline.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number),
  color:  PropTypes.string,
  width:  PropTypes.number,
  height: PropTypes.number,
};

const EST  = 'America/New_York';

const PRIORITY_DEFS = [
  { key: 'c', jira: 'Critical', color: '#dc2626' },
  { key: 'h', jira: 'High',    color: '#ea580c' },
  { key: 'm', jira: 'Medium',  color: '#ca8a04' },
  { key: 'l', jira: 'Low',     color: '#0284c7' },
];

// Map column label → row field key used for sorting
const COL_SORT = {
  'Release Date': 'date', 'Total Tickets': 't', 'Total Defects': 'd',
  'Critical': 'c', 'High': 'h', 'Medium': 'm', 'Low': 'l', 'Health Score': 'hs',
};

const COLS = ['Release Date', 'Total Tickets', 'Total Defects', 'Critical', 'High', 'Medium', 'Low', 'Health Score'];

function sortRows(rows, key, dir) {
  return [...rows].sort((a, b) => {
    let va, vb;
    if (key === 'date') {
      const [am, ad] = (a.date || '0/0').split('/').map(Number);
      const [bm, bd] = (b.date || '0/0').split('/').map(Number);
      va = am * 100 + ad;
      vb = bm * 100 + bd;
    } else {
      va = a[key] ?? -1;
      vb = b[key] ?? -1;
    }
    return dir === 'asc' ? va - vb : vb - va;
  });
}

export default function DailyMetricsTable({ rows, totals, year, month }) {
  const todayStr = moment().tz(EST).format('M/D');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  function handleSort(col) {
    const key = COL_SORT[col];
    if (!key) return;
    if (sortKey === key) {
      if (sortDir === 'asc') { setSortDir('desc'); }
      else                   { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const displayRows = useMemo(() => {
    if (sortKey) return sortRows(rows, sortKey, sortDir);
    return groupByWeek(rows, year);
  }, [rows, sortKey, sortDir, year]);

  let dataIdx = 0;

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr className="data-table__head-row">
            {COLS.map((col, i) => {
              const key       = COL_SORT[col];
              const isSorted  = sortKey === key;
              const indicator = isSorted ? (sortDir === 'asc' ? '↑' : '↓') : '↕';
              return (
                <th
                  key={col}
                  className={`data-table__th${i === 0 ? ' data-table__th--left' : ''}${key ? ' data-table__th--sortable' : ''}`}
                  onClick={key ? () => handleSort(col) : undefined}
                  aria-sort={key ? (isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
                >
                  {col}
                  {key && (
                    <span className={`sort-icon${isSorted ? ' sort-icon--active' : ''}`}>
                      {indicator}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((r, i) => {
            if (r.isRollup) {
              return (
                <tr key={`rollup-${i}`} className="data-table__row data-table__row--week-rollup wr">
                  <td className="data-table__td data-table__td--date">
                    <span className="week-rollup-label">{r.label}</span>
                  </td>
                  <td className="data-table__td data-table__td--num">{r.t || '—'}</td>
                  <td className="data-table__td data-table__td--num">{r.d || '—'}</td>
                  {PRIORITY_DEFS.map(p => (
                    <td key={p.key} className="data-table__td data-table__td--center">
                      <Chip value={r[p.key] || null} color={p.color} />
                    </td>
                  ))}
                  <td className="data-table__td data-table__td--health">
                    {r.hs != null ? (
                      <span style={{ fontWeight: 600, color: healthColor(r.hs) }}>{r.hs}</span>
                    ) : '—'}
                  </td>
                </tr>
              );
            }

            const hc      = healthColor(r.hs);
            const isToday = r.date === todayStr;
            const rowIdx  = dataIdx++;
            const rowCls  = [
              'data-table__row wr',
              rowIdx % 2 ? '' : 'data-table__row--alt',
              isToday ? 'data-table__row--today' : '',
            ].filter(Boolean).join(' ');

            return (
              <tr key={i} className={rowCls}>
                <td className="data-table__td data-table__td--date">
                  {isToday && <span className="today-badge">Today</span>}
                  {r.date}
                </td>
                <td className="data-table__td data-table__td--num">
                  <JiraLink href={r.t > 0 ? rmDailyTicketsLink(r.date, year) : null} plain>
                    {r.t}
                  </JiraLink>
                </td>
                <td className="data-table__td data-table__td--num">
                  <JiraLink href={r.d > 0 ? rmDailyDefectsLink(r.date, year) : null} plain>
                    {r.d}
                  </JiraLink>
                </td>
                {PRIORITY_DEFS.map(p => (
                  <td key={p.key} className="data-table__td data-table__td--center">
                    <JiraLink href={r[p.key] > 0 ? rmDailyPriorityLink(r.date, year, p.jira) : null}>
                      <Chip value={r[p.key]} color={p.color} />
                    </JiraLink>
                  </td>
                ))}
                <td className="data-table__td data-table__td--health">
                  <JiraLink href={r.hs !== null && r.hs < 100 ? rmDailyHealthScoreLink(r.date, year) : null}>
                    <div className="health-bar" style={{ '--hc': hc }}>
                      <div className="health-bar__track">
                        <div className="health-bar__fill" style={{ width: `${r.hs ?? 0}%` }} />
                      </div>
                      <span className="health-bar__val">{r.hs}</span>
                    </div>
                  </JiraLink>
                </td>
              </tr>
            );
          })}
        </tbody>

        {totals && (
          <tfoot>
            <tr className="data-table__foot-row">
              <td className="data-table__tfoot-cell data-table__tfoot-cell--label">Total</td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--val">
                <JiraLink href={totals.t > 0 ? rmMonthlyTicketsLink(year, month) : null} plain>
                  {totals.t}
                </JiraLink>
              </td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--val">
                <JiraLink href={totals.d > 0 ? rmMonthlyDefectsLink(year, month) : null} plain>
                  {totals.d}
                </JiraLink>
              </td>
              {PRIORITY_DEFS.map(p => (
                <td key={p.key} className="data-table__tfoot-cell data-table__tfoot-cell--center">
                  <JiraLink href={totals[p.key] > 0 ? rmMonthlyPriorityLink(year, month, p.jira) : null}>
                    <Chip value={totals[p.key]} color={p.color} />
                  </JiraLink>
                </td>
              ))}
              <td className="data-table__tfoot-cell data-table__tfoot-cell--hs">
                <JiraLink href={totals.hs !== null && totals.hs < 100 ? rmMonthlyHealthScoreLink(year, month) : null} plain>
                  {totals.hs}
                </JiraLink>
              </td>
            </tr>
          </tfoot>
        )}
      </table>

      {rows.length >= 2 && (
        <div className="metrics-table__trend">
          <span className="metrics-table__trend-label">Health score trend</span>
          <Sparkline values={rows.map(r => r.hs)} color="#0284c7" />
        </div>
      )}

      {/* ── Mobile card layout ── */}
      <div className="card-list">
        {displayRows.map((r, i) => {
          if (r.isRollup) {
            return (
              <div key={`rollup-card-${i}`} className="card-list__item card-list__item--week-rollup">
                <div className="card-list__title">↳ {r.label}</div>
                <div className="card-list__row">
                  <span className="card-list__key">Total Tickets</span>
                  <span>{r.t || '—'}</span>
                </div>
                <div className="card-list__row">
                  <span className="card-list__key">Total Defects</span>
                  <span>{r.d || '—'}</span>
                </div>
                <div className="card-list__row">
                  <span className="card-list__key">Avg Health</span>
                  <span style={{ fontWeight: 600, color: healthColor(r.hs) }}>{r.hs ?? '—'}</span>
                </div>
              </div>
            );
          }

          const hc      = healthColor(r.hs);
          const isToday = r.date === todayStr;
          return (
            <div key={i} className={`card-list__item${isToday ? ' card-list__item--today' : ''}`}>
              <div className="card-list__title card-list__title--date">
                {isToday && <span className="today-badge">Today</span>}
                {r.date}
              </div>
              <div className="card-list__row">
                <span className="card-list__key">Total Tickets</span>
                <JiraLink href={r.t > 0 ? rmDailyTicketsLink(r.date, year) : null} plain>{r.t}</JiraLink>
              </div>
              <div className="card-list__row">
                <span className="card-list__key">Total Defects</span>
                <JiraLink href={r.d > 0 ? rmDailyDefectsLink(r.date, year) : null} plain>{r.d}</JiraLink>
              </div>
              {PRIORITY_DEFS.map(p => (
                <div key={p.key} className="card-list__row">
                  <span className="card-list__key">{p.jira}</span>
                  <JiraLink href={r[p.key] > 0 ? rmDailyPriorityLink(r.date, year, p.jira) : null}>
                    <Chip value={r[p.key]} color={p.color} />
                  </JiraLink>
                </div>
              ))}
              <div className="card-list__row">
                <span className="card-list__key">Health Score</span>
                <JiraLink href={r.hs !== null && r.hs < 100 ? rmDailyHealthScoreLink(r.date, year) : null}>
                  <span className="card-list__health-val" style={{ '--hc': hc }}>{r.hs ?? '—'}</span>
                </JiraLink>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

DailyMetricsTable.propTypes = {
  rows:   PropTypes.arrayOf(PropTypes.object).isRequired,
  totals: PropTypes.object,
  year:   PropTypes.string.isRequired,
  month:  PropTypes.string.isRequired,
};
