import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Chart, DoughnutController, ArcElement, Tooltip } from 'chart.js';
import { healthColor } from '../../services/healthUtils';
import './Charts.scss';

Chart.register(DoughnutController, ArcElement, Tooltip);

const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    const { width, height, left, top } = chartArea;
    const score = chart.config.options.plugins.centerText?.score;
    if (score == null) return;

    const cx = left + width / 2;
    const cy = top  + height / 2;
    const color = healthColor(score);

    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    ctx.font      = `700 28px system-ui, sans-serif`;
    ctx.fillStyle = color;
    ctx.fillText(score, cx, cy - 8);

    ctx.font      = `11px system-ui, sans-serif`;
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('/100', cx, cy + 14);

    ctx.restore();
  },
};

export default function DoughnutGauge({ score }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (score == null || !canvasRef.current) return;

    const color = healthColor(score);

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        datasets: [{
          data:            [score, 100 - score],
          backgroundColor: [color, '#e0f2fe'],
          borderWidth:     0,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: true,
        cutout:              '75%',
        rotation:            -90,
        circumference:       360,
        plugins: {
          legend:     { display: false },
          tooltip:    { enabled: false },
          centerText: { score },
        },
      },
      plugins: [centerTextPlugin],
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [score]);

  if (score == null) {
    return (
      <div className="gauge gauge--empty">
        <span className="gauge__empty">No data to display</span>
      </div>
    );
  }

  return (
    <div className="gauge">
      <canvas ref={canvasRef} />
    </div>
  );
}

DoughnutGauge.propTypes = {
  score: PropTypes.number,
};
