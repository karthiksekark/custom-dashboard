import PropTypes from 'prop-types';
import { healthColor } from '../../services/healthUtils';
import JiraLink from '../JiraLink/JiraLink';
import {
  quarterTotalTicketsLink,
  quarterTotalDefectsLink,
  quarterPriorityLink,
  tabQuarterRegressionLink,
  tabQuarterFastPathLink,
} from '../../services/jiraLinks';
import './TabQuarterCard.scss';

export default function TabQuarterCard({ quarter, isActive, components }) {
  const { q, period, days, tickets, defects, rg, fp, c, h, m, l, hs, acc, startDate, endDate } = quarter;
  const empty = days === 0;
  const hc    = healthColor(hs);

  const rows = [
    { label: 'Release Days',       val: empty ? '—' : days,    link: null,                                                       color: null       },
    { label: 'Total Tickets',      val: empty ? '—' : tickets, link: quarterTotalTicketsLink(startDate, endDate, components),     color: '#334155'  },
    { label: 'Total Defects',      val: empty ? '—' : defects, link: quarterTotalDefectsLink(startDate, endDate, components),     color: '#334155'  },
    { label: 'Regression Defects', val: empty ? '—' : rg,      link: tabQuarterRegressionLink(startDate, endDate, components),   color: '#7c3aed'  },
    { label: 'Fast-Path Tickets',  val: empty ? '—' : fp,      link: tabQuarterFastPathLink(startDate, endDate, components),     color: '#0369a1'  },
    { label: 'Critical',           val: empty ? '—' : c,       link: quarterPriorityLink(startDate, endDate, 'Critical', components), color: '#dc2626' },
    { label: 'High',               val: empty ? '—' : h,       link: quarterPriorityLink(startDate, endDate, 'High', components),    color: '#ea580c' },
    { label: 'Medium',             val: empty ? '—' : m,       link: quarterPriorityLink(startDate, endDate, 'Medium', components),  color: '#ca8a04' },
    { label: 'Low',                val: empty ? '—' : l,       link: quarterPriorityLink(startDate, endDate, 'Low', components),     color: '#0284c7' },
    { label: 'Avg. Health',        val: empty ? '—' : hs,      link: null,                                                       color: hc         },
  ];

  const cls = [
    'tqc',
    empty    ? 'tqc--empty'  : '',
    isActive ? 'tqc--active' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cls} style={{ '--acc': acc, '--hc': hc }}>
      <div className="tqc__header">
        <div>
          <div className="tqc__title">{q}</div>
          <div className="tqc__period">{period}</div>
        </div>
        <div className="tqc__badge">
          {empty ? 'Upcoming' : hs}
        </div>
      </div>

      {rows.map(({ label, val, link, color }, i) => (
        <div key={label} className={`tqc__row${i % 2 ? '' : ' tqc__row--alt'}`}>
          <span className="tqc__label">{label}</span>

          {label === 'Avg. Health' && !empty ? (
            <div className="tqc__health">
              <div className="tqc__bar">
                <div className="tqc__fill" style={{ width: `${val}%` }} />
              </div>
              <span className="tqc__health-val">{val}</span>
            </div>
          ) : (
            <JiraLink href={!empty ? link : null}>
              <span
                className="tqc__val"
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

TabQuarterCard.propTypes = {
  quarter: PropTypes.shape({
    q:         PropTypes.string,
    period:    PropTypes.string,
    days:      PropTypes.number,
    tickets:   PropTypes.number,
    defects:   PropTypes.number,
    rg:        PropTypes.number,
    fp:        PropTypes.number,
    c:         PropTypes.number,
    h:         PropTypes.number,
    m:         PropTypes.number,
    l:         PropTypes.number,
    hs:        PropTypes.number,
    acc:       PropTypes.string,
    startDate: PropTypes.string,
    endDate:   PropTypes.string,
  }).isRequired,
  isActive:   PropTypes.bool,
  components: PropTypes.string,
};
