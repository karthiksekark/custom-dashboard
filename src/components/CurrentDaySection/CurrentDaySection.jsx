import PropTypes from 'prop-types';
import { useRef, useEffect } from 'react';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import Card from '../Card/Card';
import SectionHeader from '../SectionHeader/SectionHeader';
import './CurrentDaySection.scss';

Chart.register(PieController, ArcElement, Tooltip, Legend);

const IMPL_COLORS     = ['#0284c7', '#7c3aed', '#ca8a04', '#16a34a'];
const PRIORITY_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#0284c7'];
const TEAMS           = ['UAT', 'OPUAT', 'CR_UAT', 'NOUAT'];
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
            hidden:      false,
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
      titleFont:       { size: 12 },
      bodyFont:        { size: 12 },
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

function InlinePie({ data, colors }) {
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
          backgroundColor: colors,
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
  }, [data, colors]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function ImplPanel({ data }) {
  const map   = Object.fromEntries((data || []).map(d => [d.name, d.value]));
  const total = (data || []).reduce((s, d) => s + d.value, 0);

  return (
    <div className="cds__panel">
      <div className="cds__panel-title">Implementation Tickets by Testing Team</div>
      <div className="cds__chart-area">
        {data?.length
          ? <InlinePie data={data} colors={IMPL_COLORS} />
          : <span className="cds__empty">No data to display</span>}
      </div>
      <table className="cds__table">
        <thead>
          <tr><th>Validation Team</th><th>Total</th></tr>
        </thead>
        <tbody>
          {TEAMS.map(t => (
            <tr key={t}>
              <td>{t}</td>
              <td>{map[t] ?? '–'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td>Total</td><td>{total || '–'}</td></tr>
        </tfoot>
      </table>
    </div>
  );
}

function PriorityPanel({ title, data }) {
  const map   = Object.fromEntries((data || []).map(d => [d.name, d.value]));
  const total = (data || []).reduce((s, d) => s + d.value, 0);

  return (
    <div className="cds__panel">
      <div className="cds__panel-title">{title}</div>
      <div className="cds__chart-area">
        {data?.length
          ? <InlinePie data={data} colors={PRIORITY_COLORS} />
          : <span className="cds__empty">No data to display</span>}
      </div>
      <table className="cds__table">
        <thead>
          <tr><th>Priority</th><th>Total</th></tr>
        </thead>
        <tbody>
          {PRIORITIES.map(p => (
            <tr key={p}>
              <td>{p}</td>
              <td>{map[p] ?? '–'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr><td>Total</td><td>{total || '–'}</td></tr>
        </tfoot>
      </table>
    </div>
  );
}

export default function CurrentDaySection({ data, todayLabel }) {
  return (
    <Card>
      <SectionHeader eyebrow="Current Day" title={`Defects vs Tickets — ${todayLabel}`} />
      <div className="cds__grid">
        <ImplPanel     data={data.impl} />
        <PriorityPanel title="Defects by Priority"            data={data.defects}    />
        <PriorityPanel title="Regression Defects by Priority" data={data.regression} />
      </div>
    </Card>
  );
}

CurrentDaySection.propTypes = {
  data: PropTypes.shape({
    impl:       PropTypes.array.isRequired,
    defects:    PropTypes.array.isRequired,
    regression: PropTypes.array.isRequired,
  }).isRequired,
  todayLabel: PropTypes.string.isRequired,
};
