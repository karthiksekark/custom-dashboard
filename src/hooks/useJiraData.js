import { useState, useCallback, useRef } from 'react';
import * as api from '../services/jiraApi';
import * as cache from '../services/cache';
import { DEFAULT_TTL_MS } from '../services/cache';
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
    prevPeriod:        { healthScore: null, defectsTotal: null },
  };
}


export function useJiraData({ year, month, components, dashboardView, activeTab, isFiltered }) {
  const [data,      setData]      = useState(createEmptyRMData);
  const [loading,   setLoading]   = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [error,     setError]     = useState(null);

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
    let stale = null; // declared outside try so catch block can access it

    try {
      // Check cache for the monthly/quarterly data (implTickets is always today's — never cached)
      const cached = cache.get(cacheKey);
      stale = !cached ? cache.getStale(cacheKey) : null;

      // Always fetch implTickets fresh (today's data)
      const implTickets = await api.fetchImplTickets(ctx);

      if (cached) {
        setData({ ...cached, implTickets });
        setError(null);
        markFetchedRef.current?.();
        setLoading(false);
        setUsingMock(false);
        return;
      }
      if (stale) {
        setData({ ...stale, implTickets });
        setLoading(false);
      }

      const settled = await Promise.allSettled([
        api.fetchDefects(year, month, ctx),
        api.fetchDailyMetrics(year, month, components, ctx),
        api.fetchHealthScore(year, month, components, ctx),
        api.fetchDefectsAlertTable(ctx),
        api.fetchTabQuarters(year, components, ctx),
        api.fetchPrevMonthHealthScore(year, month, components, ctx),
        api.fetchPrevMonthDefectsTotal(year, month, components, ctx),
      ]);

      // Re-throw auth errors so AppContext can redirect to login
      for (const r of settled) {
        if (r.status === 'rejected' &&
            (r.reason?.code === 'JIRA_AUTH' || r.reason?.code === 'JIRA_FORBIDDEN')) {
          throw r.reason;
        }
      }

      const val = (i, fallback) =>
        settled[i].status === 'fulfilled' ? settled[i].value : fallback;

      const defects         = val(0, { byPriority: [], byStatus: [] });
      const daily           = val(1, []);
      const health          = val(2, null);
      const defectsTable    = val(3, []);
      const quarters        = val(4, []);
      const prevHealthScore = val(5, null);
      const prevDefectsTotal = val(6, null);

      const result = {
        defectsByPriority: defects.byPriority,
        defectsByStatus:   defects.byStatus,
        releaseRows:       daily,
        totals:            buildTotals(daily),
        healthScore:       health,
        defectsTable,
        quarters,
        prevPeriod: { healthScore: prevHealthScore, defectsTotal: prevDefectsTotal },
      };

      // Cache monthly/quarterly results (TTL: default 2 minutes, per cache.js implementation)
      cache.set(cacheKey, result, refreshIntervalMsRef.current ?? DEFAULT_TTL_MS);

      setData({ ...result, implTickets });
      setUsingMock(false);
      setError(null);
      markFetchedRef.current?.();
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err.code === 'JIRA_AUTH' || err.code === 'JIRA_FORBIDDEN') {
        console.error('[useJiraData] Auth/permission error:', err.message);
        throw err;
      }
      console.error('[useJiraData] API error:', err);
      setError(err.message || 'Failed to load data');
      if (!stale) {
        setData(getMockData());
        setUsingMock(true);
      }
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
    error,
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
