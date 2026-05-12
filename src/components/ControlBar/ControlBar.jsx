import PropTypes from 'prop-types';
import './ControlBar.scss';

export default function ControlBar({ year, month, years, months, onYearChange, onMonthChange }) {
  const monthsForYear = months.filter(m => m.year === year);

  return (
    <div className="control-bar">
      <div className="control-bar__inner">
        <span className="control-bar__label">Period</span>
        <div className="control-bar__selects">
          <select
            className="control-bar__select"
            value={year}
            onChange={e => onYearChange(e.target.value)}
            aria-label="Select year"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            className="control-bar__select"
            value={month}
            onChange={e => onMonthChange(e.target.value)}
            aria-label="Select month"
          >
            {monthsForYear.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

ControlBar.propTypes = {
  year:          PropTypes.string.isRequired,
  month:         PropTypes.string.isRequired,
  years:         PropTypes.arrayOf(PropTypes.string).isRequired,
  months:        PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
    year:  PropTypes.string,
  })).isRequired,
  onYearChange:  PropTypes.func.isRequired,
  onMonthChange: PropTypes.func.isRequired,
};
