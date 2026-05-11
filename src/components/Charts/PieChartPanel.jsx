import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './Charts.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

const OPTIONS = {
  responsive:          true,
  maintainAspectRatio: false,
  layout: {
    padding: { right: 4 },
  },
  plugins: {
    legend: {
      position: 'right',
      align:    'center',
      labels: {
        boxWidth:       8,
        usePointStyle:  true,
        pointStyle:     'circle',
        color:          '#94a3b8',
        font:           { size: 11, family: 'system-ui, sans-serif' },
        padding:        12,
        generateLabels: chart => {
          const dataset = chart.data.datasets[0];
          return chart.data.labels.map((label, i) => ({
            text:        label,
            fillStyle:   dataset.backgroundColor[i],
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

export default function PieChartPanel({ title, data, colors }) {
  const chartData = useMemo(() => ({
    labels: data.map(d => d.name),
    datasets: [{
      data:            data.map(d => d.value),
      backgroundColor: colors,
      borderWidth:     2,
      borderColor:     '#fff',
      hoverOffset:     6,
    }],
  }), [data, colors]);

  return (
    <div className="chart-panel">
      <div className="chart-panel__title">{title}</div>
      <div className="chart-panel__canvas chart-panel__canvas--with-legend">
        <Pie data={chartData} options={OPTIONS} />
      </div>
    </div>
  );
}

PieChartPanel.propTypes = {
  title:  PropTypes.string.isRequired,
  data:   PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, value: PropTypes.number })).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};
