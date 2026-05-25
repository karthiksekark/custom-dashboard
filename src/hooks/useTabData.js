import { useState, useCallback, useRef } from 'react';
import * as api from '../services/jiraApi';
import * as cache from '../services/cache';
import { DEFAULT_TTL_MS } from '../services/cache';
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
    prevPeriod: { healthScore: null, defectsTotal: null },
  };
}

export function useTabData({ year, month, components, rcLabels, mockData, dashboardView, activeTab, isFiltered }) {
  const [data,       setData]       = useState(() => createEmptyData(rcLabels));
  const [loading,    setLoading]    = useState(true);
  const [usingMock,  setUsingMock]  = useState(false);
  const [phase1Done, setPhase1Done] = useState(false);
  const [error,      setError]      = useState(null);

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
    let stale = null; // declared outside try so catch block can access it

    try {
      // ── Phase 1: fast — current-day data (3 calls, each returns priority + root cause) ──
      const [impl, todayDefects, todayRegression] = await Promise.all([
        api.fetchCurrentDayImplByLabel(components, ctx),
        api.fetchCurrentDayDefects(components, rcLabels, ctx),
        api.fetchCurrentDayRegression(components, rcLabels, ctx),
      ]);

      // Phase 1 now populates both currentDay (priority) and rootCause.today (root cause)
      setData(prev => ({
        ...prev,
        currentDay: {
          impl,
          defects:    todayDefects.byPriority,
          regression: todayRegression.byPriority,
        },
        rootCause: {
          ...prev.rootCause,
          today: {
            defects:    todayDefects.byRootCause,
            regression: todayRegression.byRootCause,
          },
        },
      }));
      setPhase1Done(true);

      // ── Phase 2: slow — monthly + quarterly data, check cache first ────────
      const cached = cache.get(cacheKey);
      stale = !cached ? cache.getStale(cacheKey) : null;

      // Helper: merge cached/stale monthly data without overwriting today's root cause from phase 1
      const mergeMonthly = (prev, source) => ({
        ...prev,
        rootCause: { today: prev.rootCause.today, monthly: source.rootCause.monthly },
        monthly:     source.monthly,
        dailyMetrics: source.dailyMetrics,
        quarters:     source.quarters,
        prevPeriod:   source.prevPeriod,
      });

      if (cached) {
        setData(prev => mergeMonthly(prev, cached));
        setError(null);
        markFetchedRef.current?.();
        setLoading(false);
        setUsingMock(false);
        return;
      }
      if (stale) {
        // Show stale data immediately (no spinner), continue fetching fresh below
        setData(prev => mergeMonthly(prev, stale));
        setLoading(false);
      }

      const [
        monthlyDefects, monthlyRegressionByRC,
        healthScore,
        dailyMetrics, quarters,
        prevHealthScore, prevDefectsTotal,
      ] = await Promise.all([
        api.fetchMonthlyDefects(year, month, components, rcLabels, ctx),
        api.fetchRegressionByRootCause(year, month, components, rcLabels, ctx),
        api.fetchHealthScore(year, month, components, ctx),
        api.fetchTabDailyMetrics(year, month, components, ctx),
        api.fetchTabQuarters(year, components, ctx),
        api.fetchPrevMonthHealthScore(year, month, components, ctx),
        api.fetchPrevMonthDefectsTotal(year, month, components, ctx),
      ]);

      const rootCauseMonthly = { defects: monthlyDefects.byRootCause, regression: monthlyRegressionByRC };
      const monthly          = { healthScore, defectsByPriority: monthlyDefects.byPriority };
      const prevPeriod       = { healthScore: prevHealthScore, defectsTotal: prevDefectsTotal };

      // Cache monthly data only — today's root cause is always fresh (never cached)
      cache.set(cacheKey, { rootCause: { monthly: rootCauseMonthly }, monthly, dailyMetrics, quarters, prevPeriod }, refreshIntervalMsRef.current ?? DEFAULT_TTL_MS);

      setData(prev => ({
        ...prev,
        rootCause:   { today: prev.rootCause.today, monthly: rootCauseMonthly },
        monthly,
        dailyMetrics,
        quarters,
        prevPeriod,
      }));
      setUsingMock(false);
      setError(null);
      markFetchedRef.current?.();
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (err.code === 'JIRA_AUTH' || err.code === 'JIRA_FORBIDDEN') {
        console.error('[useTabData] Auth/permission error:', err.message);
        throw err;
      }
      console.error('[useTabData] API error:', err);
      setError(err.message || 'Failed to load data');
      // Only fall back to mock if we have no real data yet (first load)
      if (!stale) {
        setData(mockData);
        setUsingMock(true);
      }
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
    error,
    todayLabel: todayLabel(),
    lastFetchedAt,
    refresh,
  };
}
