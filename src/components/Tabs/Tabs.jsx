import PropTypes from 'prop-types';
import { TEAMS } from '../../config/teams.config';
import './Tabs.scss';

const TAB_LABELS = TEAMS.map(t => t.label);

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs" role="tablist" aria-label="Dashboard sections">
      <div className="tabs__inner">
        {TAB_LABELS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={active === tab}
            tabIndex={active === tab ? 0 : -1}
            className={`tabs__item${active === tab ? ' tabs__item--active' : ''}`}
            onClick={() => onChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
}

Tabs.propTypes = {
  active:   PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
