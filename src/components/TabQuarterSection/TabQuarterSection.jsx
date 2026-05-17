import PropTypes from 'prop-types';
import Card from '../Card/Card';
import SectionHeader from '../SectionHeader/SectionHeader';
import TabQuarterCard from '../TabQuarterCard/TabQuarterCard';
import './TabQuarterSection.scss';

export default function TabQuarterSection({ quarters, year, month, components }) {
  const activeQIndex = Math.ceil(Number(month) / 3) - 1;

  return (
    <Card>
      <SectionHeader eyebrow="Quarterly Overview" title={`Quarterly Metrics — ${year}`} />
      <div className="tqs__grid">
        {quarters.map((q, i) => (
          <TabQuarterCard
            key={i}
            quarter={q}
            isActive={i === activeQIndex}
            components={components}
          />
        ))}
      </div>
    </Card>
  );
}

TabQuarterSection.propTypes = {
  quarters:   PropTypes.arrayOf(PropTypes.object).isRequired,
  year:       PropTypes.string.isRequired,
  month:      PropTypes.string.isRequired,
  components: PropTypes.string,
};
