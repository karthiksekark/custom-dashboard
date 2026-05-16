import PropTypes from 'prop-types';
import { useTabData } from '../../hooks/useTabData';
import Card from '../../components/Card/Card';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import CurrentDaySection from '../../components/CurrentDaySection/CurrentDaySection';
import RootCauseSection from '../../components/RootCauseSection/RootCauseSection';
import MonthlyMetricsSection from '../../components/MonthlyMetricsSection/MonthlyMetricsSection';
import RootCausePrioritySection from '../../components/RootCausePrioritySection/RootCausePrioritySection';
import TabDailyMetricsTable from '../../components/Tables/TabDailyMetricsTable';
import TabQuarterSection from '../../components/TabQuarterSection/TabQuarterSection';
import { MOCK_TAB_CATALOG } from '../../services/mockData';
import './Catalog.scss';

const CAT_ROOT_CAUSES = [
  { label: 'CAT_Triaged',  tooltip: 'Bug triaged and awaiting fix' },
  { label: 'CAT_IMPL',     tooltip: 'Implementation defect' },
  { label: 'CAT_NO_IMPL',  tooltip: 'No implementation found' },
  { label: 'CAT_REQ_GAP',  tooltip: 'Requirement gap' },
  { label: 'CAT_PUB',      tooltip: 'Published defect' },
  { label: 'CAT_CacheCLR', tooltip: 'Cache clear required' },
];
const CAT_RC_LABELS = CAT_ROOT_CAUSES.map(rc => rc.label);

export default function Catalog({ year, month, monthLabel, components, isCurrentPeriod, dashboardView, activeTab, isFiltered }) {
  const { data, loading, todayLabel } = useTabData({
    year, month, components,
    rcLabels: CAT_RC_LABELS,
    mockData:  MOCK_TAB_CATALOG,
    dashboardView, activeTab, isFiltered,
  });

  return (
    <div className={`catalog-page${loading ? ' catalog-page--loading' : ''}`}>
      {isCurrentPeriod && <CurrentDaySection data={data.currentDay} todayLabel={todayLabel} />}
      {isCurrentPeriod && (
        <RootCauseSection
          rootCauses={CAT_ROOT_CAUSES}
          defectsByRC={data.rootCause.today.defects}
          regressionByRC={data.rootCause.today.regression}
        />
      )}
      <MonthlyMetricsSection
        monthLabel={monthLabel}
        healthScore={data.monthly.healthScore}
        defectsByPriority={data.monthly.defectsByPriority}
      />
      <RootCausePrioritySection
        title="Defects by Root Cause & Priority"
        rootCauses={CAT_ROOT_CAUSES}
        data={data.rootCause.monthly.defects}
      />
      <RootCausePrioritySection
        title="Regression Defects by Root Cause & Priority"
        rootCauses={CAT_ROOT_CAUSES}
        data={data.rootCause.monthly.regression}
      />
      <Card>
        <SectionHeader eyebrow="Detailed Breakdown" title={`Daily Release Metrics — ${monthLabel}`} />
        <TabDailyMetricsTable
          rows={data.dailyMetrics.rows}
          totals={data.dailyMetrics.totals}
          year={year}
          month={month}
        />
      </Card>
      <TabQuarterSection quarters={data.quarters} year={year} month={month} />
    </div>
  );
}

Catalog.propTypes = {
  year:             PropTypes.string.isRequired,
  month:            PropTypes.string.isRequired,
  monthLabel:       PropTypes.string.isRequired,
  components:       PropTypes.string.isRequired,
  isCurrentPeriod:  PropTypes.bool.isRequired,
  dashboardView:    PropTypes.string.isRequired,
  activeTab:        PropTypes.string.isRequired,
  isFiltered:       PropTypes.bool.isRequired,
};
