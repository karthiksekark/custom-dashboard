import PropTypes from 'prop-types';
import './ControlBar.scss';

export default function ControlBar({ year, month, day, years, months, days, onYearChange, onMonthChange, onDayChange, onToday }) {
  const monthsForYear = months.filter(m => m.year === year);

  return (
    <div className="control-bar">
      <div className="control-bar__inner">
        <span className="control-bar__label">Period</span>
        <div className="control-bar__selects">
          <select
            className="control-bar__select"
            value={day}
            onChange={e => onDayChange(e.target.value)}
            aria-label="Select day"
          >
            {days.map(d => <option key={d} value={d}>{d}</option>)}
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
          <select
            className="control-bar__select"
            value={year}
            onChange={e => onYearChange(e.target.value)}
            aria-label="Select year"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            type="button"
            className="control-bar__today-btn"
            onClick={onToday}
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
}

ControlBar.propTypes = {
  year:          PropTypes.string.isRequired,
  month:         PropTypes.string.isRequired,
  day:           PropTypes.string.isRequired,
  years:         PropTypes.arrayOf(PropTypes.string).isRequired,
  months:        PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string,
    label: PropTypes.string,
    year:  PropTypes.string,
  })).isRequired,
  days:          PropTypes.arrayOf(PropTypes.string).isRequired,
  onYearChange:  PropTypes.func.isRequired,
  onMonthChange: PropTypes.func.isRequired,
  onDayChange:   PropTypes.func.isRequired,
  onToday:       PropTypes.func.isRequired,
};
