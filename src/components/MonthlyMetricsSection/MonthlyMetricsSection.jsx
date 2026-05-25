import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import Card from '../Card/Card';
import SectionHeader from '../SectionHeader/SectionHeader';
import DoughnutGauge from '../Charts/DoughnutGauge';
import { healthColor } from '../../services/healthUtils';
import './MonthlyMetricsSection.scss';

Chart.register(PieController, ArcElement, Tooltip, Legend);

const PRIORITY_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#0284c7'];
const PRIORITIES      = ['Critical', 'High', 'Medium', 'Low'];

const PIE_OPTIONS = {
  responsive:          true,
  maintainAspectRatio: false,
  layout: { padding: { right: 4 } },
  plugins: {
    legend: {
      position: 'right',
      align:    'center',
      labels: {
        boxWidth:      8,
        usePointStyle: true,
        pointStyle:    'circle',
        color:         '#94a3b8',
        font:          { size: 11, family: 'system-ui, sans-serif' },
        padding:       12,
        generateLabels: chart => {
          const ds = chart.data.datasets[0];
          return chart.data.labels.map((label, i) => ({
            text:        label,
            fillStyle:   ds.backgroundColor[i],
            strokeStyle: 'transparent',
            hidden:      !chart.getDataVisibility(i),
            index:       i,
          }));
        },
      },
    },
    tooltip: {
      backgroundColor: '#fff',
      borderColor:     '#bae6fd',
      borderWidth:     1,
      titleColor:      '#0c4a6e',
      bodyColor:       '#0c4a6e',
      padding:         10,
      callbacks: {
        label: ctx => {
          const total = ctx.dataset.data.reduce((s, v) => s + v, 0);
          const pct   = total ? Math.round((ctx.parsed / total) * 100) : 0;
          return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
        },
      },
    },
  },
};

function TrendBadge({ current, prev, inverseColor = false }) {
  if (prev == null || current == null || prev === 0) return null;
  const delta  = current - prev;
  if (delta === 0) return null;
  const isGood = inverseColor ? delta < 0 : delta > 0;
  const arrow  = delta > 0 ? '↑' : '↓';
  const abs    = Math.abs(delta);
  return (
    <span className={`trend-badge trend-badge--${isGood ? 'good' : 'bad'}`}>
      {arrow} {abs} vs last month
    </span>
  );
}

function InfoTooltip({ text }) {
  return (
    <span className="mms__tooltip">
      <span className="mms__tooltip-icon">ⓘ</span>
      <span className="mms__tooltip-text">{text}</span>
    </span>
  );
}

function PriorityPie({ data }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'pie',
      data: {
        labels:   data.map(d => d.name),
        datasets: [{
          data:            data.map(d => d.value),
          backgroundColor: PRIORITY_COLORS,
          borderWidth:     2,
          borderColor:     '#fff',
          hoverOffset:     6,
        }],
      },
      options: PIE_OPTIONS,
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function MonthlyMetricsSection({
  monthLabel,
  healthScore,
  defectsByPriority,
  prevHealthScore,
  prevDefectsTotal,
}) {
  const map              = Object.fromEntries((defectsByPriority || []).map(d => [d.name, d.value]));
  const total            = (defectsByPriority || []).reduce((s, d) => s + d.value, 0);
  const currDefectsTotal = (defectsByPriority || []).reduce((s, d) => s + (d.value || 0), 0);
  const hc               = healthColor(healthScore);

  return (
    <Card>
      <SectionHeader eyebrow="Monthly Metrics" title={monthLabel} />
      <div className="mms__grid">

        {/* Health Score */}
        <div className="mms__panel">
          <div className="mms__panel-title">Average Health Score</div>
          <div className="mms__health-body">
            <DoughnutGauge score={healthScore} />
            <div className="mms__health-badge" style={{ '--hc': hc }}>
              {healthScore != null ? `${healthScore}/100` : 'No data'}
            </div>
            <TrendBadge current={healthScore} prev={prevHealthScore} />
          </div>
        </div>

        {/* Defects by Priority — pie */}
        <div className="mms__panel mms__panel--border">
          <div className="mms__panel-title">
            Defects by Priority (Visual)
            <InfoTooltip text="Monthly defect distribution by priority" />
          </div>
          <div className="mms__chart-area">
            {defectsByPriority?.length
              ? <PriorityPie data={defectsByPriority} />
              : <span className="mms__empty">No data to display</span>}
          </div>
        </div>

        {/* Defects by Priority — table */}
        <div className="mms__panel mms__panel--border">
          <div className="mms__panel-title">
            Defects by Priority
            <InfoTooltip text="Total defects grouped by priority for the selected month" />
          </div>
          <table className="mms__table">
            <thead>
              <tr><th>Priority</th><th>Total</th></tr>
            </thead>
            <tbody>
              {PRIORITIES.map(p => (
                <tr key={p}>
                  <td>{p}</td>
                  <td>{map[p] ? <span className="mms__count">{map[p]}</span> : <span className="mms__dash">–</span>}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                <td>
                  {total
                    ? <span className="mms__total">{total}</span>
                    : <span className="mms__dash">–</span>}
                  <TrendBadge current={currDefectsTotal} prev={prevDefectsTotal} inverseColor />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

      </div>
    </Card>
  );
}

MonthlyMetricsSection.propTypes = {
  monthLabel:        PropTypes.string.isRequired,
  healthScore:       PropTypes.number,
  defectsByPriority: PropTypes.arrayOf(PropTypes.shape({
    name:  PropTypes.string,
    value: PropTypes.number,
  })),
  prevHealthScore:   PropTypes.number,
  prevDefectsTotal:  PropTypes.number,
};
