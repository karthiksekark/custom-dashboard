import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './Charts.scss';

ChartJS.register(ArcElement, Tooltip, Legend);

const OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 8,
        usePointStyle: true,
        pointStyle: 'circle',
        color: '#94a3b8',
        font: { size: 11 },
        padding: 10,
      },
    },
    tooltip: {
      backgroundColor: '#fff',
      borderColor: '#bae6fd',
      borderWidth: 1,
      titleColor: '#0c4a6e',
      bodyColor: '#0c4a6e',
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      padding: 10,
      callbacks: {
        label: ctx => ` ${ctx.label}: ${ctx.parsed}`,
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
      borderWidth:     0,
    }],
  }), [data, colors]);

  return (
    <div className="chart-panel">
      <div className="chart-panel__title">{title}</div>
      <div className="chart-panel__canvas">
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
