import PropTypes from 'prop-types';
import { healthColor } from '../../services/healthUtils';
import './QuarterCard.scss';

export default function QuarterCard({ quarter }) {
  const { q, period, days, tickets, defects, c, h, m, l, hs, acc } = quarter;
  const empty = days === 0;
  const hc = healthColor(hs);

  const rows = [
    ['Release Days',  empty ? '—' : days],
    ['Total Tickets', empty ? '—' : tickets],
    ['Total Defects', empty ? '—' : defects],
    ['Critical',      empty ? '—' : c],
    ['High',          empty ? '—' : h],
    ['Medium',        empty ? '—' : m],
    ['Low',           empty ? '—' : l],
    ['Avg. Health',   empty ? '—' : hs],
  ];

  const rowColors = [null, '#334155', '#334155', '#dc2626', '#ea580c', '#ca8a04', '#0284c7', hc];

  return (
    <div className={`quarter-card${empty ? ' quarter-card--empty' : ''}`} style={{ '--acc': acc, '--hc': hc }}>
      <div className="quarter-card__header">
        <div>
          <div className="quarter-card__title">{q}</div>
          <div className="quarter-card__period">{period}</div>
        </div>
        <div className="quarter-card__badge">
          {empty ? 'Upcoming' : hs}
        </div>
      </div>

      {rows.map(([label, val], i) => (
        <div key={label} className={`quarter-card__row${i % 2 ? '' : ' quarter-card__row--alt'}`}>
          <span className="quarter-card__label">{label}</span>
          {label === 'Avg. Health' && !empty ? (
            <div className="quarter-card__health">
              <div className="quarter-card__bar">
                <div className="quarter-card__fill" style={{ width: `${val}%` }} />
              </div>
              <span className="quarter-card__health-val">{val}</span>
            </div>
          ) : (
            <span
              className="quarter-card__val"
              style={empty ? {} : rowColors[i] ? { color: rowColors[i], fontWeight: 600 } : {}}
            >
              {val}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

QuarterCard.propTypes = {
  quarter: PropTypes.shape({
    q:       PropTypes.string,
    period:  PropTypes.string,
    days:    PropTypes.number,
    tickets: PropTypes.number,
    defects: PropTypes.number,
    c:       PropTypes.number,
    h:       PropTypes.number,
    m:       PropTypes.number,
    l:       PropTypes.number,
    hs:      PropTypes.number,
    acc:     PropTypes.string,
  }).isRequired,
};
