import PropTypes from 'prop-types';
import { useCurrentDayData } from '../../hooks/useCurrentDayData';
import CurrentDaySection from '../../components/CurrentDaySection/CurrentDaySection';
import { MOCK_CURRENT_DAY_FED } from '../../services/mockData';
import './FED.scss';

export default function FED({ components }) {
  const { data, loading, todayLabel } = useCurrentDayData(components, MOCK_CURRENT_DAY_FED);

  if (loading || !data) return null;

  return (
    <div className="fed-page">
      <CurrentDaySection data={data} todayLabel={todayLabel} />
    </div>
  );
}

FED.propTypes = {
  components: PropTypes.string.isRequired,
};
