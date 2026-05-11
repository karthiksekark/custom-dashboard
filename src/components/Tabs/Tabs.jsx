import PropTypes from 'prop-types';
import './Tabs.scss';

const TABS = ['Release Management', 'FED', 'Catalog'];

export default function Tabs({ active, onChange }) {
  return (
    <nav className="tabs" role="tablist">
      {TABS.map(tab => (
        <button
          key={tab}
          role="tab"
          aria-selected={active === tab}
          className={`tabs__item${active === tab ? ' tabs__item--active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
}

Tabs.propTypes = {
  active:   PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};
