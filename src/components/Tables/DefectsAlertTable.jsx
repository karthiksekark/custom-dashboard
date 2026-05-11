import PropTypes from 'prop-types';
import Chip from '../Chip/Chip';
import { statusDot } from '../../services/healthUtils';
import './Tables.scss';

const COLS = ['Status', 'Critical', 'High', 'Medium', 'Low', 'Total'];

export default function DefectsAlertTable({ rows }) {
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
                <span className="status-dot" style={{ background: statusDot(r.status) }} />
                {r.status}
              </td>
              <td className="data-table__td data-table__td--center"><Chip value={r.critical} color="#dc2626" /></td>
              <td className="data-table__td data-table__td--center"><Chip value={r.high}     color="#ea580c" /></td>
              <td className="data-table__td data-table__td--center"><Chip value={r.medium}   color="#ca8a04" /></td>
              <td className="data-table__td data-table__td--center"><Chip value={r.low}      color="#0284c7" /></td>
              <td className="data-table__td data-table__td--center"><Chip value={r.total}    color="#0369a1" /></td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card-list">
        {rows.map((r, i) => (
          <div key={i} className="card-list__item card-list__item--alert">
            <div className="card-list__title">
              <span className="status-dot" style={{ background: statusDot(r.status) }} />
              {r.status}
            </div>
            {[['Critical', r.critical, '#dc2626'], ['High', r.high, '#ea580c'], ['Medium', r.medium, '#ca8a04'], ['Low', r.low, '#0284c7'], ['Total', r.total, '#0369a1']].map(([k, v, col]) => (
              <div key={k} className="card-list__row">
                <span className="card-list__key">{k}</span>
                <Chip value={v} color={col} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

DefectsAlertTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
};
