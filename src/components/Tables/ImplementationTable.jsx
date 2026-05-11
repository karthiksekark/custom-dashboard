import PropTypes from 'prop-types';
import Chip from '../Chip/Chip';
import './Tables.scss';

const COLS = ['Owner & Testing Teams', 'UAT', 'OPUAT', 'CR_UAT', 'BIZ_VAL', 'Total'];
const TICKET_FIELDS = ['UAT', 'OPUAT', 'CR_UAT', 'BIZ_VAL'];

function chipColor(v) {
  if (v > 4) return '#ea580c';
  if (v > 2) return '#ca8a04';
  return '#0284c7';
}

export default function ImplementationTable({ rows }) {
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
                  <Chip value={r[f]} color={chipColor(r[f])} />
                </td>
              ))}
              <td className="data-table__td data-table__td--center">
                <Chip value={r.Total} color="#0369a1" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile card layout */}
      <div className="card-list">
        {rows.map((r, i) => (
          <div key={i} className="card-list__item">
            <div className="card-list__title">{r.team}</div>
            {TICKET_FIELDS.map(f => (
              <div key={f} className="card-list__row">
                <span className="card-list__key">{f}</span>
                <Chip value={r[f]} color={chipColor(r[f])} />
              </div>
            ))}
            <div className="card-list__row card-list__row--total">
              <span className="card-list__key">Total</span>
              <Chip value={r.Total} color="#0369a1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

ImplementationTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};
