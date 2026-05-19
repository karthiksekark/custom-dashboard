import { describe, it, expect } from 'vitest';
import { migrateToLatest, CURRENT_VERSION } from '../context/storageVersion';
import { DEFAULT_TEAM_COMPONENTS } from '../config/teams.config';

describe('migrateToLatest', () => {
  it('handles undefined input and returns v2 object with DEFAULT_TEAM_COMPONENTS', () => {
    const result = migrateToLatest(undefined);
    expect(result.__version).toBe(CURRENT_VERSION);
    expect(result.teamComponents).toEqual(DEFAULT_TEAM_COMPONENTS);
    expect(result.dashboardView).toBe('default');
  });

  it('handles empty object and returns v2 object with DEFAULT_TEAM_COMPONENTS', () => {
    const result = migrateToLatest({});
    expect(result.__version).toBe(CURRENT_VERSION);
    expect(result.teamComponents).toEqual(DEFAULT_TEAM_COMPONENTS);
  });

  it('migrates v1 data with components string to per-team teamComponents', () => {
    const v1 = { components: 'DIGOPS/MyTeam', dashboardView: 'compact' };
    const result = migrateToLatest(v1);
    expect(result.__version).toBe(CURRENT_VERSION);
    expect(result.teamComponents).toEqual({
      'release-management': 'DIGOPS/MyTeam',
      fed: 'DIGOPS/MyTeam',
      catalog: 'DIGOPS/MyTeam',
    });
    expect(result.dashboardView).toBe('compact');
  });

  it('migrates v1 data without components string to DEFAULT_TEAM_COMPONENTS', () => {
    const v1 = { dashboardView: 'default' };
    const result = migrateToLatest(v1);
    expect(result.__version).toBe(CURRENT_VERSION);
    expect(result.teamComponents).toEqual(DEFAULT_TEAM_COMPONENTS);
  });

  it('passes through v2 data unchanged (except ensuring __version)', () => {
    const v2 = {
      __version: 2,
      dashboardView: 'default',
      teamComponents: {
        'release-management': 'DIGOPS/UAT',
        fed: 'DIGOPS/FED',
        catalog: 'DIGOPS/Catalog',
      },
    };
    const result = migrateToLatest(v2);
    expect(result.__version).toBe(CURRENT_VERSION);
    expect(result.teamComponents).toEqual(v2.teamComponents);
    expect(result.dashboardView).toBe('default');
  });

  it('sets __version to CURRENT_VERSION', () => {
    const result = migrateToLatest({});
    expect(result.__version).toBe(CURRENT_VERSION);
    expect(CURRENT_VERSION).toBe(2);
  });
});
