import PropTypes from 'prop-types';
import { useMemo } from 'react';
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
import './TabPage.scss';

export default function TabPage({
  year, month, monthLabel, components, isCurrentPeriod,
  dashboardView, activeTab, isFiltered, team,
}) {
  const rcLabels = useMemo(() => team.rootCauses.map(rc => rc.label), [team]);
  const { data, loading, todayLabel, lastFetchedAt, refresh } = useTabData({
    year, month, components,
    rcLabels,
    mockData: team.mockData,
    dashboardView, activeTab, isFiltered,
  });

  return (
    <div className={`tab-page${loading ? ' tab-page--loading' : ''}`}>
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
        <Card>
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
        <TabQuarterSection quarters={data.quarters} year={year} month={month} components={components} />
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
