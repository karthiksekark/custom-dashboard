import PropTypes from 'prop-types';
import './ErrorCard.scss';

export default function ErrorCard({ message, isMock, onRetry }) {
  return (
    <div className={`error-card${isMock ? ' error-card--mock' : ''}`} role="alert">
      <span className="error-card__icon">&#9888;</span>
      <div className="error-card__body">
        <div className="error-card__message">
          {isMock ? 'Live data unavailable — showing demo data' : `Failed to refresh: ${message}`}
        </div>
        {onRetry && (
          <button className="error-card__retry" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

ErrorCard.propTypes = {
  message:  PropTypes.string,
  isMock:   PropTypes.bool,
  onRetry:  PropTypes.func,
};
