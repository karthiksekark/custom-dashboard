import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/jiraApi';
import {
  MOCK_DEFECTS_BY_PRIORITY, MOCK_DEFECTS_BY_STATUS, MOCK_IMPL_TICKETS,
  MOCK_DEFECTS_TABLE, MOCK_RELEASE_ROWS, MOCK_TOTALS,
  MOCK_QUARTERS, MOCK_HEALTH_SCORE, MOCK_TODAY_LABEL,
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

export function useJiraData(year, month, components) {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setData(null);

    if (!JIRA_CONFIGURED) {
      setData(getMockData());
      setUsingMock(true);
      setLoading(false);
      return;
    }

    try {
      const [priority, status, daily, health, impl] = await Promise.all([
        api.fetchDefectsByPriority(year, month, components),
        api.fetchDefectsByStatus(year, month, components),
        api.fetchDailyMetrics(year, month, components),
        api.fetchHealthScore(year, month, components),
        api.fetchImplTickets(),
      ]);

      setData({
        defectsByPriority: priority,
        defectsByStatus:   status,
        releaseRows:       daily,
        totals:            buildTotals(daily),
        healthScore:       health,
        implTickets:       impl,
        defectsTable:      MOCK_DEFECTS_TABLE,
        quarters:          MOCK_QUARTERS,
        todayLabel:        MOCK_TODAY_LABEL,
      });
      setUsingMock(false);
    } catch {
      setData(getMockData());
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [year, month, components]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, usingMock, reload: load };
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
    todayLabel:        MOCK_TODAY_LABEL,
  };
}
