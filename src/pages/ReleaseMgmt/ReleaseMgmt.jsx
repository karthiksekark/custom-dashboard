import PropTypes from 'prop-types';
import moment from 'moment-timezone';
import Card from '../../components/Card/Card';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import DoughnutGauge from '../../components/Charts/DoughnutGauge';
import PieChartPanel from '../../components/Charts/PieChartPanel';
import ImplementationTable from '../../components/Tables/ImplementationTable';
import DefectsAlertTable from '../../components/Tables/DefectsAlertTable';
import DailyMetricsTable from '../../components/Tables/DailyMetricsTable';
import QuarterCard from '../../components/QuarterCard/QuarterCard';
import { healthColor } from '../../services/healthUtils';
import './ReleaseMgmt.scss';

const EST = 'America/New_York';

const PRIORITY_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#0284c7'];
const STATUS_COLORS   = ['#16a34a', '#ea580c', '#2563eb', '#7c3aed', '#dc2626'];

export default function ReleaseMgmt({ data, year, month }) {
  const todayLabel = moment().tz(EST).format('M/D/YYYY');
  const monthLabel = moment(`${year}-${month}`, 'YYYY-MM').format('MMMM YYYY');
  const hc = healthColor(data.healthScore);

  return (
    <div className="release-mgmt">

      {/* Row 1: Health + Implementation */}
      <div className="release-mgmt__top-grid">
        <Card>
          <SectionHeader eyebrow="Health Monitor" title="Today's Health Score" />
          <div className="release-mgmt__health-body">
            <DoughnutGauge score={data.healthScore} />
            <div className="release-mgmt__health-badge" style={{ color: hc, background: `${hc}0f`, border: `1px solid ${hc}33` }}>
              ↑ +5 pts vs yesterday
            </div>
          </div>
        </Card>

        <Card>
          <SectionHeader eyebrow="Implementation" title={`Current Day's Tickets — ${todayLabel}`} />
          <ImplementationTable rows={data.implTickets} />
        </Card>
      </div>

      {/* Row 2: Defects Alert */}
      <Card variant="alert">
        <SectionHeader eyebrow="⚠ Alert" title={`Defects Not Closed before 8am — ${todayLabel}`} variant="alert" />
        <DefectsAlertTable rows={data.defectsTable} />
      </Card>

      {/* Row 3: Pie Charts */}
      <Card>
        <SectionHeader eyebrow="Analytics" title={`Daily Release Metrics — ${monthLabel}`} />
        <div className="release-mgmt__charts">
          <PieChartPanel
            title="Defects by Priority"
            data={data.defectsByPriority}
            colors={PRIORITY_COLORS}
          />
          <PieChartPanel
            title="Defects by Status"
            data={data.defectsByStatus}
            colors={STATUS_COLORS}
          />
        </div>
      </Card>

      {/* Row 4: Daily Metrics Table */}
      <Card>
        <SectionHeader eyebrow="Detailed Breakdown" title={`Daily Release Metrics — ${monthLabel}`} />
        <DailyMetricsTable rows={data.releaseRows} totals={data.totals} />
      </Card>

      {/* Row 5: Quarterly Overview */}
      <Card>
        <SectionHeader eyebrow="Quarterly Overview" title={`Quarterly Release Metrics — ${year}`} />
        <div className="release-mgmt__quarters">
          {data.quarters.map((q, i) => <QuarterCard key={i} quarter={q} />)}
        </div>
      </Card>

    </div>
  );
}

ReleaseMgmt.propTypes = {
  data:  PropTypes.object.isRequired,
  year:  PropTypes.string.isRequired,
  month: PropTypes.string.isRequired,
};
