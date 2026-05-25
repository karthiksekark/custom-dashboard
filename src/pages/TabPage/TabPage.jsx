import PropTypes from 'prop-types';
import { useMemo, useRef, useEffect } from 'react';
import { useTabData } from '../../hooks/useTabData';
import Card from '../../components/Card/Card';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import CurrentDaySection from '../../components/CurrentDaySection/CurrentDaySection';
import RootCauseSection from '../../components/RootCauseSection/RootCauseSection';
import MonthlyMetricsSection from '../../components/MonthlyMetricsSection/MonthlyMetricsSection';
import RootCausePrioritySection from '../../components/RootCausePrioritySection/RootCausePrioritySection';
import TabDailyMetricsTable from '../../components/Tables/TabDailyMetricsTable';
import TabQuarterSection from '../../components/TabQuarterSection/TabQuarterSection';
import ErrorBoundary from '../../components/ErrorBoundary/ErrorBoundary';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import ErrorCard from '../../components/ErrorCard/ErrorCard';
import { useToast } from '../../context/ToastContext';
import { rangeJql } from '../../utils/jqlUtils';
import './TabPage.scss';

export default function TabPage({
  year, month, monthLabel, components, isCurrentPeriod,
  dashboardView, activeTab, isFiltered, team,
}) {
  const rcLabels = useMemo(() => team.rootCauses.map(rc => rc.label), [team]);
  const { data, loading, phase1Done, todayLabel, lastFetchedAt, refresh, error, usingMock } = useTabData({
    year, month, components,
    rcLabels,
    mockData: team.mockData,
    dashboardView, activeTab, isFiltered,
  });

  const toast = useToast();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (lastFetchedAt) {
      if (hasLoadedRef.current) toast.show('Data refreshed');
      else hasLoadedRef.current = true;
    }
  }, [lastFetchedAt]);

  if (loading && !phase1Done) {
    return (
      <div className="tab-page">
        <LoadingSkeleton showChart rows={3} />
        <LoadingSkeleton showChart={false} rows={4} />
        <LoadingSkeleton showChart={false} rows={6} />
      </div>
    );
  }

  // Enrich quarters with startDate/endDate for JiraLinks and quarter progress bar.
  // Quarter index derived from label e.g. "2Q26" → Q2 → startMonth "04"
  const enrichedQuarters = data.quarters.map(q => {
    if (q.startDate) return q; // already enriched
    const qYear      = '20' + q.q.slice(-2);
    const qIdx       = Number(q.q[0]) - 1;  // 0-based: Q1=0, Q2=1, Q3=2, Q4=3
    const startMonthNum = String(qIdx * 3 + 1).padStart(2, '0');
    const endMonthNum   = String(qIdx * 3 + 3).padStart(2, '0');
    const { start }     = rangeJql(qYear, startMonthNum);
    const { end }       = rangeJql(qYear, endMonthNum);
    return { ...q, startDate: start, endDate: end };
  });

  return (
    <div className={`tab-page${loading ? ' tab-page--loading' : ''}`}>
      {error && <ErrorCard message={error} isMock={usingMock} onRetry={refresh} />}
      {isCurrentPeriod && (
        <ErrorBoundary>
          <CurrentDaySection
            data={data.currentDay}
            todayLabel={todayLabel}
            lastFetchedAt={lastFetchedAt}
            onRefresh={refresh}
            isRefreshing={loading}
          />
        </ErrorBoundary>
      )}
      {isCurrentPeriod && (
        <ErrorBoundary>
          <RootCauseSection
            rootCauses={team.rootCauses}
            defectsByRC={data.rootCause.today.defects}
            regressionByRC={data.rootCause.today.regression}
          />
        </ErrorBoundary>
      )}
      <ErrorBoundary>
        <MonthlyMetricsSection
          monthLabel={monthLabel}
          healthScore={data.monthly.healthScore}
          defectsByPriority={data.monthly.defectsByPriority}
          prevHealthScore={data.prevPeriod?.healthScore}
          prevDefectsTotal={data.prevPeriod?.defectsTotal}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        <RootCausePrioritySection
          title="Defects by Root Cause & Priority"
          rootCauses={team.rootCauses}
          data={data.rootCause.monthly.defects}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        <RootCausePrioritySection
          title="Regression Defects by Root Cause & Priority"
          rootCauses={team.rootCauses}
          data={data.rootCause.monthly.regression}
        />
      </ErrorBoundary>
      <ErrorBoundary>
        <Card collapsible>
          <SectionHeader eyebrow="Detailed Breakdown" title={`Daily Release Metrics — ${monthLabel}`} />
          <TabDailyMetricsTable
            rows={data.dailyMetrics.rows}
            totals={data.dailyMetrics.totals}
            year={year}
            month={month}
            components={components}
          />
        </Card>
      </ErrorBoundary>
      <ErrorBoundary>
        <TabQuarterSection quarters={enrichedQuarters} year={year} month={month} components={components} />
      </ErrorBoundary>
    </div>
  );
}

TabPage.propTypes = {
  year:            PropTypes.string.isRequired,
  month:           PropTypes.string.isRequired,
  monthLabel:      PropTypes.string.isRequired,
  components:      PropTypes.string.isRequired,
  isCurrentPeriod: PropTypes.bool.isRequired,
  dashboardView:   PropTypes.string.isRequired,
  activeTab:       PropTypes.string.isRequired,
  isFiltered:      PropTypes.bool.isRequired,
  team:            PropTypes.shape({
    rootCauses: PropTypes.arrayOf(PropTypes.shape({
      label:   PropTypes.string,
      tooltip: PropTypes.string,
    })).isRequired,
    mockData: PropTypes.object,
  }).isRequired,
};
