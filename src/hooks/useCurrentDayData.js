import { useState, useEffect, useCallback } from 'react';
import moment from 'moment-timezone';
import * as api from '../services/jiraApi';

const JIRA_CONFIGURED = !!import.meta.env.VITE_JIRA_BASE_URL;
const EST             = 'America/New_York';

export function useCurrentDayData(components, mockData) {
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
      const [impl, defects, regression] = await Promise.all([
        api.fetchCurrentDayImplByLabel(components),
        api.fetchCurrentDayDefectsByPriority(components),
        api.fetchRegressionDefectsByPriority(components),
      ]);
      setData({ impl, defects, regression });
      setUsingMock(false);
    } catch {
      setData(mockData);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  }, [components, mockData]);

  useEffect(() => { load(); }, [load]);

  return {
    data,
    loading,
    usingMock,
    todayLabel: moment().tz(EST).format('M/D/YYYY'),
  };
}
