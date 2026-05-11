import PropTypes from 'prop-types';
import './Header.scss';

export default function Header({ year, month, years, months, onYearChange, onMonthChange }) {
  const monthsForYear = months.filter(m => m.year === year);

  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo">J</div>
        <div className="header__titles">
          <div className="header__name">JIRA Dashboard Insights</div>
          <div className="header__sub">Release Intelligence</div>
        </div>
      </div>
      <div className="header__controls">
        <select
          className="header__select"
          value={year}
          onChange={e => onYearChange(e.target.value)}
          aria-label="Select year"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          className="header__select"
          value={month}
          onChange={e => onMonthChange(e.target.value)}
          aria-label="Select month"
        >
          {monthsForYear.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>
    </header>
  );
}

Header.propTypes = {
  year:           PropTypes.string.isRequired,
  month:          PropTypes.string.isRequired,
  years:          PropTypes.arrayOf(PropTypes.string).isRequired,
  months:         PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string, year: PropTypes.string })).isRequired,
  onYearChange:   PropTypes.func.isRequired,
  onMonthChange:  PropTypes.func.isRequired,
};
