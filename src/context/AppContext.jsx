import { createContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { appReducer, initialState, DEFAULT_PREFERENCES } from './appReducer';
import { checkSession } from '../services/jira';

export const AppContext = createContext(null);

// ── Storage helpers (gracefully degraded for non-extension environments) ──────
async function loadPreferences(dispatch) {
  if (!globalThis.chrome?.storage?.local) {
    dispatch({ type: 'STORAGE_LOADED', payload: DEFAULT_PREFERENCES });
    return;
  }
  try {
    const data = await chrome.storage.local.get(['preferences']);
    dispatch({ type: 'STORAGE_LOADED', payload: data.preferences ?? DEFAULT_PREFERENCES });
  } catch {
    dispatch({ type: 'STORAGE_LOADED', payload: DEFAULT_PREFERENCES });
  }
}

export async function persistPreferences(prefs) {
  if (!globalThis.chrome?.storage?.local) return;
  await chrome.storage.local.set({ preferences: prefs });
}

// ── Auth check ────────────────────────────────────────────────────────────────
async function runAuthCheck(dispatch) {
  const result = await checkSession();

  if (result === 'ok') {
    dispatch({ type: 'AUTH_SUCCESS' });
  } else if (result === 'redirect') {
    // Option B: navigate same tab to JIRA login
    const jiraBase = import.meta.env.VITE_JIRA_BASE_URL;
    const returnUrl = globalThis.chrome?.runtime?.getURL?.('index.html') ?? window.location.href;
    window.location.href = `${jiraBase}/login.jsp?os_destination=${encodeURIComponent(returnUrl)}`;
  } else {
    // 'no-cookie' or error
    dispatch({ type: 'AUTH_FAILURE' });
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Step 1: read chrome.storage
  useEffect(() => { loadPreferences(dispatch); }, []);

  // Step 2: run auth check once storage is ready
  useEffect(() => {
    if (state.storageLoaded) runAuthCheck(dispatch);
  }, [state.storageLoaded]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

AppProvider.propTypes = { children: PropTypes.node.isRequired };
