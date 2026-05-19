import PropTypes from 'prop-types';
import './TeamComponentInput.scss';

export default function TeamComponentInput({ id, label, value, error, onChange, placeholder, className }) {
  return (
    <div className={`tci${className ? ` ${className}` : ''}`}>
      <label htmlFor={id} className="tci__label">
        {label} Components <span className="tci__required" aria-hidden="true">*</span>
      </label>
      <input
        id={id}
        type="text"
        className={`tci__input${error ? ' tci__input--error' : ''}`}
        placeholder={placeholder || 'e.g. Payments, Auth, Core API'}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-required="true"
        aria-invalid={!!error}
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className={error ? 'tci__error' : 'tci__hint'}>
        {error || 'Comma-separated component names.'}
      </p>
    </div>
  );
}

TeamComponentInput.propTypes = {
  id:          PropTypes.string.isRequired,
  label:       PropTypes.string.isRequired,
  value:       PropTypes.string.isRequired,
  error:       PropTypes.string,
  onChange:    PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className:   PropTypes.string,
};
