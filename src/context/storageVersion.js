import { DEFAULT_TEAM_COMPONENTS } from '../config/teams.config';

export const CURRENT_VERSION = 2;

/**
 * Versioned migration. Takes raw stored data and returns a migrated
 * preferences object at CURRENT_VERSION.
 *
 * v1 → v2: single `components` string → per-team `teamComponents` object.
 */
export function migrateToLatest(stored = {}) {
  let data = { ...stored };
  const version = data.__version || 1;

  // v1 → v2
  if (version < 2) {
    const legacy = data.components;
    data = {
      dashboardView: data.dashboardView || 'default',
      teamComponents: legacy
        ? { 'release-management': legacy, fed: legacy, catalog: legacy }
        : { ...DEFAULT_TEAM_COMPONENTS },
    };
  }

  return { ...data, __version: CURRENT_VERSION };
}
