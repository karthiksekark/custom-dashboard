import moment from 'moment-timezone';

const JIRA_BASE   = import.meta.env.VITE_JIRA_BASE_URL || '';
const EST         = 'America/New_York';
const MAX_RESULTS = 1000;

// ── Helpers ───────────────────────────────────────────────────────────────────
async function jiraFetch(path, options = {}) {
  const res = await fetch(`${JIRA_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`JIRA ${res.status}: ${path}`);
  return res.json();
}

function jqlSearch(jql) {
  return jiraFetch('/rest/api/2/search', {
    method: 'POST',
    body: JSON.stringify({
      jql,
      maxResults: MAX_RESULTS,
      fields: ['priority', 'status', 'created', 'resolutiondate', 'assignee', 'labels', 'issuetype'],
    }),
  });
}

function rangeJql(year, month) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  return { start, end };
}

// Builds  AND component in ("A", "B")  from a comma-separated string
function compClause(components) {
  if (!components?.trim()) return '';
  const names = components.split(',').map(c => c.trim()).filter(Boolean);
  if (!names.length) return '';
  return ` AND component in (${names.map(n => `"${n}"`).join(', ')})`;
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function fetchDefectsByPriority(year, month, components) {
  const { start, end } = rangeJql(year, month);
  const jql  = `issuetype = Bug${compClause(components)} AND created >= "${start}" AND created <= "${end}" ORDER BY created DESC`;
  const data = await jqlSearch(jql);

  const counts = {};
  data.issues.forEach(issue => {
    const p = issue.fields.priority?.name || 'Unknown';
    counts[p] = (counts[p] || 0) + 1;
  });

  return ['Critical', 'High', 'Medium', 'Low'].filter(k => counts[k]).map(name => ({ name, value: counts[name] }));
}

export async function fetchDefectsByStatus(year, month, components) {
  const { start, end } = rangeJql(year, month);
  const jql  = `issuetype = Bug${compClause(components)} AND created >= "${start}" AND created <= "${end}" ORDER BY created DESC`;
  const data = await jqlSearch(jql);

  const counts = {};
  data.issues.forEach(issue => {
    const s = issue.fields.status?.name || 'Unknown';
    counts[s] = (counts[s] || 0) + 1;
  });

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

export async function fetchDailyMetrics(year, month, components) {
  const { start, end } = rangeJql(year, month);
  const jql  = `project is not EMPTY${compClause(components)} AND created >= "${start}" AND created <= "${end}" ORDER BY created DESC`;
  const data = await jqlSearch(jql);

  const byDate = {};
  data.issues.forEach(issue => {
    const dateKey = moment.tz(issue.fields.created, EST).format('M/D');
    if (!byDate[dateKey]) byDate[dateKey] = { date: dateKey, t: 0, d: 0, c: 0, h: 0, m: 0, l: 0, closedT: 0 };
    const row   = byDate[dateKey];
    const isBug = issue.fields.issuetype?.name === 'Bug';
    row.t += 1;
    if (isBug) {
      row.d += 1;
      const p = issue.fields.priority?.name;
      if      (p === 'Critical') row.c += 1;
      else if (p === 'High')     row.h += 1;
      else if (p === 'Medium')   row.m += 1;
      else if (p === 'Low')      row.l += 1;
    }
    if (['Done', 'Closed', 'Resolved'].includes(issue.fields.status?.name)) row.closedT += 1;
  });

  return Object.values(byDate)
    .map(row => ({
      ...row,
      c:  row.c || null,
      l:  row.l || null,
      hs: row.t > 0 ? parseFloat(((row.closedT / row.t) * 100).toFixed(2)) : null,
    }))
    .sort((a, b) => {
      const [am, ad] = a.date.split('/').map(Number);
      const [bm, bd] = b.date.split('/').map(Number);
      return bm !== am ? bm - am : bd - ad;
    });
}

export async function fetchHealthScore(year, month, components) {
  const { start, end } = rangeJql(year, month);
  const jql  = `project is not EMPTY${compClause(components)} AND created >= "${start}" AND created <= "${end}"`;
  const data = await jqlSearch(jql);
  if (!data.issues.length) return null;
  const closed = data.issues.filter(i => ['Done', 'Closed', 'Resolved'].includes(i.fields.status?.name)).length;
  return Math.round((closed / data.issues.length) * 100);
}

export async function fetchTodayDefectsByRootCause(components, rcLabels) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `issuetype = Bug${compClause(components)} AND created = "${today}"`;
  const data  = await jqlSearch(jql);

  const result = {};
  rcLabels.forEach(label => { result[label] = { Critical: 0, High: 0, Medium: 0, Low: 0 }; });

  data.issues.forEach(issue => {
    const labels   = issue.fields.labels || [];
    const priority = issue.fields.priority?.name;
    if (!['Critical', 'High', 'Medium', 'Low'].includes(priority)) return;
    rcLabels.forEach(label => {
      if (labels.includes(label)) result[label][priority] += 1;
    });
  });

  return result;
}

export async function fetchTodayRegressionByRootCause(components, rcLabels) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `issuetype = Bug AND labels = "Regression"${compClause(components)} AND created = "${today}"`;
  const data  = await jqlSearch(jql);

  const result = {};
  rcLabels.forEach(label => { result[label] = { Critical: 0, High: 0, Medium: 0, Low: 0 }; });

  data.issues.forEach(issue => {
    const labels   = issue.fields.labels || [];
    const priority = issue.fields.priority?.name;
    if (!['Critical', 'High', 'Medium', 'Low'].includes(priority)) return;
    rcLabels.forEach(label => {
      if (labels.includes(label)) result[label][priority] += 1;
    });
  });

  return result;
}

export async function fetchDefectsByRootCause(year, month, components, rcLabels) {
  const { start, end } = rangeJql(year, month);
  const jql  = `issuetype = Bug${compClause(components)} AND created >= "${start}" AND created <= "${end}"`;
  const data = await jqlSearch(jql);

  const result = {};
  rcLabels.forEach(label => { result[label] = { Critical: 0, High: 0, Medium: 0, Low: 0 }; });

  data.issues.forEach(issue => {
    const labels   = issue.fields.labels || [];
    const priority = issue.fields.priority?.name;
    if (!['Critical', 'High', 'Medium', 'Low'].includes(priority)) return;
    rcLabels.forEach(label => {
      if (labels.includes(label)) result[label][priority] += 1;
    });
  });

  return result;
}

export async function fetchRegressionByRootCause(year, month, components, rcLabels) {
  const { start, end } = rangeJql(year, month);
  const jql  = `issuetype = Bug AND labels = "Regression"${compClause(components)} AND created >= "${start}" AND created <= "${end}"`;
  const data = await jqlSearch(jql);

  const result = {};
  rcLabels.forEach(label => { result[label] = { Critical: 0, High: 0, Medium: 0, Low: 0 }; });

  data.issues.forEach(issue => {
    const labels   = issue.fields.labels || [];
    const priority = issue.fields.priority?.name;
    if (!['Critical', 'High', 'Medium', 'Low'].includes(priority)) return;
    rcLabels.forEach(label => {
      if (labels.includes(label)) result[label][priority] += 1;
    });
  });

  return result;
}

export async function fetchCurrentDayImplByLabel(components) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `created = "${today}"${compClause(components)} ORDER BY created DESC`;
  const data  = await jqlSearch(jql);

  const counts = { UAT: 0, OPUAT: 0, CR_UAT: 0, NOUAT: 0 };
  data.issues.forEach(issue => {
    const labels = issue.fields.labels || [];
    if (labels.includes('UAT'))    counts.UAT    += 1;
    if (labels.includes('OPUAT'))  counts.OPUAT  += 1;
    if (labels.includes('CR_UAT')) counts.CR_UAT += 1;
    if (labels.includes('NOUAT'))  counts.NOUAT  += 1;
  });

  return ['UAT', 'OPUAT', 'CR_UAT', 'NOUAT']
    .filter(k => counts[k] > 0)
    .map(name => ({ name, value: counts[name] }));
}

export async function fetchCurrentDayDefectsByPriority(components) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `issuetype = Bug${compClause(components)} AND created = "${today}"`;
  const data  = await jqlSearch(jql);

  const counts = {};
  data.issues.forEach(issue => {
    const p = issue.fields.priority?.name || 'Unknown';
    counts[p] = (counts[p] || 0) + 1;
  });

  return ['Critical', 'High', 'Medium', 'Low'].filter(k => counts[k]).map(name => ({ name, value: counts[name] }));
}

export async function fetchRegressionDefectsByPriority(components) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `issuetype = Bug AND labels = "Regression"${compClause(components)} AND created = "${today}"`;
  const data  = await jqlSearch(jql);

  const counts = {};
  data.issues.forEach(issue => {
    const p = issue.fields.priority?.name || 'Unknown';
    counts[p] = (counts[p] || 0) + 1;
  });

  return ['Critical', 'High', 'Medium', 'Low'].filter(k => counts[k]).map(name => ({ name, value: counts[name] }));
}

export async function fetchImplTickets(components) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `created = "${today}"${compClause(components)} ORDER BY assignee ASC`;
  const data  = await jqlSearch(jql);

  const byTeam = {};
  data.issues.forEach(issue => {
    const team   = issue.fields.assignee?.displayName || 'Unassigned';
    if (!byTeam[team]) byTeam[team] = { team, UAT: 0, OPUAT: 0, CR_UAT: 0, BIZ_VAL: 0, Total: 0 };
    const labels = issue.fields.labels || [];
    if (labels.includes('UAT'))     byTeam[team].UAT     += 1;
    if (labels.includes('OPUAT'))   byTeam[team].OPUAT   += 1;
    if (labels.includes('CR_UAT'))  byTeam[team].CR_UAT  += 1;
    if (labels.includes('BIZ_VAL')) byTeam[team].BIZ_VAL += 1;
    byTeam[team].Total += 1;
  });

  return Object.values(byTeam);
}
