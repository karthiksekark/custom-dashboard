const TEAM_KEYS = ['release-management', 'fed', 'catalog'];

export const DEFAULT_PREFERENCES = {
  dashboardView:  'default',
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
  if (raw.teamComponents) return raw;
  const legacy = raw.components?.trim() || '';
  return {
    dashboardView:  raw.dashboardView || 'default',
    teamComponents: {
      'release-management': legacy,
      'fed':                legacy,
      'catalog':            legacy,
    },
  };
}

export function appReducer(state, action) {
  switch (action.type) {

    case 'STORAGE_LOADED': {
      const prefs = {
        ...migrateLegacy(action.payload),
        teamComponents: DEFAULT_PREFERENCES.teamComponents,
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
