import { useState, useCallback, useRef } from 'react';
import * as api from '../services/jiraApi';
import * as cache from '../services/cache';
import { DEFAULT_TTL_MS } from '../services/cache';
import { useAppContext } from './useAppContext';
import { todayLabel } from '../utils/jqlUtils';
import { useBaseData } from './useBaseData';
import {
  MOCK_DEFECTS_BY_PRIORITY, MOCK_DEFECTS_BY_STATUS, MOCK_IMPL_TICKETS,
  MOCK_DEFECTS_TABLE, MOCK_RELEASE_ROWS, MOCK_TOTALS,
  MOCK_QUARTERS, MOCK_HEALTH_SCORE,
} from '../services/mockData';

const JIRA_CONFIGURED = !!import.meta.env.VITE_JIRA_BASE_URL;

function buildTotals(rows) {
  const t  = rows.reduce((s, r) => s + (r.t || 0), 0);
  const d  = rows.reduce((s, r) => s + (r.d || 0), 0);
  const c  = rows.reduce((s, r) => s + (r.c || 0), 0);
  const h  = rows.reduce((s, r) => s + (r.h || 0), 0);
  const m  = rows.reduce((s, r) => s + (r.m || 0), 0);
  const l  = rows.reduce((s, r) => s + (r.l || 0), 0);
  const hs = rows.length > 0
    ? parseFloat((rows.reduce((s, r) => s + (r.hs || 0), 0) / rows.length).toFixed(2))
    : null;
  return { t, d, c, h, m, l, hs };
}

function createEmptyRMData() {
  return {
    defectsByPriority: [],
    defectsByStatus:   [],
    releaseRows:       [],
    totals:            { t: 0, d: 0, c: 0, h: 0, m: 0, l: 0, hs: null },
    healthScore:       null,
    implTickets:       [],
    defectsTable:      [],
    quarters:          [],
  };
}


export function useJiraData({ year, month, components, dashboardView, activeTab, isFiltered }) {
  const { state } = useAppContext();

  const [data,      setData]      = useState(createEmptyRMData);
  const [loading,   setLoading]   = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  // Refs so load can call markFetched and read refreshIntervalMs without extra deps
  const markFetchedRef       = useRef(null);
  const refreshIntervalMsRef = useRef(null);

  const cacheKey = cache.makeKey(year, month, components);

  const load = useCallback(async (signal, { silent = false } = {}) => {
    if (!silent) setLoading(true);

    if (!JIRA_CONFIGURED) {
      setData(getMockData());
      setUsingMock(true);
      setLoading(false);
      return;
    }

    const ctx = { dashboardView, activeTab, isFiltered, signal };

    try {
      // Check cache for the monthly/quarterly data (implTickets is always today's — never cached)
      const cached = cache.get(cacheKey);

      // Always fetch implTickets fresh (today's data)
      const implTickets = await api.fetchImplTickets(ctx);

      if (cached) {
        setData({ ...cached, implTickets });
        markFetchedRef.current?.();
        setLoading(false);
        setUsingMock(false);
        return;
      }

      const [priority, status, daily, health, defectsTable, quarters] = await Promise.all([
        api.fetchDefectsByPriority(year, month, components, ctx),
        api.fetchDefectsByStatus(year, month, components, ctx),
        api.fetchDailyMetrics(year, month, components, ctx),
        api.fetchHealthScore(year, month, components, ctx),
        api.fetchDefectsAlertTable(components, ctx),
        api.fetchTabQuarters(year, components, ctx),
      ]);

      const result = {
        defectsByPriority: priority,
        defectsByStatus:   status,
        releaseRows:       daily,
        totals:            buildTotals(daily),
        healthScore:       health,
        defectsTable,
        quarters,
      };

      // Cache monthly/quarterly results (TTL: default 2 minutes, per cache.js implementation)
      cache.set(cacheKey, result, refreshIntervalMsRef.current ?? DEFAULT_TTL_MS);

      setData({ ...result, implTickets });
      setUsingMock(false);
      markFetchedRef.current?.();
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err.code === 'JIRA_AUTH' || err.code === 'JIRA_FORBIDDEN') {
        console.error('[useJiraData] Auth/permission error:', err.message);
        // Don't fall back to mock — re-throw so AppContext can handle auth
        throw err;
      }
      console.error('[useJiraData] API error, falling back to mock data:', err);
      setData(getMockData());
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [year, month, components, dashboardView, activeTab, isFiltered, cacheKey]);

  const { lastFetchedAt, markFetched, refresh, refreshIntervalMs } = useBaseData({
    load,
    cacheKey,
    deps: [year, month, components],
  });

  // Keep refs in sync so load can use these without extra deps
  markFetchedRef.current       = markFetched;
  refreshIntervalMsRef.current = refreshIntervalMs;

  return {
    data,
    loading,
    usingMock,
    todayLabel: todayLabel(),
    lastFetchedAt,
    refresh,
  };
}

function getMockData() {
  return {
    defectsByPriority: MOCK_DEFECTS_BY_PRIORITY,
    defectsByStatus:   MOCK_DEFECTS_BY_STATUS,
    releaseRows:       MOCK_RELEASE_ROWS,
    totals:            MOCK_TOTALS,
    healthScore:       MOCK_HEALTH_SCORE,
    implTickets:       MOCK_IMPL_TICKETS,
    defectsTable:      MOCK_DEFECTS_TABLE,
    quarters:          MOCK_QUARTERS,
  };
}
