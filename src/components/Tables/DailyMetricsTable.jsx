import PropTypes from 'prop-types';
import Chip from '../Chip/Chip';
import { healthColor } from '../../services/healthUtils';
import './Tables.scss';

const COLS = ['Release Date', 'Total Tickets', 'Total Defects', 'Critical', 'High', 'Medium', 'Low', 'Health Score'];

export default function DailyMetricsTable({ rows, totals }) {
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
            const hc = healthColor(r.hs);
            return (
              <tr key={i} className={`data-table__row wr${i % 2 ? '' : ' data-table__row--alt'}`}>
                <td className="data-table__td data-table__td--date">{r.date}</td>
                <td className="data-table__td data-table__td--num data-table__td--underline">{r.t}</td>
                <td className="data-table__td data-table__td--num data-table__td--underline">{r.d}</td>
                <td className="data-table__td data-table__td--center"><Chip value={r.c} color="#dc2626" /></td>
                <td className="data-table__td data-table__td--center"><Chip value={r.h} color="#ea580c" /></td>
                <td className="data-table__td data-table__td--center"><Chip value={r.m} color="#ca8a04" /></td>
                <td className="data-table__td data-table__td--center"><Chip value={r.l} color="#0284c7" /></td>
                <td className="data-table__td data-table__td--health">
                  <div className="health-bar">
                    <div className="health-bar__track">
                      <div className="health-bar__fill" style={{ width: `${r.hs ?? 0}%`, background: hc }} />
                    </div>
                    <span className="health-bar__val" style={{ color: hc }}>{r.hs}</span>
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
              <td className="data-table__tfoot-cell data-table__tfoot-cell--val">{totals.t}</td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--val">{totals.d}</td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--center"><Chip value={totals.c} color="#dc2626" /></td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--center"><Chip value={totals.h} color="#ea580c" /></td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--center"><Chip value={totals.m} color="#ca8a04" /></td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--center"><Chip value={totals.l} color="#0284c7" /></td>
              <td className="data-table__tfoot-cell data-table__tfoot-cell--hs">{totals.hs}</td>
            </tr>
          </tfoot>
        )}
      </table>

      {/* Mobile card layout */}
      <div className="card-list">
        {rows.map((r, i) => {
          const hc = healthColor(r.hs);
          return (
            <div key={i} className="card-list__item">
              <div className="card-list__title card-list__title--date">{r.date}</div>
              {[['Total Tickets', r.t, '#334155'], ['Total Defects', r.d, '#334155'], ['Critical', r.c, '#dc2626'], ['High', r.h, '#ea580c'], ['Medium', r.m, '#ca8a04'], ['Low', r.l, '#0284c7']].map(([k, v, col]) => (
                <div key={k} className="card-list__row">
                  <span className="card-list__key">{k}</span>
                  {k === 'Total Tickets' || k === 'Total Defects'
                    ? <span className="card-list__plain" style={{ color: col }}>{v}</span>
                    : <Chip value={v} color={col} />}
                </div>
              ))}
              <div className="card-list__row">
                <span className="card-list__key">Health Score</span>
                <span style={{ color: hc, fontWeight: 700, fontSize: 12 }}>{r.hs ?? '—'}</span>
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
};
