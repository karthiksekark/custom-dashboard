import PropTypes from 'prop-types';
import Chip from '../Chip/Chip';
import JiraLink from '../JiraLink/JiraLink';
import { statusDot } from '../../services/healthUtils';
import { defectStatusPriorityLink, defectConsolidatedLink } from '../../services/jiraLinks';
import { useAppContext } from '../../hooks/useAppContext';
import './Tables.scss';

const COLS       = ['Status', 'Critical', 'High', 'Medium', 'Low', 'Total'];
const PRIORITIES = [
  { key: 'critical', label: 'Critical', color: '#dc2626', jiraName: 'Critical' },
  { key: 'high',     label: 'High',     color: '#ea580c', jiraName: 'High'     },
  { key: 'medium',   label: 'Medium',   color: '#ca8a04', jiraName: 'Medium'   },
  { key: 'low',      label: 'Low',      color: '#0284c7', jiraName: 'Low'      },
];

function computeTotals(rows) {
  return PRIORITIES.reduce(
    (acc, p) => { acc[p.key] = rows.reduce((s, r) => s + (r[p.key] || 0), 0); return acc; },
    { total: rows.reduce((s, r) => s + (r.total || 0), 0) }
  );
}

export default function DefectsAlertTable({ rows, todayIso }) {
  const { state }  = useAppContext();
  const components = state.preferences.components;
  const totals     = computeTotals(rows);

  return (
    <div className="table-scroll">
      <table className="data-table data-table--alert">
        <thead>
          <tr className="data-table__head-row data-table__head-row--alert">
            {COLS.map((h, i) => (
              <th key={h} className={`data-table__th${i === 0 ? ' data-table__th--left' : ''} data-table__th--alert`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="data-table__row wr">
              <td className="data-table__td data-table__td--status">
                <span className="status-dot" style={{ '--dot': statusDot(r.status) }} />
                {r.status}
              </td>
              {PRIORITIES.map(p => (
                <td key={p.key} className="data-table__td data-table__td--center">
                  <JiraLink href={defectStatusPriorityLink(r.status, p.jiraName, todayIso, components)}>
                    <Chip value={r[p.key]} color={p.color} />
                  </JiraLink>
                </td>
              ))}
              <td className="data-table__td data-table__td--center">
                <JiraLink href={defectStatusPriorityLink(r.status, null, todayIso, components)}>
                  <Chip value={r.total} color="#0369a1" />
                </JiraLink>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="data-table__foot-row data-table__foot-row--consolidated data-table__foot-row--alert">
            <td className="data-table__tfoot-cell data-table__tfoot-cell--label">All Statuses</td>
            {PRIORITIES.map(p => (
              <td key={p.key} className="data-table__tfoot-cell data-table__tfoot-cell--center">
                <JiraLink href={defectConsolidatedLink(p.jiraName, todayIso, components)}>
                  <Chip value={totals[p.key]} color={p.color} />
                </JiraLink>
              </td>
            ))}
            <td className="data-table__tfoot-cell data-table__tfoot-cell--center">
              <JiraLink href={defectConsolidatedLink(null, todayIso, components)}>
                <Chip value={totals.total} color="#0369a1" />
              </JiraLink>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── Mobile card layout ── */}
      <div className="card-list">
        {rows.map((r, i) => (
          <div key={i} className="card-list__item card-list__item--alert">
            <div className="card-list__title">
              <span className="status-dot" style={{ '--dot': statusDot(r.status) }} />
              {r.status}
            </div>
            {PRIORITIES.map(p => (
              <div key={p.key} className="card-list__row">
                <span className="card-list__key">{p.label}</span>
                <JiraLink href={defectStatusPriorityLink(r.status, p.jiraName, todayIso, components)}>
                  <Chip value={r[p.key]} color={p.color} />
                </JiraLink>
              </div>
            ))}
            <div className="card-list__row">
              <span className="card-list__key">Total</span>
              <JiraLink href={defectStatusPriorityLink(r.status, null, todayIso, components)}>
                <Chip value={r.total} color="#0369a1" />
              </JiraLink>
            </div>
          </div>
        ))}
        {/* Consolidated total card */}
        <div className="card-list__item card-list__item--consolidated card-list__item--alert">
          <div className="card-list__title card-list__title--consolidated">All Statuses</div>
          {PRIORITIES.map(p => (
            <div key={p.key} className="card-list__row">
              <span className="card-list__key">{p.label}</span>
              <JiraLink href={defectConsolidatedLink(p.jiraName, todayIso, components)}>
                <Chip value={totals[p.key]} color={p.color} />
              </JiraLink>
            </div>
          ))}
          <div className="card-list__row card-list__row--total">
            <span className="card-list__key">Total</span>
            <JiraLink href={defectConsolidatedLink(null, todayIso, components)}>
              <Chip value={totals.total} color="#0369a1" />
            </JiraLink>
          </div>
        </div>
      </div>
    </div>
  );
}

DefectsAlertTable.propTypes = {
  rows:     PropTypes.arrayOf(PropTypes.object).isRequired,
  todayIso: PropTypes.string,
};
