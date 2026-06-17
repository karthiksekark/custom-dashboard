import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import moment from 'moment-timezone';
import Card from '../../components/Card/Card';
import SectionHeader from '../../components/SectionHeader/SectionHeader';
import DoughnutGauge from '../../components/Charts/DoughnutGauge';
import PieChartPanel from '../../components/Charts/PieChartPanel';
import ImplementationTable from '../../components/Tables/ImplementationTable';
import DefectsAlertTable from '../../components/Tables/DefectsAlertTable';
import DailyMetricsTable from '../../components/Tables/DailyMetricsTable';
import QuarterCard from '../../components/QuarterCard/QuarterCard';
import ErrorCard from '../../components/ErrorCard/ErrorCard';
import { healthColor } from '../../services/healthUtils';
import { useJiraData } from '../../hooks/useJiraData';
import { useToast } from '../../context/ToastContext';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import './ReleaseMgmt.scss';

const EST = 'America/New_York';

const PRIORITY_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#0284c7'];
const STATUS_COLORS   = ['#16a34a', '#ea580c', '#2563eb', '#7c3aed', '#dc2626'];

// Quarter ranges span 3 months; rangeJql covers single months, so we compute manually here.
// Compute [startDate, endDate] in ISO for a given quarter index (0–3) and year
function quarterDateRange(yearStr, qIndex) {
  const startMonth = qIndex * 3;        // 0-indexed JS month: Q1=0, Q2=3, Q3=6, Q4=9
  const y          = Number(yearStr);
  const start = moment.tz({ year: y, month: startMonth,     day: 1 }, EST).startOf('month').format('YYYY-MM-DD');
  const end   = moment.tz({ year: y, month: startMonth + 2, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  return { startDate: start, endDate: end };
}

// Wraps SectionHeader with a freshness label and refresh button on the right.
// Reuses .cds__* classes already defined in CurrentDaySection.scss.
function CardHeader({ eyebrow, title, variant, onRefresh, isRefreshing, lastFetchedAt }) {
  const fetchedLabel = lastFetchedAt
    ? `Updated ${lastFetchedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : null;
  return (
    <div className="cds__header-row">
      <SectionHeader eyebrow={eyebrow} title={title} variant={variant} />
      <div className="cds__header-actions">
        {fetchedLabel && <span className="cds__freshness">{fetchedLabel}</span>}
        <button
          className={`cds__refresh-btn${isRefreshing ? ' cds__refresh-btn--loading' : ''}`}
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label={isRefreshing ? 'Refreshing…' : 'Refresh'}
          title={isRefreshing ? 'Refreshing…' : 'Refresh'}
        >
          {isRefreshing ? '…' : '↻'}
        </button>
      </div>
    </div>
  );
}

CardHeader.propTypes = {
  eyebrow:       PropTypes.string.isRequired,
  title:         PropTypes.string.isRequired,
  variant:       PropTypes.string,
  onRefresh:     PropTypes.func.isRequired,
  isRefreshing:  PropTypes.bool,
  lastFetchedAt: PropTypes.instanceOf(Date),
};

export default function ReleaseMgmt({ components, year, month, day, isCurrentPeriod, dashboardView, activeTab, isFiltered }) {
  const { data, loading, error, usingMock, lastFetchedAt, refresh } = useJiraData({ year, month, day, components, dashboardView, activeTab, isFiltered });

  const { show: showToast } = useToast();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (lastFetchedAt) {
      if (hasLoadedRef.current) showToast('Data refreshed');
      else hasLoadedRef.current = true;
    }
  }, [lastFetchedAt, showToast]);

  // ── Derived date values (all EST) ──────────────────────────────────────────
  const todayMoment  = moment().tz(EST);
  const todayLabel   = todayMoment.format('M/D/YYYY');
  const todayIso     = todayMoment.format('YYYY-MM-DD');
  const monthLabel   = moment.tz(`${year}-${month}`, 'YYYY-MM', EST).format('MMMM YYYY');

  // ── Active quarter: 0-based index of the quarter containing selected month ─
  const activeQIndex = Math.ceil(Number(month) / 3) - 1;  // 0–3

  // ── Enrich each quarter with computed date ranges for JIRA links ───────────
  const enrichedQuarters = data.quarters.map((q) => {
    // Parse year from quarter label, e.g. "2Q26" → "2026"
    const qYear = '20' + q.q.slice(-2);
    const qIdx  = Number(q.q[0]) - 1;   // "2Q26" → 1
    return { ...q, ...quarterDateRange(qYear, qIdx) };
  });

  const hc = healthColor(data.healthScore);

  if (loading) {
    return (
      <div className="release-mgmt">
        <LoadingSkeleton showChart rows={3} />
        <LoadingSkeleton showChart={false} rows={4} />
        <LoadingSkeleton showChart rows={5} />
      </div>
    );
  }

  return (
    <div className={`release-mgmt${loading ? ' release-mgmt--loading' : ''}`}>

      {error && <ErrorCard message={error} isMock={usingMock} onRetry={refresh} />}

      {/* ── Row 1: Health gauge + (current period only) Implementation table ── */}
      {isCurrentPeriod ? (
        <div className="release-mgmt__top-grid">
          <Card>
            <CardHeader eyebrow="Health Monitor" title="Today's Health Score" onRefresh={refresh} isRefreshing={loading} lastFetchedAt={lastFetchedAt} />
            <div className="release-mgmt__health-body">
              <DoughnutGauge score={data.healthScore} />
              <div className="release-mgmt__health-badge" style={{ '--hc': hc }}>
                ↑ +5 pts vs yesterday
              </div>
              {data.prevPeriod?.healthScore != null && data.healthScore != null && (
                <div className={`rm-trend rm-trend--${data.healthScore >= data.prevPeriod.healthScore ? 'good' : 'bad'}`}>
                  {data.healthScore >= data.prevPeriod.healthScore ? '↑' : '↓'}{' '}
                  {Math.abs(data.healthScore - data.prevPeriod.healthScore).toFixed(1)} pts vs last month
                </div>
              )}
            </div>
          </Card>

          <Card>
            <CardHeader eyebrow="Implementation" title={`Current Day's Tickets — ${todayLabel}`} onRefresh={refresh} isRefreshing={loading} lastFetchedAt={lastFetchedAt} />
            <ImplementationTable rows={data.implTickets} todayIso={todayIso} components={components} />
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader eyebrow="Health Monitor" title="Today's Health Score" onRefresh={refresh} isRefreshing={loading} lastFetchedAt={lastFetchedAt} />
          <div className="release-mgmt__health-body">
            <DoughnutGauge score={data.healthScore} />
            <div className="release-mgmt__health-badge" style={{ '--hc': hc }}>
              ↑ +5 pts vs yesterday
            </div>
            {data.prevPeriod?.healthScore != null && data.healthScore != null && (
              <div className={`rm-trend rm-trend--${data.healthScore >= data.prevPeriod.healthScore ? 'good' : 'bad'}`}>
                {data.healthScore >= data.prevPeriod.healthScore ? '↑' : '↓'}{' '}
                {Math.abs(data.healthScore - data.prevPeriod.healthScore).toFixed(1)} pts vs last month
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ── Row 2: Defects alert (current period only) ── */}
      {isCurrentPeriod && (
        <Card variant="alert">
          <CardHeader eyebrow="&#9888; Alert" title={`Defects Not Closed before 8am — ${todayLabel}`} variant="alert" onRefresh={refresh} isRefreshing={loading} lastFetchedAt={lastFetchedAt} />
          <DefectsAlertTable rows={data.defectsTable} todayIso={todayIso} components={components} />
        </Card>
      )}

      {/* ── Row 3: Pie charts ── */}
      <Card>
        <CardHeader eyebrow="Analytics" title={`Daily Release Metrics — ${monthLabel}`} onRefresh={refresh} isRefreshing={loading} lastFetchedAt={lastFetchedAt} />
        <div className="release-mgmt__charts">
          <PieChartPanel title="Defects by Priority" data={data.defectsByPriority} colors={PRIORITY_COLORS} />
          <PieChartPanel title="Defects by Status"   data={data.defectsByStatus}   colors={STATUS_COLORS}   />
        </div>
      </Card>

      {/* ── Row 4: Daily metrics table ── */}
      <Card>
        <CardHeader eyebrow="Detailed Breakdown" title={`Daily Release Metrics — ${monthLabel}`} onRefresh={refresh} isRefreshing={loading} lastFetchedAt={lastFetchedAt} />
        <DailyMetricsTable
          rows={data.releaseRows}
          totals={data.totals}
          year={year}
          month={month}
          components={components}
        />
      </Card>

      {/* ── Row 5: Quarterly overview ── */}
      <Card>
        <CardHeader eyebrow="Quarterly Overview" title={`Quarterly Release Metrics — ${year}`} onRefresh={refresh} isRefreshing={loading} lastFetchedAt={lastFetchedAt} />
        <div className="release-mgmt__quarters">
          {enrichedQuarters.map((q, i) => (
            <QuarterCard
              key={i}
              quarter={q}
              isActive={i === activeQIndex}
              components={components}
            />
          ))}
        </div>
      </Card>

    </div>
  );
}

ReleaseMgmt.propTypes = {
  components:      PropTypes.string.isRequired,
  year:            PropTypes.string.isRequired,
  month:           PropTypes.string.isRequired,
  day:             PropTypes.string,
  isCurrentPeriod: PropTypes.bool.isRequired,
  dashboardView:   PropTypes.string.isRequired,
  activeTab:       PropTypes.string.isRequired,
  isFiltered:      PropTypes.bool.isRequired,
};
