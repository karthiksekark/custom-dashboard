import PropTypes from 'prop-types';
import './Card.scss';

export default function Card({ children, variant }) {
  return (
    <div className={`card${variant ? ` card--${variant}` : ''}`}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant:  PropTypes.oneOf(['alert']),
};
