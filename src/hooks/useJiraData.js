import { useState, useEffect, useCallback } from 'react';
import moment from 'moment-timezone';
import * as api from '../services/jiraApi';
import * as cache from '../services/cache';
import {
  MOCK_DEFECTS_BY_PRIORITY, MOCK_DEFECTS_BY_STATUS, MOCK_IMPL_TICKETS,
  MOCK_DEFECTS_TABLE, MOCK_RELEASE_ROWS, MOCK_TOTALS,
  MOCK_QUARTERS, MOCK_HEALTH_SCORE,
} from '../services/mockData';

const EST = 'America/New_York';

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
  const [data,          setData]          = useState(createEmptyRMData);
  const [loading,       setLoading]       = useState(true);
  const [usingMock,     setUsingMock]     = useState(false);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  const load = useCallback(async (signal) => {
    setLoading(true);

    if (!JIRA_CONFIGURED) {
      setData(getMockData());
      setUsingMock(true);
      setLoading(false);
      return;
    }

    const ctx = { dashboardView, activeTab, isFiltered, signal };

    try {
      // Check cache for the monthly/quarterly data (implTickets is always today's — never cached)
      const cacheKey = cache.makeKey(year, month, components);
      const cached   = cache.get(cacheKey);

      // Always fetch implTickets fresh (today's data)
      const implTickets = await api.fetchImplTickets(ctx);

      if (cached) {
        setData({ ...cached, implTickets });
        setLastFetchedAt(new Date());
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
      cache.set(cacheKey, result);

      setData({ ...result, implTickets });
      setUsingMock(false);
      setLastFetchedAt(new Date());
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[useJiraData] API error, falling back to mock data:', err);
      setData(getMockData());
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [year, month, components, dashboardView, activeTab, isFiltered]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const refresh = useCallback(() => {
    const cacheKey = cache.makeKey(year, month, components);
    cache.invalidate(cacheKey);
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, year, month, components]);

  return {
    data,
    loading,
    usingMock,
    // TODO: migrate to jqlUtils.todayLabel
    todayLabel: moment().tz(EST).format('M/D/YYYY'),
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
