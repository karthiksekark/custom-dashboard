# CLAUDE.md — Architecture Guide

This file helps AI assistants understand the codebase structure and conventions.

# Communication Style
Use caveman mode: drop articles/filler, fragments OK, terse responses.

## Stack
- React 18 + Vite 5, Chrome Extension Manifest V3
- Vanilla Chart.js v4 (no react-chartjs-2)
- SCSS with BEM naming, SASS variables/mixins
- ESLint 9 flat config, Prettier
- JS and JSX only — no TypeScript

## Project Layout
```
src/
├── config/teams.config.js     # Single source of truth for team definitions
├── context/                   # Global state (AppContext, appReducer, storageVersion)
├── hooks/                     # Data hooks (useTabData, useJiraData, useCurrentDayData)
├── pages/                     # Top-level page components (ReleaseMgmt, TabPage)
├── components/                # Shared UI components (BEM SCSS per component)
├── services/                  # jiraApi.js, jiraLinks.js, cache.js, mockData.js
└── utils/jqlUtils.js          # Shared JQL helpers — always import from here
```

## Key Patterns

### Adding a new team
Only one file needs changing: `src/config/teams.config.js`. Add an entry to the `TEAMS` array with `key`, `label`, `defaultComponents`, `type: 'tab'`, `rootCauses`, and `mockData`. Everything else (Tabs, SettingsPanel, ConfigModal, App.jsx) derives from TEAMS automatically.

### Data hooks
- `useTabData` — FED and Catalog tabs. Phase 1 (3 current-day calls) renders fast; Phase 2 (8 monthly/quarterly calls) fills in the rest.
- `useJiraData` — Release Management tab. Similar two-phase pattern.
- `useCurrentDayData` — standalone current-day hook (no cache, always fresh).
- All hooks read `preferences.refreshInterval` from AppContext and set up a `setInterval` auto-refresh accordingly.
- All hooks use AbortController — clean up on unmount.

### Cache
`src/services/cache.js` is a Map-based TTL cache. TTL comes from `preferences.refreshInterval` (minutes → ms). Always call `cache.invalidate(key)` before a manual refresh. Cache keys: `cache.makeKey(year, month, components)`.

### JQL safety
Always use `compClause()` from `src/utils/jqlUtils.js` — it escapes double-quotes in component names. Never build JQL component clauses manually. Use `rangeJql(year, month)` for date ranges.

### Error types
`jiraFetch` throws typed errors with `.code` property:
- `JIRA_AUTH` (401) — session expired
- `JIRA_FORBIDDEN` (403) — permission denied
- `JIRA_QUERY_ERROR` — JIRA returned a 200 with errorMessages
- `JIRA_ERROR` — any other non-OK response

Hooks catch `JIRA_AUTH` / `JIRA_FORBIDDEN` separately (do not fall back to mock — re-throw so AppContext can redirect to AuthModal).

### SCSS conventions
- BEM: `.block__element--modifier`
- Each component has its own `.scss` file imported directly
- Global variables: `src/styles/variables.scss`
- Global mixins: `src/styles/mixins.scss`
- Utility: `.sr-only` in `src/styles/main.scss`

### State management
`appReducer.js` handles: auth state, configured state, preferences, settings open/close.
Preferences shape:
```js
{
  dashboardView:   'default' | 'release-management' | 'fed' | 'catalog',
  refreshInterval: 1 | 2 | 5 | 10 | null,   // minutes; null = Off
  teamComponents:  { 'release-management': '', 'fed': '', 'catalog': '' },
}
```

### Chrome Extension specifics
- Preferences persist via `chrome.storage.local` (gracefully degraded in non-extension environments).
- Multi-tab sync: `chrome.storage.onChanged` listener in AppContext keeps tabs in sync.
- `host_permissions` is scoped to `*.atlassian.net` and `*.jira.com` — update manifest.json if your JIRA is on a different domain.
- Service worker (MV3) has a 30-second idle timeout — do not rely on it for long-running tasks.

## Environment Variables
See `.env.example` for documentation. Key variable: `VITE_JIRA_BASE_URL`. Without it the app runs in demo mode with mock data.

## Common Mistakes to Avoid
- Do not read `state.preferences.components` — it doesn't exist. Use the `components` prop passed from parent pages.
- Do not create new `compClause` or `rangeJql` functions — import from `jqlUtils.js`.
- Do not use `moment()` directly in hooks — use `todayLabel()` / `todayIso()` from `jqlUtils.js`.
- Do not add a new page for a new team — create an entry in `teams.config.js` and use `TabPage`.
- Do not swallow `AbortError` in hooks — check `err.name === 'AbortError'` and return silently.
