import PropTypes from 'prop-types';
import '../FED/FED.scss';

export default function Catalog({ month, year }) {
  return (
    <div className="stub-page">
      <div className="stub-page__icon">📦</div>
      <div className="stub-page__title">Catalog</div>
      <div className="stub-page__sub">Content for {month} {year} coming soon.</div>
    </div>
  );
}

Catalog.propTypes = {
  month: PropTypes.string.isRequired,
  year:  PropTypes.string.isRequired,
};
