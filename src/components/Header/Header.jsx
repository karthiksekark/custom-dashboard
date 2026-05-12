import PropTypes from 'prop-types';
import './Header.scss';

const GEAR_SVG = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

export default function Header({ onOpenSettings, teamName }) {
  const subtitleLabel = teamName || 'Release Intelligence';
  const isFiltered    = !!teamName;

  return (
    <header className={`header${isFiltered ? ' header--filtered' : ''}`}>
      <div className="header__inner">
        <div className="header__brand">
          <div className="header__logo">J</div>
          <div className="header__titles">
            <div className="header__name">JIRA Dashboard Insights</div>
            <div className={`header__sub${isFiltered ? ' header__sub--team' : ''}`}>
              {subtitleLabel}
            </div>
          </div>
        </div>

        <button
          className="header__settings-btn"
          onClick={onOpenSettings}
          aria-label="Open dashboard settings"
          title="Settings"
        >
          {GEAR_SVG}
        </button>
      </div>
    </header>
  );
}

Header.propTypes = {
  onOpenSettings: PropTypes.func.isRequired,
  teamName:       PropTypes.string,
};
