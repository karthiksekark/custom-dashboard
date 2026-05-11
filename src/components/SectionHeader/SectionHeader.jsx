import PropTypes from 'prop-types';
import './SectionHeader.scss';

export default function SectionHeader({ eyebrow, title, variant }) {
  return (
    <div className={`section-header${variant ? ` section-header--${variant}` : ''}`}>
      <div className="section-header__eye">{eyebrow}</div>
      <div className="section-header__title">{title}</div>
    </div>
  );
}

SectionHeader.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title:   PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['alert']),
};
