import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import './Charts.scss';

Chart.register(ArcElement, Tooltip, Legend);

export default function PieChartPanel({ title, data, colors }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const isEmpty = !data.length || data.every(d => !d.value);

  useEffect(() => {
    if (isEmpty || !canvasRef.current) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'pie',
      data: {
        labels: data.map(d => d.name),
        datasets: [{
          data:            data.map(d => d.value),
          backgroundColor: colors,
          borderWidth:     2,
          borderColor:     '#fff',
          hoverOffset:     6,
        }],
      },
      options: {
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
              boxWidth:      8,
              usePointStyle: true,
              pointStyle:    'circle',
              color:         '#94a3b8',
              font:          { size: 11, family: 'system-ui, sans-serif' },
              padding:       12,
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
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [data, colors, isEmpty]);

  return (
    <div className="chart-panel">
      <div className="chart-panel__title">{title}</div>
      <div className="chart-panel__canvas chart-panel__canvas--with-legend">
        {isEmpty
          ? <span className="chart-panel__empty">No data to display</span>
          : <canvas ref={canvasRef} />
        }
      </div>
    </div>
  );
}

PieChartPanel.propTypes = {
  title:  PropTypes.string.isRequired,
  data:   PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string, value: PropTypes.number })).isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
};
