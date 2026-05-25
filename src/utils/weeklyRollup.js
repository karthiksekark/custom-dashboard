import moment from 'moment-timezone';

const TZ = 'America/New_York';

function isoWeek(dateStr, year) {
  const [mo, dy] = dateStr.split('/').map(Number);
  return moment.tz(
    `${year}-${String(mo).padStart(2, '0')}-${String(dy).padStart(2, '0')}`,
    TZ,
  ).isoWeek();
}

function buildRollup(rows) {
  const sum = k => rows.reduce((s, r) => s + (r[k] || 0), 0);
  const hsVals = rows.map(r => r.hs).filter(v => v != null);
  const hs = hsVals.length
    ? parseFloat((hsVals.reduce((s, v) => s + v, 0) / hsVals.length).toFixed(1))
    : null;
  return {
    isRollup: true,
    label: `${rows[0].date} – ${rows[rows.length - 1].date}`,
    t: sum('t'), d: sum('d'),
    c: sum('c'), h: sum('h'), m: sum('m'), l: sum('l'),
    rg: sum('rg'), fp: sum('fp'), dp: sum('dp'),
    hs,
  };
}

// Groups rows by ISO week; inserts a rollup row after each group of 2+ rows.
export function groupByWeek(rows, year) {
  if (!rows || rows.length < 2) return rows || [];

  const result = [];
  let group    = [];
  let curWeek  = null;

  for (const row of rows) {
    const w = isoWeek(row.date, year);
    if (curWeek === null) curWeek = w;
    if (w !== curWeek) {
      if (group.length > 1) result.push(...group, buildRollup(group));
      else result.push(...group);
      group   = [];
      curWeek = w;
    }
    group.push(row);
  }
  if (group.length > 1) result.push(...group, buildRollup(group));
  else result.push(...group);

  return result;
}
