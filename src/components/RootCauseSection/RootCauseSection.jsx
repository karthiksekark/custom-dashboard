import PropTypes from 'prop-types';
import Card from '../Card/Card';
import SectionHeader from '../SectionHeader/SectionHeader';
import './RootCauseSection.scss';

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

function fmt(v) {
  return v > 0 ? <span className="rcs__count">{v}</span> : <span className="rcs__dash">–</span>;
}

function InfoTooltip({ text }) {
  return (
    <span className="rcs__tooltip">
      <span className="rcs__tooltip-icon">ⓘ</span>
      <span className="rcs__tooltip-text">{text}</span>
    </span>
  );
}

function RootCauseTable({ rootCauses, data }) {
  const colTotals = PRIORITIES.reduce((acc, p) => {
    acc[p] = rootCauses.reduce((s, rc) => s + (data[rc.label]?.[p] || 0), 0);
    return acc;
  }, {});
  const grandTotal = PRIORITIES.reduce((s, p) => s + colTotals[p], 0);

  return (
    <table className="rcs__table">
      <thead>
        <tr>
          <th>Root Cause</th>
          {PRIORITIES.map(p => <th key={p}>{p}</th>)}
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {rootCauses.map(rc => {
          const counts = data[rc.label] || {};
          const rowTotal = PRIORITIES.reduce((s, p) => s + (counts[p] || 0), 0);
          return (
            <tr key={rc.label}>
              <td>
                <span className="rcs__rc-label">{rc.label}</span>
                <InfoTooltip text={rc.tooltip} />
              </td>
              {PRIORITIES.map(p => <td key={p}>{fmt(counts[p] || 0)}</td>)}
              <td>{fmt(rowTotal)}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr>
          <td>Total</td>
          {PRIORITIES.map(p => <td key={p}>{fmt(colTotals[p])}</td>)}
          <td>{fmt(grandTotal)}</td>
        </tr>
      </tfoot>
    </table>
  );
}

export default function RootCauseSection({ rootCauses, defectsByRC, regressionByRC }) {
  return (
    <Card>
      <div className="rcs__grid">
        <div className="rcs__panel">
          <SectionHeader eyebrow="Root Cause Analysis" title="Defects by Root Cause" />
          <div className="rcs__table-wrap">
            <RootCauseTable rootCauses={rootCauses} data={defectsByRC} />
          </div>
        </div>
        <div className="rcs__panel rcs__panel--right">
          <SectionHeader eyebrow="Root Cause Analysis" title="Regression Defects by Root Cause" />
          <div className="rcs__table-wrap">
            <RootCauseTable rootCauses={rootCauses} data={regressionByRC} />
          </div>
        </div>
      </div>
    </Card>
  );
}

RootCauseSection.propTypes = {
  rootCauses:   PropTypes.arrayOf(PropTypes.shape({
    label:   PropTypes.string.isRequired,
    tooltip: PropTypes.string.isRequired,
  })).isRequired,
  defectsByRC:    PropTypes.object.isRequired,
  regressionByRC: PropTypes.object.isRequired,
};
