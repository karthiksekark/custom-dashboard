import PropTypes from 'prop-types';
import './LoadingSkeleton.scss';

export default function LoadingSkeleton({ rows = 4, showChart = true }) {
  return (
    <div className="skeleton" aria-busy="true" aria-label="Loading data">
      {showChart && <div className="skeleton__chart" />}
      <div className="skeleton__lines">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="skeleton__line" style={{ width: `${85 - i * 8}%` }} />
        ))}
      </div>
    </div>
  );
}

LoadingSkeleton.propTypes = {
  rows:      PropTypes.number,
  showChart: PropTypes.bool,
};
