import { useState, useEffect, useCallback } from 'react';
import moment from 'moment-timezone';
import * as api from '../services/jiraApi';

const JIRA_CONFIGURED = !!import.meta.env.VITE_JIRA_BASE_URL;
const EST             = 'America/New_York';

export function useTabData({ year, month, components, rcLabels, mockData }) {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setData(null);

    if (!JIRA_CONFIGURED) {
      setData(mockData);
      setUsingMock(true);
      setLoading(false);
      return;
    }

    try {
      const [
        impl, defectsToday, regressionToday,
        todayDefectsByRC, todayRegressionByRC,
        monthlyDefectsByRC, monthlyRegressionByRC,
        healthScore, defectsByPriority,
        dailyMetrics, quarters,
      ] = await Promise.all([
        api.fetchCurrentDayImplByLabel(components),
        api.fetchCurrentDayDefectsByPriority(components),
        api.fetchRegressionDefectsByPriority(components),
        api.fetchTodayDefectsByRootCause(components, rcLabels),
        api.fetchTodayRegressionByRootCause(components, rcLabels),
        api.fetchDefectsByRootCause(year, month, components, rcLabels),
        api.fetchRegressionByRootCause(year, month, components, rcLabels),
        api.fetchHealthScore(year, month, components),
        api.fetchDefectsByPriority(year, month, components),
        api.fetchTabDailyMetrics(year, month, components),
        api.fetchTabQuarters(year, components),
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
  }, [year, month, components, rcLabels, mockData]);

  useEffect(() => { load(); }, [load]);

  return {
    data,
    loading,
    usingMock,
    todayLabel: moment().tz(EST).format('M/D/YYYY'),
  };
}
