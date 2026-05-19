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
} from '../../services/jiraLinks';
import './Tables.scss';

const EST  = 'America/New_York';
const COLS = ['Release Date', 'Total Tickets', 'Total Defects', 'Critical', 'High', 'Medium', 'Low', 'Health Score'];

const PRIORITY_DEFS = [
  { key: 'c', jira: 'Critical', color: '#dc2626' },
  { key: 'h', jira: 'High',    color: '#ea580c' },
  { key: 'm', jira: 'Medium',  color: '#ca8a04' },
  { key: 'l', jira: 'Low',     color: '#0284c7' },
];

export default function DailyMetricsTable({ rows, totals, year, month, components }) {
  const todayStr = moment().tz(EST).format('M/D');

  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr className="data-table__head-row">
            {COLS.map((h, i) => (
              <th key={h} className={`data-table__th${i === 0 ? ' data-table__th--left' : ''}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const hc      = healthColor(r.hs);
            const isToday = r.date === todayStr;
            const rowCls  = [
              'data-table__row wr',
              i % 2 ? '' : 'data-table__row--alt',
              isToday ? 'data-table__row--today' : '',
            ].filter(Boolean).join(' ');

            return (
              <tr key={i} className={rowCls}>
                <td className="data-table__td data-table__td--date">
                  {isToday && <span className="today-badge">Today</span>}
                  {r.date}
                </td>
                <td className="data-table__td data-table__td--num">
                  <JiraLink href={dailyTotalTicketsLink(r.date, year, components)} plain>
                    {r.t}
                  </JiraLink>
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
                <td className="data-table__td data-table__td--health">
                  <div className="health-bar" style={{ '--hc': hc }}>
                    <div className="health-bar__track">
                      <div className="health-bar__fill" style={{ width: `${r.hs ?? 0}%` }} />
                    </div>
                    <span className="health-bar__val">{r.hs}</span>
                  </div>
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
                <JiraLink href={monthlyTotalTicketsLink(year, month, components)} plain>
                  {totals.t}
                </JiraLink>
              </td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--val">
                <JiraLink href={monthlyTotalDefectsLink(year, month, components)} plain>
                  {totals.d}
                </JiraLink>
              </td>
              {PRIORITY_DEFS.map(p => (
                <td key={p.key} className="data-table__tfoot-cell data-table__tfoot-cell--center">
                  <JiraLink href={monthlyPriorityLink(year, month, p.jira, components)}>
                    <Chip value={totals[p.key]} color={p.color} />
                  </JiraLink>
                </td>
              ))}
              <td className="data-table__tfoot-cell data-table__tfoot-cell--hs">{totals.hs}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* ── Mobile card layout ── */}
      <div className="card-list">
        {rows.map((r, i) => {
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
                <JiraLink href={dailyTotalTicketsLink(r.date, year, components)} plain>{r.t}</JiraLink>
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

DailyMetricsTable.propTypes = {
  rows:       PropTypes.arrayOf(PropTypes.object).isRequired,
  totals:     PropTypes.object,
  year:       PropTypes.string.isRequired,
  month:      PropTypes.string.isRequired,
  components: PropTypes.string,
};
