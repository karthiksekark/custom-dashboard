import PropTypes from 'prop-types';
import { useCurrentDayData } from '../../hooks/useCurrentDayData';
import CurrentDaySection from '../../components/CurrentDaySection/CurrentDaySection';
import { MOCK_CURRENT_DAY_CATALOG } from '../../services/mockData';
import './Catalog.scss';

export default function Catalog({ components }) {
  const { data, loading, todayLabel } = useCurrentDayData(components, MOCK_CURRENT_DAY_CATALOG);

  if (loading || !data) return null;

  return (
    <div className="catalog-page">
      <CurrentDaySection data={data} todayLabel={todayLabel} />
    </div>
  );
}

Catalog.propTypes = {
  components: PropTypes.string.isRequired,
};
