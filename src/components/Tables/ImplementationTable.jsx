import PropTypes from 'prop-types';
import Chip from '../Chip/Chip';
import JiraLink from '../JiraLink/JiraLink';
import { implTeamFieldLink, implConsolidatedFieldLink } from '../../services/jiraLinks';
import { TEAMS } from '../../config/teams.config';
import './Tables.scss';

const LABEL_TO_COMPS = Object.fromEntries(
  TEAMS.filter(t => t.defaultComponents).map(t => [t.label, t.defaultComponents])
);

const COLS         = ['Owner & Testing Teams', 'UAT', 'OPUAT', 'CR_UAT', 'BIZ_VAL', 'Total'];
const TICKET_FIELDS = ['UAT', 'OPUAT', 'CR_UAT', 'BIZ_VAL'];

function chipColor(v) {
  if (v > 4) return '#ea580c';
  if (v > 2) return '#ca8a04';
  return '#0284c7';
}

function computeTotals(rows) {
  return TICKET_FIELDS.reduce(
    (acc, f) => { acc[f] = rows.reduce((s, r) => s + (r[f] || 0), 0); return acc; },
    { Total: rows.reduce((s, r) => s + (r.Total || 0), 0) }
  );
}

export default function ImplementationTable({ rows, todayIso }) {
  const totals = computeTotals(rows);

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
          {rows.map((r, i) => (
            <tr key={i} className="data-table__row wr">
              <td className="data-table__td data-table__td--name">{r.team}</td>
              {TICKET_FIELDS.map(f => (
                <td key={f} className="data-table__td data-table__td--center">
                  <JiraLink href={r[f] > 0 ? implTeamFieldLink(LABEL_TO_COMPS[r.team], f, todayIso) : null}>
                    <Chip value={r[f]} color={chipColor(r[f])} />
                  </JiraLink>
                </td>
              ))}
              <td className="data-table__td data-table__td--center">
                <JiraLink href={r.Total > 0 ? implTeamFieldLink(LABEL_TO_COMPS[r.team], 'Total', todayIso) : null}>
                  <Chip value={r.Total} color="#0369a1" />
                </JiraLink>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="data-table__foot-row data-table__foot-row--consolidated">
            <td className="data-table__tfoot-cell data-table__tfoot-cell--label">Consolidated Total</td>
            {TICKET_FIELDS.map(f => (
              <td key={f} className="data-table__tfoot-cell data-table__tfoot-cell--center">
                <JiraLink href={totals[f] > 0 ? implConsolidatedFieldLink(f, todayIso) : null}>
                  <Chip value={totals[f]} color={chipColor(totals[f])} />
                </JiraLink>
              </td>
            ))}
            <td className="data-table__tfoot-cell data-table__tfoot-cell--center">
              <JiraLink href={totals.Total > 0 ? implConsolidatedFieldLink('Total', todayIso) : null}>
                <Chip value={totals.Total} color="#0369a1" />
              </JiraLink>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* ── Mobile card layout ── */}
      <div className="card-list">
        {rows.map((r, i) => (
          <div key={i} className="card-list__item">
            <div className="card-list__title">{r.team}</div>
            {TICKET_FIELDS.map(f => (
              <div key={f} className="card-list__row">
                <span className="card-list__key">{f}</span>
                <JiraLink href={r[f] > 0 ? implTeamFieldLink(LABEL_TO_COMPS[r.team], f, todayIso) : null}>
                  <Chip value={r[f]} color={chipColor(r[f])} />
                </JiraLink>
              </div>
            ))}
            <div className="card-list__row card-list__row--total">
              <span className="card-list__key">Total</span>
              <JiraLink href={r.Total > 0 ? implTeamFieldLink(LABEL_TO_COMPS[r.team], 'Total', todayIso) : null}>
                <Chip value={r.Total} color="#0369a1" />
              </JiraLink>
            </div>
          </div>
        ))}
        {/* Consolidated total card */}
        <div className="card-list__item card-list__item--consolidated">
          <div className="card-list__title card-list__title--consolidated">Consolidated Total</div>
          {TICKET_FIELDS.map(f => (
            <div key={f} className="card-list__row">
              <span className="card-list__key">{f}</span>
              <JiraLink href={totals[f] > 0 ? implConsolidatedFieldLink(f, todayIso) : null}>
                <Chip value={totals[f]} color={chipColor(totals[f])} />
              </JiraLink>
            </div>
          ))}
          <div className="card-list__row card-list__row--total">
            <span className="card-list__key">Total</span>
            <JiraLink href={totals.Total > 0 ? implConsolidatedFieldLink('Total', todayIso) : null}>
              <Chip value={totals.Total} color="#0369a1" />
            </JiraLink>
          </div>
        </div>
      </div>
    </div>
  );
}

ImplementationTable.propTypes = {
  rows:     PropTypes.arrayOf(PropTypes.object).isRequired,
  todayIso: PropTypes.string,
};
