import { useState, useEffect, useCallback } from 'react';
import moment from 'moment-timezone';
import * as api from '../services/jiraApi';

const JIRA_CONFIGURED = !!import.meta.env.VITE_JIRA_BASE_URL;
const EST             = 'America/New_York';

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
  const [data,      setData]      = useState(() => createEmptyData(rcLabels));
  const [loading,   setLoading]   = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    if (!JIRA_CONFIGURED) {
      setData(mockData);
      setUsingMock(true);
      setLoading(false);
      return;
    }

    const ctx = { dashboardView, activeTab, isFiltered };

    try {
      const [
        impl, defectsToday, regressionToday,
        todayDefectsByRC, todayRegressionByRC,
        monthlyDefectsByRC, monthlyRegressionByRC,
        healthScore, defectsByPriority,
        dailyMetrics, quarters,
      ] = await Promise.all([
        api.fetchCurrentDayImplByLabel(components, ctx),
        api.fetchCurrentDayDefectsByPriority(components, ctx),
        api.fetchRegressionDefectsByPriority(components, ctx),
        api.fetchTodayDefectsByRootCause(components, rcLabels, ctx),
        api.fetchTodayRegressionByRootCause(components, rcLabels, ctx),
        api.fetchDefectsByRootCause(year, month, components, rcLabels, ctx),
        api.fetchRegressionByRootCause(year, month, components, rcLabels, ctx),
        api.fetchHealthScore(year, month, components, ctx),
        api.fetchDefectsByPriority(year, month, components, ctx),
        api.fetchTabDailyMetrics(year, month, components, ctx),
        api.fetchTabQuarters(year, components, ctx),
      ]);

      setData({
        currentDay: { impl, defects: defectsToday, regression: regressionToday },
        rootCause: {
          today:   { defects: todayDefectsByRC,   regression: todayRegressionByRC },
          monthly: { defects: monthlyDefectsByRC, regression: monthlyRegressionByRC },
        },
        monthly: { healthScore, defectsByPriority },
        dailyMetrics,
        quarters,
      });
      setUsingMock(false);
    } catch {
      setData(mockData);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [year, month, components, rcLabels, mockData, dashboardView, activeTab, isFiltered]);

  useEffect(() => { load(); }, [load]);

  return {
    data,
    loading,
    usingMock,
    todayLabel: moment().tz(EST).format('M/D/YYYY'),
  };
}

