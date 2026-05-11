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

export default function ConfigModal() {
  const { state, dispatch } = useAppContext();
  const [value,  setValue]  = useState(state.preferences.components || '');
  const [error,  setError]  = useState('');

  function handleSave() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter at least one JIRA component name.');
      return;
    }
    const updated = { ...state.preferences, components: trimmed };
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
          A <strong>JIRA Components</strong> filter is required before you
          can access the dashboard. Enter the component names relevant to your
          team — they will be applied to all JIRA queries.
        </p>

        <div>
          <label htmlFor="config-components" className="modal-body__label modal-body__label--required">
            JIRA Components
          </label>
          <input
            id="config-components"
            type="text"
            className={`modal-body__input${error ? ' modal-body__input--error' : ''}`}
            placeholder="e.g. Payments, Auth, Core API"
            value={value}
            onChange={e => { setValue(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          {error
            ? <p className="modal-body__error">{error}</p>
            : <p className="modal-body__hint">Comma-separated. Added as AND component in (…) to every query.</p>
          }
        </div>

        <button className="btn btn--primary btn--full" onClick={handleSave}>
          Save &amp; Continue
        </button>
      </div>
    </Modal>
  );
}
