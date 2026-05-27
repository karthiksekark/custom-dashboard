import PropTypes from 'prop-types';
import './Chip.scss';

export default function Chip({ value, color }) {
  if (value == null || value === 0) return <span className="chip chip--empty">—</span>;
  return (
    <span className="chip" style={{ '--chip-color': color }}>
      {value}
    </span>
  );
}

Chip.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string.isRequired,
};
