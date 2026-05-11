import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { healthColor } from '../../services/healthUtils';
import './Charts.scss';

ChartJS.register(ArcElement, Tooltip);

// Centre-text plugin (registered locally so it doesn't bleed to other charts)
const centerTextPlugin = {
  id: 'centerText',
  afterDraw(chart) {
    const { ctx, chartArea: { width, height, left, top } } = chart;
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
  const color = healthColor(score);

  const chartData = useMemo(() => ({
    datasets: [{
      data:            [score ?? 0, 100 - (score ?? 0)],
      backgroundColor: [color, '#e0f2fe'],
      borderWidth:     0,
    }],
  }), [score, color]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    cutout: '75%',
    rotation: -90,
    circumference: 360,
    plugins: {
      legend:     { display: false },
      tooltip:    { enabled: false },
      centerText: { score },
    },
  }), [score]);

  return (
    <div className="gauge">
      <Doughnut data={chartData} options={options} plugins={[centerTextPlugin]} />
    </div>
  );
}

DoughnutGauge.propTypes = {
  score: PropTypes.number,
};
