import { useState, useEffect, useCallback } from 'react';
import moment from 'moment-timezone';
import * as api from '../services/jiraApi';

const JIRA_CONFIGURED = !!import.meta.env.VITE_JIRA_BASE_URL;
const EST             = 'America/New_York';

export function useCurrentDayData({ components, mockData, dashboardView, activeTab, isFiltered }) {
  const [data,      setData]      = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const load = useCallback(async (signal) => {
    setLoading(true);
    setData(null);

    if (!JIRA_CONFIGURED) {
      setData(mockData);
      setUsingMock(true);
      setLoading(false);
      return;
    }

    const ctx = { dashboardView, activeTab, isFiltered, signal };

    try {
      const [impl, defects, regression] = await Promise.all([
        api.fetchCurrentDayImplByLabel(components, ctx),
        api.fetchCurrentDayDefectsByPriority(components, ctx),
        api.fetchRegressionDefectsByPriority(components, ctx),
      ]);
      setData({ impl, defects, regression });
      setUsingMock(false);
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('[useCurrentDayData] API error, falling back to mock data:', err);
      setData(mockData);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [components, mockData, dashboardView, activeTab, isFiltered]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return {
    data,
    loading,
    usingMock,
    // TODO: migrate to jqlUtils.todayLabel
    todayLabel: moment().tz(EST).format('M/D/YYYY'),
  };
}
