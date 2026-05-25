import { useState, useCallback, useRef } from 'react';
import * as api from '../services/jiraApi';
import * as cache from '../services/cache';
import { DEFAULT_TTL_MS } from '../services/cache';
import { useAppContext } from './useAppContext';
import { todayLabel } from '../utils/jqlUtils';
import { useBaseData } from './useBaseData';

const JIRA_CONFIGURED    = !!import.meta.env.VITE_JIRA_BASE_URL;

function createEmptyData(rcLabels) {
  const emptyRC = Object.fromEntries((rcLabels || []).map(l => [l, { Critical: 0, High: 0, Medium: 0, Low: 0 }]));
  return {
    currentDay: { impl: [], defects: [], regression: [] },
    rootCause: {
      today:   { defects: { ...emptyRC }, regression: { ...emptyRC } },
      monthly: { defects: { ...emptyRC }, regression: { ...emptyRC } },
    },
    monthly: { healthScore: null, defectsByPriority: [] },
    dailyMetrics: { rows: [], totals: { t: 0, d: 0, c: 0, h: 0, m: 0, l: 0, rg: 0, fp: 0, dp: 0, hs: null } },
    quarters: [],
  };
}

export function useTabData({ year, month, components, rcLabels, mockData, dashboardView, activeTab, isFiltered }) {
  const { state } = useAppContext();

  const [data,       setData]       = useState(() => createEmptyData(rcLabels));
  const [loading,    setLoading]    = useState(true);
  const [usingMock,  setUsingMock]  = useState(false);
  const [phase1Done, setPhase1Done] = useState(false);

  // Refs so load can call markFetched and read refreshIntervalMs without extra deps
  const markFetchedRef      = useRef(null);
  const refreshIntervalMsRef = useRef(null);

  const cacheKey = cache.makeKey(year, month, components);

  const load = useCallback(async (signal, { silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
      setPhase1Done(false);
    }

    if (!JIRA_CONFIGURED) {
      setData(mockData);
      setUsingMock(true);
      setLoading(false);
      return;
    }

    const ctx = { dashboardView, activeTab, isFiltered, signal };

    try {
      // ── Phase 1: fast — current-day data (3 calls) ────────────────────────
      const [impl, defectsToday, regressionToday] = await Promise.all([
        api.fetchCurrentDayImplByLabel(components, ctx),
        api.fetchCurrentDayDefectsByPriority(components, ctx),
        api.fetchRegressionDefectsByPriority(components, ctx),
      ]);

      // Update state immediately with phase 1 data; loading stays true for phase 2
      setData(prev => ({
        ...prev,
        currentDay: { impl, defects: defectsToday, regression: regressionToday },
      }));
      setPhase1Done(true);

      // ── Phase 2: slow — monthly + quarterly data, check cache first ────────
      const cached = cache.get(cacheKey);
      if (cached) {
        setData(prev => ({ ...prev, ...cached }));
        markFetchedRef.current?.();
        setLoading(false);
        setUsingMock(false);
        return;
      }

      const [
        todayDefectsByRC, todayRegressionByRC,
        monthlyDefectsByRC, monthlyRegressionByRC,
        healthScore, defectsByPriority,
        dailyMetrics, quarters,
      ] = await Promise.all([
        api.fetchTodayDefectsByRootCause(components, rcLabels, ctx),
        api.fetchTodayRegressionByRootCause(components, rcLabels, ctx),
        api.fetchDefectsByRootCause(year, month, components, rcLabels, ctx),
        api.fetchRegressionByRootCause(year, month, components, rcLabels, ctx),
        api.fetchHealthScore(year, month, components, ctx),
        api.fetchDefectsByPriority(year, month, components, ctx),
        api.fetchTabDailyMetrics(year, month, components, ctx),
        api.fetchTabQuarters(year, components, ctx),
      ]);

      const rootCause = {
        today:   { defects: todayDefectsByRC,   regression: todayRegressionByRC },
        monthly: { defects: monthlyDefectsByRC, regression: monthlyRegressionByRC },
      };
      const monthly = { healthScore, defectsByPriority };

      // Cache phase 2 results (exclude current-day data — always keep fresh)
      cache.set(cacheKey, { rootCause, monthly, dailyMetrics, quarters }, refreshIntervalMsRef.current ?? DEFAULT_TTL_MS);

      setData(prev => ({
        ...prev,
        rootCause,
        monthly,
        dailyMetrics,
        quarters,
      }));
      setUsingMock(false);
      markFetchedRef.current?.();
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err.code === 'JIRA_AUTH' || err.code === 'JIRA_FORBIDDEN') {
        console.error('[useTabData] Auth/permission error:', err.message);
        throw err;
      }
      console.error('[useTabData] API error, falling back to mock data:', err);
      setData(mockData);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [year, month, components, rcLabels, mockData, dashboardView, activeTab, isFiltered, cacheKey]);

  const { lastFetchedAt, markFetched, refresh, refreshIntervalMs } = useBaseData({
    load,
    cacheKey,
    deps: [year, month, components],
  });

  // Keep refs in sync so load can use these without extra deps
  markFetchedRef.current      = markFetched;
  refreshIntervalMsRef.current = refreshIntervalMs;

  return {
    data,
    loading,
    phase1Done,
    usingMock,
    todayLabel: todayLabel(),
    lastFetchedAt,
    refresh,
  };
}
