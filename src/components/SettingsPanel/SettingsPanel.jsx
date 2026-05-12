import { useState } from 'react';
import Modal from '../Modal/Modal';
import { useAppContext } from '../../hooks/useAppContext';
import { persistPreferences } from '../../context/AppContext';
import { DEFAULT_PREFERENCES } from '../../context/appReducer';
import './SettingsPanel.scss';

const GEAR_ICON = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const VIEWS = [
  {
    id:          'default',
    label:       'Default (All Tabs)',
    description: 'Show all tabs — Release Management, FED, and Catalog.',
    teamKey:     null,
  },
  {
    id:          'release-management',
    label:       'Release Management',
    description: 'Show only the Release Management dashboard. Tabs are hidden.',
    teamKey:     'release-management',
  },
  {
    id:          'fed',
    label:       'FED',
    description: 'Show only the FED dashboard. Tabs are hidden.',
    teamKey:     'fed',
  },
  {
    id:          'catalog',
    label:       'Catalog',
    description: 'Show only the Catalog dashboard. Tabs are hidden.',
    teamKey:     'catalog',
  },
];

export default function SettingsPanel() {
  const { state, dispatch } = useAppContext();
  const { preferences }     = state;
  const existing            = preferences.teamComponents || {};

  const [teamComponents, setTeamComponents] = useState({
    'release-management': existing['release-management'] || '',
    'fed':                existing['fed']                || '',
    'catalog':            existing['catalog']            || '',
  });
  const [dashboardView, setDashboardView] = useState(preferences.dashboardView || 'default');
  const [errors,        setErrors]        = useState({});
  const [saved,         setSaved]         = useState(false);

  function handleClose() { dispatch({ type: 'CLOSE_SETTINGS' }); }

  function handleCompChange(key, val) {
    setTeamComponents(prev => ({ ...prev, [key]: val }));
    setErrors(prev => ({ ...prev, [key]: '' }));
    setSaved(false);
  }

  function handleSave() {
    const newErrors = {};
    ['release-management', 'fed', 'catalog'].forEach(key => {
      if (!teamComponents[key].trim()) newErrors[key] = 'Required.';
    });
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    const updated = {
      dashboardView,
      teamComponents: {
        'release-management': teamComponents['release-management'].trim(),
        'fed':                teamComponents['fed'].trim(),
        'catalog':            teamComponents['catalog'].trim(),
      },
    };
    dispatch({ type: 'SET_PREFERENCES', payload: updated });
    persistPreferences(updated);
    setSaved(true);
    setTimeout(() => { setSaved(false); handleClose(); }, 900);
  }

  function handleReset() {
    setTeamComponents({ 'release-management': '', 'fed': '', 'catalog': '' });
    setDashboardView('default');
    setErrors({});
    dispatch({ type: 'RESET_PREFERENCES' });
    persistPreferences(DEFAULT_PREFERENCES);
    handleClose();
  }

  return (
    <Modal
      isOpen
      onClose={handleClose}
      title={<>{GEAR_ICON} Dashboard Settings</>}
      variant="default"
      dismissLocked
    >
      <div className="modal-body settings-panel">

        {/* ── Dashboard View + per-team component fields ── */}
        <div>
          <span className="modal-body__label">Dashboard View</span>
          <div className="settings-panel__views">
            {VIEWS.map(v => (
              <label
                key={v.id}
                className={`settings-panel__view${dashboardView === v.id ? ' settings-panel__view--active' : ''}`}
              >
                <input
                  type="radio"
                  name="dashboardView"
                  value={v.id}
                  checked={dashboardView === v.id}
                  onChange={() => setDashboardView(v.id)}
                  className="settings-panel__radio"
                />
                <div className="settings-panel__view-body">
                  <div className="settings-panel__view-label">{v.label}</div>
                  <div className="settings-panel__view-desc">{v.description}</div>

                  {v.teamKey && (
                    <div
                      className="settings-panel__comp-field"
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        type="text"
                        className={`settings-panel__comp-input${errors[v.teamKey] ? ' settings-panel__comp-input--error' : ''}`}
                        placeholder="e.g. Payments, Auth, Core API"
                        value={teamComponents[v.teamKey]}
                        onChange={e => handleCompChange(v.teamKey, e.target.value)}
                      />
                      {errors[v.teamKey]
                        ? <span className="settings-panel__comp-error">{errors[v.teamKey]}</span>
                        : <span className="settings-panel__comp-hint">Comma-separated component names</span>
                      }
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="modal-body__actions settings-panel__actions">
          <button className="btn btn--danger" onClick={handleReset}>
            Reset to Defaults
          </button>
          <button
            className={`btn btn--primary${saved ? ' settings-panel__btn--saved' : ''}`}
            onClick={handleSave}
          >
            {saved ? '✓ Saved' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
