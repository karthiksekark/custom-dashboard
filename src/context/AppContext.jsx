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

  if (result === 'ok' || result === 'bypassed') {
    dispatch({ type: 'AUTH_SUCCESS' });
  } else {
    // 'no-cookie', 'redirect', or fetch error — show AuthModal
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

  // Step 3: when auth has failed, re-check each time the tab regains focus.
  // The user opens JIRA login in a new tab (via AuthModal), logs in, then
  // switches back here — at that point the JSESSIONID cookie will be present.
  useEffect(() => {
    if (state.isAuth !== false) return;

    function handleVisibility() {
      if (document.visibilityState === 'visible') runAuthCheck(dispatch);
    }

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.isAuth]);

  // Sync preferences when changed in another extension tab
  useEffect(() => {
    if (!globalThis.chrome?.storage?.onChanged) return;

    function handleStorageChange(changes, area) {
      if (area !== 'local' || !changes.preferences) return;
      const updated = changes.preferences.newValue;
      if (updated) dispatch({ type: 'STORAGE_LOADED', payload: updated });
    }

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

AppProvider.propTypes = { children: PropTypes.node.isRequired };
