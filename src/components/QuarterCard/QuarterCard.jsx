import PropTypes from 'prop-types';
import { healthColor } from '../../services/healthUtils';
import JiraLink from '../JiraLink/JiraLink';
import {
  quarterTotalTicketsLink,
  quarterTotalDefectsLink,
  quarterPriorityLink,
} from '../../services/jiraLinks';
import { useAppContext } from '../../hooks/useAppContext';
import './QuarterCard.scss';

export default function QuarterCard({ quarter, isActive }) {
  const { state }  = useAppContext();
  const components = state.preferences.components;
  const { q, period, days, tickets, defects, c, h, m, l, hs, acc, startDate, endDate } = quarter;
  const empty = days === 0;
  const hc    = healthColor(hs);

  const rows = [
    { label: 'Release Days',  val: empty ? '—' : days,    link: null,                                               color: null       },
    { label: 'Total Tickets', val: empty ? '—' : tickets, link: quarterTotalTicketsLink(startDate, endDate, components),        color: '#334155'  },
    { label: 'Total Defects', val: empty ? '—' : defects, link: quarterTotalDefectsLink(startDate, endDate, components),        color: '#334155'  },
    { label: 'Critical',      val: empty ? '—' : c,       link: quarterPriorityLink(startDate, endDate, 'Critical', components),color: '#dc2626'  },
    { label: 'High',          val: empty ? '—' : h,       link: quarterPriorityLink(startDate, endDate, 'High', components),    color: '#ea580c'  },
    { label: 'Medium',        val: empty ? '—' : m,       link: quarterPriorityLink(startDate, endDate, 'Medium', components),  color: '#ca8a04'  },
    { label: 'Low',           val: empty ? '—' : l,       link: quarterPriorityLink(startDate, endDate, 'Low', components),     color: '#0284c7'  },
    { label: 'Avg. Health',   val: empty ? '—' : hs,      link: null,                                               color: hc         },
  ];

  const modifiers = [
    'quarter-card',
    empty    ? 'quarter-card--empty'  : '',
    isActive ? 'quarter-card--active' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={modifiers} style={{ '--acc': acc, '--hc': hc }}>
      <div className="quarter-card__header">
        <div>
          <div className="quarter-card__title">{q}</div>
          <div className="quarter-card__period">{period}</div>
        </div>
        <div className="quarter-card__badge">
          {empty ? 'Upcoming' : hs}
        </div>
      </div>

      {rows.map(({ label, val, link, color }, i) => (
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
            <JiraLink href={!empty ? link : null}>
              <span
                className="quarter-card__val"
                style={!empty && color ? { color, fontWeight: 600 } : {}}
              >
                {val}
              </span>
            </JiraLink>
          )}
        </div>
      ))}
    </div>
  );
}

QuarterCard.propTypes = {
  quarter: PropTypes.shape({
    q:         PropTypes.string,
    period:    PropTypes.string,
    days:      PropTypes.number,
    tickets:   PropTypes.number,
    defects:   PropTypes.number,
    c:         PropTypes.number,
    h:         PropTypes.number,
    m:         PropTypes.number,
    l:         PropTypes.number,
    hs:        PropTypes.number,
    acc:       PropTypes.string,
    startDate: PropTypes.string,
    endDate:   PropTypes.string,
  }).isRequired,
  isActive: PropTypes.bool,
};
