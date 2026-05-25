const TEAM_KEYS = ['release-management', 'fed', 'catalog'];

export const DEFAULT_PREFERENCES = {
  dashboardView:   'default',
  refreshInterval: 2,           // minutes; null = Off
  teamComponents: {
    'release-management': 'DIGOPS/UAT',
    'fed':                'DIGOPS/FED',
    'catalog':            'DIGOPS/Catalog',
  },
};

export const initialState = {
  isAuth:        null,   // null=checking, true, false
  isConfigured:  null,   // null=checking, true, false
  storageLoaded: false,
  preferences:   DEFAULT_PREFERENCES,
  settingsOpen:  false,
};

function isFullyConfigured(prefs) {
  const tc = prefs.teamComponents || {};
  return TEAM_KEYS.every(k => !!tc[k]?.trim());
}

// Migrate from old single `components` field — pre-populate all three teams
function migrateLegacy(raw) {
  if (!raw) return DEFAULT_PREFERENCES;
  const base = raw.teamComponents ? raw : {
    dashboardView:  raw.dashboardView || 'default',
    teamComponents: {
      'release-management': raw.components?.trim() || '',
      'fed':                raw.components?.trim() || '',
      'catalog':            raw.components?.trim() || '',
    },
  };
  // Ensure refreshInterval has a default if not present (migration from older versions)
  if (base.refreshInterval === undefined) base.refreshInterval = 2;
  return base;
}

export function appReducer(state, action) {
  switch (action.type) {

    case 'STORAGE_LOADED': {
      const migrated = migrateLegacy(action.payload);
      const prefs = {
        ...migrated,
        // Only fall back to defaults for teamComponents if stored ones are empty
        teamComponents: migrated.teamComponents || DEFAULT_PREFERENCES.teamComponents,
      };
      return {
        ...state,
        storageLoaded: true,
        preferences:   prefs,
        isConfigured:  isFullyConfigured(prefs),
      };
    }

    case 'AUTH_SUCCESS':
      return { ...state, isAuth: true };

    case 'AUTH_FAILURE':
      return { ...state, isAuth: false };

    case 'SET_PREFERENCES': {
      const prefs = { ...state.preferences, ...action.payload };
      return {
        ...state,
        preferences:  prefs,
        isConfigured: isFullyConfigured(prefs),
      };
    }

    case 'RESET_PREFERENCES':
      return {
        ...state,
        preferences:  DEFAULT_PREFERENCES,
        isConfigured: false,
      };

    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };

    case 'CLOSE_SETTINGS':
      return { ...state, settingsOpen: false };

    default:
      return state;
  }
}
