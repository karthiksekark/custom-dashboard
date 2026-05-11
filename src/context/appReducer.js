export const DEFAULT_PREFERENCES = {
  dashboardView: 'default',
  components:    '',
};

export const initialState = {
  isAuth:        null,   // null=checking, true, false
  isConfigured:  null,   // null=checking, true, false
  storageLoaded: false,
  preferences:   DEFAULT_PREFERENCES,
  settingsOpen:  false,
};

export function appReducer(state, action) {
  switch (action.type) {

    case 'STORAGE_LOADED': {
      const prefs = action.payload ?? DEFAULT_PREFERENCES;
      return {
        ...state,
        storageLoaded: true,
        preferences:   prefs,
        isConfigured:  !!prefs.components?.trim(),
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
        isConfigured: !!prefs.components?.trim(),
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
