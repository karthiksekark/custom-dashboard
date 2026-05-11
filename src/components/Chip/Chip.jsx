import PropTypes from 'prop-types';
import './Chip.scss';

export default function Chip({ value, color }) {
  if (value == null) return <span className="chip chip--empty">—</span>;
  return (
    <span
      className="chip"
      style={{
        background: `${color}14`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {value}
    </span>
  );
}

Chip.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string.isRequired,
};
