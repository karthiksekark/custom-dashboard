import { useState } from 'react';
import Modal from '../Modal/Modal';
import { useAppContext } from '../../hooks/useAppContext';
import { persistPreferences } from '../../context/AppContext';
import './ConfigModal.scss';

const WARNING_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const TEAM_FIELDS = [
  { key: 'release-management', label: 'Release Management' },
  { key: 'fed',                label: 'FED' },
  { key: 'catalog',            label: 'Catalog' },
];

export default function ConfigModal() {
  const { state, dispatch } = useAppContext();
  const existing = state.preferences.teamComponents || {};

  const [values, setValues] = useState({
    'release-management': existing['release-management'] || '',
    'fed':                existing['fed']                || '',
    'catalog':            existing['catalog']            || '',
  });
  const [errors, setErrors] = useState({});

  function handleChange(key, val) {
    setValues(v  => ({ ...v,   [key]: val }));
    setErrors(e  => ({ ...e,   [key]: ''  }));
  }

  function handleSave() {
    const newErrors = {};
    TEAM_FIELDS.forEach(({ key }) => {
      if (!values[key].trim()) newErrors[key] = 'Required.';
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    const updated = {
      ...state.preferences,
      teamComponents: {
        'release-management': values['release-management'].trim(),
        'fed':                values['fed'].trim(),
        'catalog':            values['catalog'].trim(),
      },
    };
    dispatch({ type: 'SET_PREFERENCES', payload: updated });
    persistPreferences(updated);
  }

  return (
    <Modal
      isOpen
      blocking
      variant="warning"
      title={<>{WARNING_ICON} Configuration Required</>}
    >
      <div className="modal-body">
        <p className="modal-body__text">
          Enter the JIRA component names for each team before accessing the
          dashboard. These are applied as <code>AND component in (…)</code> to
          every query.
        </p>

        {TEAM_FIELDS.map(({ key, label }, i) => (
          <div key={key}>
            <label
              htmlFor={`config-${key}`}
              className="modal-body__label modal-body__label--required"
            >
              {label} Components
            </label>
            <input
              id={`config-${key}`}
              type="text"
              className={`modal-body__input${errors[key] ? ' modal-body__input--error' : ''}`}
              placeholder="e.g. Payments, Auth, Core API"
              value={values[key]}
              onChange={e => handleChange(key, e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus={i === 0}
            />
            {errors[key]
              ? <p className="modal-body__error">{errors[key]}</p>
              : <p className="modal-body__hint">Comma-separated component names.</p>
            }
          </div>
        ))}

        <button className="btn btn--primary btn--full" onClick={handleSave}>
          Save &amp; Continue
        </button>
      </div>
    </Modal>
  );
}
