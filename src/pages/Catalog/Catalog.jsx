import PropTypes from 'prop-types';
import { useTabData } from '../../hooks/useTabData';
import CurrentDaySection from '../../components/CurrentDaySection/CurrentDaySection';
import RootCauseSection from '../../components/RootCauseSection/RootCauseSection';
import MonthlyMetricsSection from '../../components/MonthlyMetricsSection/MonthlyMetricsSection';
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

export default function Catalog({ year, month, monthLabel, components }) {
  const { data, loading, todayLabel } = useTabData({
    year, month, components,
    rcLabels: CAT_RC_LABELS,
    mockData:  MOCK_TAB_CATALOG,
  });

  if (loading || !data) return null;

  return (
    <div className="catalog-page">
      <CurrentDaySection data={data.currentDay} todayLabel={todayLabel} />
      <RootCauseSection
        rootCauses={CAT_ROOT_CAUSES}
        defectsByRC={data.rootCause.defects}
        regressionByRC={data.rootCause.regression}
      />
      <MonthlyMetricsSection
        monthLabel={monthLabel}
        healthScore={data.monthly.healthScore}
        defectsByPriority={data.monthly.defectsByPriority}
      />
    </div>
  );
}

Catalog.propTypes = {
  year:       PropTypes.string.isRequired,
  month:      PropTypes.string.isRequired,
  monthLabel: PropTypes.string.isRequired,
  components: PropTypes.string.isRequired,
};
