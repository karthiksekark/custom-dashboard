import PropTypes from 'prop-types';
import './FED.scss';

export default function FED({ month, year }) {
  return (
    <div className="stub-page">
      <div className="stub-page__icon">🔧</div>
      <div className="stub-page__title">FED</div>
      <div className="stub-page__sub">Content for {month} {year} coming soon.</div>
    </div>
  );
}

FED.propTypes = {
  month: PropTypes.string.isRequired,
  year:  PropTypes.string.isRequired,
};
