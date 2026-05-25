import { useState, useEffect, useCallback, useRef } from 'react';
import moment from 'moment-timezone';
import * as api from '../services/jiraApi';
import * as cache from '../services/cache';

const JIRA_CONFIGURED    = !!import.meta.env.VITE_JIRA_BASE_URL;
const EST                = 'America/New_York';
const AUTO_REFRESH_MS    = 2 * 60 * 1000;

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
  const [data,          setData]          = useState(() => createEmptyData(rcLabels));
  const [loading,       setLoading]       = useState(true);
  const [usingMock,     setUsingMock]     = useState(false);
  const [phase1Done,    setPhase1Done]    = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const refreshControllerRef             = useRef(null);

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
      const cacheKey = cache.makeKey(year, month, components);
      const cached   = cache.get(cacheKey);
      if (cached) {
        setData(prev => ({ ...prev, ...cached }));
        setLastFetchedAt(new Date());
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
      cache.set(cacheKey, { rootCause, monthly, dailyMetrics, quarters });

      setData(prev => ({
        ...prev,
        rootCause,
        monthly,
        dailyMetrics,
        quarters,
      }));
      setUsingMock(false);
      setLastFetchedAt(new Date());
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[useTabData] API error, falling back to mock data:', err);
      setData(mockData);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [year, month, components, rcLabels, mockData, dashboardView, activeTab, isFiltered]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);

    const interval = setInterval(() => {
      cache.invalidate(cache.makeKey(year, month, components));
      load(controller.signal, { silent: true });
    }, AUTO_REFRESH_MS);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [load, year, month, components]);

  const refresh = useCallback(() => {
    // Abort any in-flight refresh before starting a new one
    refreshControllerRef.current?.abort();
    const controller = new AbortController();
    refreshControllerRef.current = controller;

    cache.invalidate(cache.makeKey(year, month, components));
    load(controller.signal);
  }, [load, year, month, components]);

  return {
    data,
    loading,
    phase1Done,
    usingMock,
    // TODO: migrate to jqlUtils.todayLabel
    todayLabel: moment().tz(EST).format('M/D/YYYY'),
    lastFetchedAt,
    refresh,
  };
}
