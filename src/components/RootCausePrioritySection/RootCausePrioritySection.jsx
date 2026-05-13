import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Chart, PieController, ArcElement, Tooltip, Legend } from 'chart.js';
import Card from '../Card/Card';
import SectionHeader from '../SectionHeader/SectionHeader';
import './RootCausePrioritySection.scss';

Chart.register(PieController, ArcElement, Tooltip, Legend);

// 6 distinguishable sky-blue-theme colors — one per root cause slot
const RC_COLORS       = ['#0284c7', '#0ea5e9', '#ca8a04', '#16a34a', '#7c3aed', '#38bdf8'];
const PRIORITY_COLORS = ['#dc2626', '#ea580c', '#ca8a04', '#0284c7'];
const PRIORITIES      = ['Critical', 'High', 'Medium', 'Low'];

function makePieOptions(legendTitle) {
  return {
    responsive:          true,
    maintainAspectRatio: false,
    layout: { padding: { right: 4 } },
    plugins: {
      legend: {
        position: 'right',
        align:    'center',
        title: {
          display: true,
          text:    legendTitle,
          color:   '#94a3b8',
          font:    { size: 11, family: 'system-ui, sans-serif' },
          padding: { bottom: 6 },
        },
        labels: {
          boxWidth:      8,
          usePointStyle: true,
          pointStyle:    'circle',
          color:         '#94a3b8',
          font:          { size: 11, family: 'system-ui, sans-serif' },
          padding:       10,
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
}

const RC_PIE_OPTIONS       = makePieOptions('Filter by');
const PRIORITY_PIE_OPTIONS = makePieOptions('Filter by');

function InlinePie({ labels, values, colors, options }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          data:            values,
          backgroundColor: colors,
          borderWidth:     2,
          borderColor:     '#fff',
          hoverOffset:     6,
        }],
      },
      options,
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [labels, values, colors, options]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function InfoTooltip({ text }) {
  return (
    <span className="rcps__tooltip">
      <span className="rcps__tooltip-icon">ⓘ</span>
      <span className="rcps__tooltip-text">{text}</span>
    </span>
  );
}

export default function RootCausePrioritySection({ title, rootCauses, data }) {
  // Left pie — aggregate total per root cause
  const rcPieEntries = rootCauses
    .map((rc, i) => ({
      label: rc.label,
      color: RC_COLORS[i % RC_COLORS.length],
      value: PRIORITIES.reduce((s, p) => s + (data[rc.label]?.[p] || 0), 0),
    }))
    .filter(e => e.value > 0);

  // Right pie — aggregate total per priority
  const priorityTotals = PRIORITIES.reduce((acc, p) => {
    acc[p] = rootCauses.reduce((s, rc) => s + (data[rc.label]?.[p] || 0), 0);
    return acc;
  }, {});
  const priorityPieEntries = PRIORITIES
    .map((p, i) => ({ label: p, color: PRIORITY_COLORS[i], value: priorityTotals[p] }))
    .filter(e => e.value > 0);

  // Column totals for table footer
  const colTotals = PRIORITIES.reduce((acc, p) => {
    acc[p] = rootCauses.reduce((s, rc) => s + (data[rc.label]?.[p] || 0), 0);
    return acc;
  }, {});
  const grandTotal = PRIORITIES.reduce((s, p) => s + colTotals[p], 0);

  return (
    <Card>
      <SectionHeader eyebrow="Root Cause Analysis" title={title} />
      <div className="rcps__grid">

        {/* Left: By Root Cause pie */}
        <div className="rcps__chart-panel">
          <div className="rcps__chart-title">By Root Cause</div>
          <div className="rcps__chart-area">
            {rcPieEntries.length
              ? <InlinePie
                  labels={rcPieEntries.map(e => e.label)}
                  values={rcPieEntries.map(e => e.value)}
                  colors={rcPieEntries.map(e => e.color)}
                  options={RC_PIE_OPTIONS}
                />
              : <span className="rcps__empty">No data</span>}
          </div>
        </div>

        {/* Center: Root Cause × Priority table */}
        <div className="rcps__table-panel">
          <table className="rcps__table">
            <thead>
              <tr>
                <th>Root Cause</th>
                {PRIORITIES.map(p => <th key={p}>{p}</th>)}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {rootCauses.map(rc => {
                const counts   = data[rc.label] || {};
                const rowTotal = PRIORITIES.reduce((s, p) => s + (counts[p] || 0), 0);
                return (
                  <tr key={rc.label}>
                    <td>
                      <span className="rcps__rc-label">{rc.label}</span>
                      <InfoTooltip text={rc.tooltip} />
                    </td>
                    {PRIORITIES.map(p => (
                      <td key={p}>
                        {counts[p]
                          ? <span className="rcps__count">{counts[p]}</span>
                          : <span className="rcps__dash">–</span>}
                      </td>
                    ))}
                    <td>
                      {rowTotal
                        ? <span className="rcps__count">{rowTotal}</span>
                        : <span className="rcps__dash">–</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                {PRIORITIES.map(p => (
                  <td key={p}>
                    {colTotals[p]
                      ? <span className="rcps__total">{colTotals[p]}</span>
                      : <span className="rcps__dash">–</span>}
                  </td>
                ))}
                <td>
                  {grandTotal
                    ? <span className="rcps__total">{grandTotal}</span>
                    : <span className="rcps__dash">–</span>}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Right: By Priority pie */}
        <div className="rcps__chart-panel rcps__chart-panel--right">
          <div className="rcps__chart-title">By Priority</div>
          <div className="rcps__chart-area">
            {priorityPieEntries.length
              ? <InlinePie
                  labels={priorityPieEntries.map(e => e.label)}
                  values={priorityPieEntries.map(e => e.value)}
                  colors={priorityPieEntries.map(e => e.color)}
                  options={PRIORITY_PIE_OPTIONS}
                />
              : <span className="rcps__empty">No data</span>}
          </div>
        </div>

      </div>
    </Card>
  );
}

RootCausePrioritySection.propTypes = {
  title:      PropTypes.string.isRequired,
  rootCauses: PropTypes.arrayOf(PropTypes.shape({
    label:   PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired,
  })).isRequired,
  data: PropTypes.object.isRequired,
};
