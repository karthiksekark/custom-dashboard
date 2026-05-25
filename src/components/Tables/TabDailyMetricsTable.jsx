import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Chip from '../Chip/Chip';
import JiraLink from '../JiraLink/JiraLink';
import { healthColor } from '../../services/healthUtils';
import {
  dailyTotalTicketsLink,
  dailyTotalDefectsLink,
  dailyPriorityLink,
  monthlyTotalTicketsLink,
  monthlyTotalDefectsLink,
  monthlyPriorityLink,
  tabDailyRegressionLink,
  tabDailyFastPathLink,
  tabDailyDirectPubLink,
  tabMonthlyRegressionLink,
  tabMonthlyFastPathLink,
  tabMonthlyDirectPubLink,
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

const EST = 'America/New_York';

const PRIORITY_DEFS = [
  { key: 'c', jira: 'Critical', color: '#dc2626' },
  { key: 'h', jira: 'High',    color: '#ea580c' },
  { key: 'm', jira: 'Medium',  color: '#ca8a04' },
  { key: 'l', jira: 'Low',     color: '#0284c7' },
];

const HEADER_TOOLTIPS = {
  'Regression': 'Regression defects filed during this release',
  'Fast-Path':  'Tickets released via fast-path process',
  'Direct-Pub': 'Tickets released via direct publishing',
  'Health Score': 'Calculated as (Tickets − Defects) / Tickets × 100',
};

const COL_SORT = {
  'Date': 'date', 'Total Defects': 'd',
  'Critical': 'c', 'High': 'h', 'Medium': 'm', 'Low': 'l',
  'Regression': 'rg', 'Total Tickets': 't',
  'Fast-Path': 'fp', 'Direct-Pub': 'dp', 'Health Score': 'hs',
};

const HEADERS = [
  'Date', 'Total Defects', 'Critical', 'High', 'Medium', 'Low',
  'Regression', 'Total Tickets', 'Fast-Path', 'Direct-Pub', 'Health Score',
];

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

function ThCell({ label, colSortKey, activeSortKey, sortDir, onSort }) {
  const tip      = HEADER_TOOLTIPS[label];
  const isSorted = activeSortKey === colSortKey;
  const indicator = isSorted ? (sortDir === 'asc' ? '↑' : '↓') : '↕';

  return (
    <th
      className={`data-table__th${colSortKey ? ' data-table__th--sortable' : ''}`}
      onClick={colSortKey ? () => onSort(colSortKey) : undefined}
      aria-sort={colSortKey ? (isSorted ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none') : undefined}
    >
      {tip ? (
        <span className="th-tip">
          {label} <span className="th-tip__icon">ⓘ</span>
          <span className="th-tip__text">{tip}</span>
        </span>
      ) : label}
      {colSortKey && (
        <span className={`sort-icon${isSorted ? ' sort-icon--active' : ''}`}>
          {indicator}
        </span>
      )}
    </th>
  );
}

ThCell.propTypes = {
  label:         PropTypes.string.isRequired,
  colSortKey:    PropTypes.string,
  activeSortKey: PropTypes.string,
  sortDir:       PropTypes.string,
  onSort:        PropTypes.func,
};

export default function TabDailyMetricsTable({ rows, totals, year, month, components }) {
  const todayStr = moment().tz(EST).format('M/D');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  function handleSort(key) {
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
            {HEADERS.map(h => (
              <ThCell
                key={h}
                label={h}
                colSortKey={COL_SORT[h]}
                activeSortKey={sortKey}
                sortDir={sortDir}
                onSort={handleSort}
              />
            ))}
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
                  <td className="data-table__td data-table__td--num">{r.d || '—'}</td>
                  {PRIORITY_DEFS.map(p => (
                    <td key={p.key} className="data-table__td data-table__td--center">
                      <Chip value={r[p.key] || null} color={p.color} />
                    </td>
                  ))}
                  <td className="data-table__td data-table__td--center">
                    <Chip value={r.rg || null} color="#7c3aed" />
                  </td>
                  <td className="data-table__td data-table__td--num">{r.t || '—'}</td>
                  <td className="data-table__td data-table__td--center">
                    <Chip value={r.fp || null} color="#0369a1" />
                  </td>
                  <td className="data-table__td data-table__td--center">
                    <Chip value={r.dp || null} color="#16a34a" />
                  </td>
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
                  <JiraLink href={dailyTotalDefectsLink(r.date, year, components)} plain>
                    {r.d}
                  </JiraLink>
                </td>
                {PRIORITY_DEFS.map(p => (
                  <td key={p.key} className="data-table__td data-table__td--center">
                    <JiraLink href={dailyPriorityLink(r.date, year, p.jira, components)}>
                      <Chip value={r[p.key]} color={p.color} />
                    </JiraLink>
                  </td>
                ))}
                <td className="data-table__td data-table__td--center">
                  <JiraLink href={tabDailyRegressionLink(r.date, year, components)}>
                    <Chip value={r.rg} color="#7c3aed" />
                  </JiraLink>
                </td>
                <td className="data-table__td data-table__td--num">
                  <JiraLink href={dailyTotalTicketsLink(r.date, year, components)} plain>
                    {r.t}
                  </JiraLink>
                </td>
                <td className="data-table__td data-table__td--center">
                  <JiraLink href={tabDailyFastPathLink(r.date, year, components)}>
                    <Chip value={r.fp} color="#0369a1" />
                  </JiraLink>
                </td>
                <td className="data-table__td data-table__td--center">
                  <JiraLink href={tabDailyDirectPubLink(r.date, year, components)}>
                    <Chip value={r.dp} color="#16a34a" />
                  </JiraLink>
                </td>
                <td className="data-table__td data-table__td--health">
                  {r.t === 0 ? (
                    <span style={{ color: '#94a3b8', fontSize: 11 }}>No Release</span>
                  ) : (
                    <div className="health-bar" style={{ '--hc': hc }}>
                      <div className="health-bar__track">
                        <div className="health-bar__fill" style={{ width: `${r.hs ?? 0}%` }} />
                      </div>
                      <span className="health-bar__val">{r.hs}</span>
                    </div>
                  )}
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
                <JiraLink href={monthlyTotalDefectsLink(year, month, components)} plain>
                  {totals.d}
                </JiraLink>
              </td>
              {PRIORITY_DEFS.map(p => (
                <td key={p.key} className="data-table__tfoot-cell data-table__tfoot-cell--center">
                  <JiraLink href={monthlyPriorityLink(year, month, p.jira, components)}>
                    <Chip value={totals[p.key] || null} color={p.color} />
                  </JiraLink>
                </td>
              ))}
              <td className="data-table__tfoot-cell data-table__tfoot-cell--center">
                <JiraLink href={tabMonthlyRegressionLink(year, month, components)}>
                  <Chip value={totals.rg || null} color="#7c3aed" />
                </JiraLink>
              </td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--val">
                <JiraLink href={monthlyTotalTicketsLink(year, month, components)} plain>
                  {totals.t}
                </JiraLink>
              </td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--center">
                <JiraLink href={tabMonthlyFastPathLink(year, month, components)}>
                  <Chip value={totals.fp || null} color="#0369a1" />
                </JiraLink>
              </td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--center">
                <JiraLink href={tabMonthlyDirectPubLink(year, month, components)}>
                  <Chip value={totals.dp || null} color="#16a34a" />
                </JiraLink>
              </td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--hs"
                  style={{ color: healthColor(totals.hs) }}>
                {totals.hs ?? '—'}
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
                <span className="card-list__key">Total Defects</span>
                <JiraLink href={dailyTotalDefectsLink(r.date, year, components)} plain>{r.d}</JiraLink>
              </div>
              {PRIORITY_DEFS.map(p => (
                <div key={p.key} className="card-list__row">
                  <span className="card-list__key">{p.jira}</span>
                  <JiraLink href={dailyPriorityLink(r.date, year, p.jira, components)}>
                    <Chip value={r[p.key]} color={p.color} />
                  </JiraLink>
                </div>
              ))}
              <div className="card-list__row">
                <span className="card-list__key">Regression</span>
                <JiraLink href={tabDailyRegressionLink(r.date, year, components)}>
                  <Chip value={r.rg} color="#7c3aed" />
                </JiraLink>
              </div>
              <div className="card-list__row">
                <span className="card-list__key">Total Tickets</span>
                <JiraLink href={dailyTotalTicketsLink(r.date, year, components)} plain>{r.t}</JiraLink>
              </div>
              <div className="card-list__row">
                <span className="card-list__key">Fast-Path</span>
                <JiraLink href={tabDailyFastPathLink(r.date, year, components)}>
                  <Chip value={r.fp} color="#0369a1" />
                </JiraLink>
              </div>
              <div className="card-list__row">
                <span className="card-list__key">Direct-Publishing</span>
                <JiraLink href={tabDailyDirectPubLink(r.date, year, components)}>
                  <Chip value={r.dp} color="#16a34a" />
                </JiraLink>
              </div>
              <div className="card-list__row">
                <span className="card-list__key">Health Score</span>
                <span className="card-list__health-val" style={{ '--hc': hc }}>{r.hs ?? '—'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

TabDailyMetricsTable.propTypes = {
  rows:       PropTypes.arrayOf(PropTypes.object).isRequired,
  totals:     PropTypes.object,
  year:       PropTypes.string.isRequired,
  month:      PropTypes.string.isRequired,
  components: PropTypes.string,
};
