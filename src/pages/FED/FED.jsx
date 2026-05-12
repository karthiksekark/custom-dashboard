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
import { MOCK_TAB_FED } from '../../services/mockData';
import './FED.scss';

const FED_ROOT_CAUSES = [
  { label: 'FED_Triaged',  tooltip: 'Bug triaged and awaiting fix' },
  { label: 'FED_IMPL',     tooltip: 'Implementation defect' },
  { label: 'FED_NO_IMPL',  tooltip: 'No implementation found' },
  { label: 'FED_REQ_GAP',  tooltip: 'Requirement gap' },
  { label: 'FED_PUB',      tooltip: 'Published defect' },
  { label: 'FED_CacheCLR', tooltip: 'Cache clear required' },
];
const FED_RC_LABELS = FED_ROOT_CAUSES.map(rc => rc.label);

export default function FED({ year, month, monthLabel, components }) {
  const { data, loading, todayLabel } = useTabData({
    year, month, components,
    rcLabels: FED_RC_LABELS,
    mockData:  MOCK_TAB_FED,
  });

  if (loading || !data) return null;

  return (
    <div className="fed-page">
      <CurrentDaySection data={data.currentDay} todayLabel={todayLabel} />
      <RootCauseSection
        rootCauses={FED_ROOT_CAUSES}
        defectsByRC={data.rootCause.today.defects}
        regressionByRC={data.rootCause.today.regression}
      />
      <MonthlyMetricsSection
        monthLabel={monthLabel}
        healthScore={data.monthly.healthScore}
        defectsByPriority={data.monthly.defectsByPriority}
      />
      <RootCausePrioritySection
        title="Defects by Root Cause & Priority"
        rootCauses={FED_ROOT_CAUSES}
        data={data.rootCause.monthly.defects}
      />
      <RootCausePrioritySection
        title="Regression Defects by Root Cause & Priority"
        rootCauses={FED_ROOT_CAUSES}
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

FED.propTypes = {
  year:       PropTypes.string.isRequired,
  month:      PropTypes.string.isRequired,
  monthLabel: PropTypes.string.isRequired,
  components: PropTypes.string.isRequired,
};
