import moment from 'moment-timezone';
import { compClause, rangeJql } from '../utils/jqlUtils';
import { TEAMS } from '../config/teams.config';

const JIRA_BASE   = import.meta.env.VITE_JIRA_BASE_URL || '';
const EST         = 'America/New_York';
const MAX_RESULTS = 1000;

// ── Team / impl-component lookup tables (built once at module load) ────────────
function parseCompStr(str) {
  return (str || '').split(',').map(s => s.trim()).filter(Boolean);
}

// Maps each team component string → team label  e.g. 'DIGOPS/FED' → 'FED'
const TEAM_BY_COMPONENT = Object.fromEntries(
  TEAMS.flatMap(t => parseCompStr(t.defaultComponents).map(c => [c, t.label]))
);

// Maps impl JIRA component → count key  e.g. 'DIGOPS/UAT' → 'UAT'
const IMPL_COMPONENT_MAP = {
  'DIGOPS/UAT':    'UAT',
  'DIGOPS/OPUAT':  'OPUAT',
  'DIGOPS/CR_UAT': 'CR_UAT',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const MAX_RETRIES = 2;

const inFlight = new Map();

async function jiraFetch(path, options = {}) {
  if (options.signal?.aborted) {
    const err = new Error('Aborted'); err.name = 'AbortError'; throw err;
  }
  const dedupKey = path + (options.body || '');
  if (inFlight.has(dedupKey)) return inFlight.get(dedupKey);

  const promise = (async () => {
    let lastErr;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (options.signal?.aborted) {
        const err = new Error('Aborted'); err.name = 'AbortError'; throw err;
      }
      try {
        const res = await fetch(`${JIRA_BASE}${path}`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          ...options,
        });
        if (res.status === 401) {
          const err = new Error('JIRA session expired or not authenticated');
          err.code = 'JIRA_AUTH'; err.status = 401; throw err;
        }
        if (res.status === 403) {
          const err = new Error('JIRA permission denied');
          err.code = 'JIRA_FORBIDDEN'; err.status = 403; throw err;
        }
        if (!res.ok) {
          const err = new Error(`JIRA ${res.status}: ${path}`);
          err.code = 'JIRA_ERROR'; err.status = res.status;
          if (res.status >= 400 && res.status < 500) throw err;
          lastErr = err;
          if (attempt < MAX_RETRIES) { await new Promise(r => setTimeout(r, 2 ** attempt * 1000)); continue; }
          throw err;
        }
        const json = await res.json();
        if (json.errorMessages?.length || Object.keys(json.errors || {}).length) {
          const err = new Error(json.errorMessages?.[0] || 'JIRA returned an error response');
          err.code = 'JIRA_QUERY_ERROR'; throw err;
        }
        return json;
      } catch (err) {
        if (err.name === 'AbortError' || err.code === 'JIRA_AUTH' || err.code === 'JIRA_FORBIDDEN' || err.code === 'JIRA_QUERY_ERROR') throw err;
        lastErr = err;
        if (attempt < MAX_RETRIES) { await new Promise(r => setTimeout(r, 2 ** attempt * 1000)); continue; }
      }
    }
    throw lastErr;
  })().finally(() => inFlight.delete(dedupKey));

  inFlight.set(dedupKey, promise);
  return promise;
}

function jqlSearch(jql, { signal } = {}) {
  return jiraFetch('/rest/api/2/search', {
    method: 'POST',
    body: JSON.stringify({
      jql,
      maxResults: MAX_RESULTS,
      fields: ['priority', 'status', 'created', 'resolutiondate', 'assignee', 'labels', 'issuetype', 'components'],
    }),
    signal,
  });
}

// ── Aggregation helpers ───────────────────────────────────────────────────────
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];

function groupByPriority(issues) {
  const counts = {};
  issues.forEach(issue => {
    const p = issue.fields.priority?.name;
    if (PRIORITIES.includes(p)) counts[p] = (counts[p] || 0) + 1;
  });
  return PRIORITIES.filter(k => counts[k]).map(name => ({ name, value: counts[name] }));
}

function groupByRootCause(issues, rcLabels) {
  const result = {};
  rcLabels.forEach(label => { result[label] = { Critical: 0, High: 0, Medium: 0, Low: 0 }; });
  issues.forEach(issue => {
    const labels   = issue.fields.labels || [];
    const priority = issue.fields.priority?.name;
    if (!PRIORITIES.includes(priority)) return;
    rcLabels.forEach(label => {
      if (labels.includes(label)) result[label][priority] += 1;
    });
  });
  return result;
}

// ── Consolidated defect fetches (priority + root cause in one request) ────────

export async function fetchCurrentDayDefects(components, rcLabels, { signal } = {}) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `issuetype = Bug${compClause(components)} AND created = "${today}"`;
  const data  = await jqlSearch(jql, { signal });
  return { byPriority: groupByPriority(data.issues), byRootCause: groupByRootCause(data.issues, rcLabels) };
}

export async function fetchCurrentDayRegression(components, rcLabels, { signal } = {}) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `issuetype = Bug AND labels = "Regression"${compClause(components)} AND created = "${today}"`;
  const data  = await jqlSearch(jql, { signal });
  return { byPriority: groupByPriority(data.issues), byRootCause: groupByRootCause(data.issues, rcLabels) };
}

export async function fetchMonthlyDefects(year, month, components, rcLabels, { signal } = {}) {
  const { start, end } = rangeJql(year, month);
  const jql  = `issuetype = Bug${compClause(components)} AND created >= "${start}" AND created <= "${end}"`;
  const data = await jqlSearch(jql, { signal });
  if (data.total > data.issues.length) {
    console.warn(`[fetchMonthlyDefects] Results truncated: total=${data.total}, fetched=${data.issues.length}`);
  }
  return { byPriority: groupByPriority(data.issues), byRootCause: groupByRootCause(data.issues, rcLabels) };
}

// ── Public API ────────────────────────────────────────────────────────────────
export async function fetchDefects(year, month, components, { signal } = {}) {
  const { start, end } = rangeJql(year, month);
  const jql  = `issuetype = Bug${compClause(components)} AND created >= "${start}" AND created <= "${end}" ORDER BY created DESC`;
  const data = await jqlSearch(jql, { signal });

  if (data.total > data.issues.length) {
    console.warn(`[fetchDefects] Results truncated: total=${data.total}, fetched=${data.issues.length}`);
  }

  const priority = {}, status = {};
  data.issues.forEach(issue => {
    const p = issue.fields.priority?.name || 'Unknown';
    const s = issue.fields.status?.name   || 'Unknown';
    priority[p] = (priority[p] || 0) + 1;
    status[s]   = (status[s]   || 0) + 1;
  });

  return {
    byPriority: ['Critical', 'High', 'Medium', 'Low'].filter(k => priority[k]).map(name => ({ name, value: priority[name] })),
    byStatus:   Object.entries(status).map(([name, value]) => ({ name, value })),
  };
}

export async function fetchDailyMetrics(year, month, components, { signal } = {}) {
  const { start, end } = rangeJql(year, month);
  const jql  = `project is not EMPTY${compClause(components)} AND created >= "${start}" AND created <= "${end}" ORDER BY created DESC`;
  const data = await jqlSearch(jql, { signal });

  if (data.total > data.issues.length) {
    console.warn(`[fetchDailyMetrics] Results truncated: total=${data.total}, fetched=${data.issues.length}`);
  }

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

export async function fetchHealthScore(year, month, components, { signal } = {}) {
  const { start, end } = rangeJql(year, month);
  const jql  = `project is not EMPTY${compClause(components)} AND created >= "${start}" AND created <= "${end}"`;
  const data = await jqlSearch(jql, { signal });
  if (!data.issues.length) return null;
  const closed = data.issues.filter(i => ['Done', 'Closed', 'Resolved'].includes(i.fields.status?.name)).length;
  return Math.round((closed / data.issues.length) * 100);
}

export async function fetchRegressionByRootCause(year, month, components, rcLabels, { signal } = {}) {
  const { start, end } = rangeJql(year, month);
  const jql  = `issuetype = Bug AND labels = "Regression"${compClause(components)} AND created >= "${start}" AND created <= "${end}"`;
  const data = await jqlSearch(jql, { signal });

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

export async function fetchCurrentDayImplByLabel(components, { signal } = {}) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `created = "${today}"${compClause(components)} ORDER BY created DESC`;
  const data  = await jqlSearch(jql, { signal });

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

export async function fetchCurrentDayDefectsByPriority(components, { signal } = {}) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `issuetype = Bug${compClause(components)} AND created = "${today}"`;
  const data  = await jqlSearch(jql, { signal });

  const counts = {};
  data.issues.forEach(issue => {
    const p = issue.fields.priority?.name || 'Unknown';
    counts[p] = (counts[p] || 0) + 1;
  });

  return ['Critical', 'High', 'Medium', 'Low'].filter(k => counts[k]).map(name => ({ name, value: counts[name] }));
}

export async function fetchRegressionDefectsByPriority(components, { signal } = {}) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const jql   = `issuetype = Bug AND labels = "Regression"${compClause(components)} AND created = "${today}"`;
  const data  = await jqlSearch(jql, { signal });

  const counts = {};
  data.issues.forEach(issue => {
    const p = issue.fields.priority?.name || 'Unknown';
    counts[p] = (counts[p] || 0) + 1;
  });

  return ['Critical', 'High', 'Medium', 'Low'].filter(k => counts[k]).map(name => ({ name, value: counts[name] }));
}

const TAB_QUARTER_ACCENTS = ['#0284c7', '#0369a1', '#0ea5e9', '#38bdf8'];

function tabQuarterPeriod(qNum, year) {
  const periods = ['Jan–Mar', 'Apr–Jun', 'Jul–Sep', 'Oct–Dec'];
  return `${periods[qNum - 1]} ${year}`;
}

export async function fetchTabDailyMetrics(year, month, components, { signal } = {}) {
  const { start, end } = rangeJql(year, month);
  const jql  = `project is not EMPTY${compClause(components)} AND created >= "${start}" AND created <= "${end}" ORDER BY created DESC`;
  const data = await jqlSearch(jql, { signal });

  if (data.total > data.issues.length) {
    console.warn(`[fetchTabDailyMetrics] Results truncated: total=${data.total}, fetched=${data.issues.length}`);
  }

  const byDate = {};
  data.issues.forEach(issue => {
    const dateKey = moment.tz(issue.fields.created, EST).format('M/D');
    if (!byDate[dateKey]) {
      byDate[dateKey] = { date: dateKey, t: 0, d: 0, c: 0, h: 0, m: 0, l: 0, rg: 0, fp: 0, dp: 0 };
    }
    const row    = byDate[dateKey];
    const labels = issue.fields.labels || [];
    const isBug  = issue.fields.issuetype?.name === 'Bug';
    row.t += 1;
    if (isBug) {
      row.d += 1;
      const p = issue.fields.priority?.name;
      if      (p === 'Critical') row.c += 1;
      else if (p === 'High')     row.h += 1;
      else if (p === 'Medium')   row.m += 1;
      else if (p === 'Low')      row.l += 1;
      if (labels.includes('Regression')) row.rg += 1;
    }
    if (labels.includes('Fast-Path'))         row.fp += 1;
    if (labels.includes('Direct-Publishing')) row.dp += 1;
  });

  const rows = Object.values(byDate)
    .sort((a, b) => {
      const [am, ad] = a.date.split('/').map(Number);
      const [bm, bd] = b.date.split('/').map(Number);
      return bm !== am ? bm - am : bd - ad;
    })
    .map(row => ({
      ...row,
      c:  row.c  || null,
      h:  row.h  || null,
      m:  row.m  || null,
      l:  row.l  || null,
      rg: row.rg || null,
      fp: row.fp || null,
      dp: row.dp || null,
      hs: row.t > 0 ? parseFloat(((row.t - row.d) / row.t * 100).toFixed(2)) : null,
    }));

  const sums = rows.reduce(
    (acc, r) => ({
      t:  acc.t  + r.t,
      d:  acc.d  + r.d,
      c:  acc.c  + (r.c  || 0),
      h:  acc.h  + (r.h  || 0),
      m:  acc.m  + (r.m  || 0),
      l:  acc.l  + (r.l  || 0),
      rg: acc.rg + (r.rg || 0),
      fp: acc.fp + (r.fp || 0),
      dp: acc.dp + (r.dp || 0),
    }),
    { t: 0, d: 0, c: 0, h: 0, m: 0, l: 0, rg: 0, fp: 0, dp: 0 }
  );
  const totals = {
    ...sums,
    hs: sums.t > 0 ? parseFloat(((sums.t - sums.d) / sums.t * 100).toFixed(2)) : null,
  };

  return { rows, totals };
}

export async function fetchTabQuarters(year, components, { signal } = {}) {
  const y = Number(year);
  const quarters = [1, 2, 3, 4].map(qNum => {
    const startMonth = (qNum - 1) * 3;
    const start = moment.tz({ year: y, month: startMonth,     day: 1 }, EST).startOf('month').format('YYYY-MM-DD');
    const end   = moment.tz({ year: y, month: startMonth + 2, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
    return {
      q:         `${qNum}Q${year.slice(-2)}`,
      period:    tabQuarterPeriod(qNum, year),
      acc:       TAB_QUARTER_ACCENTS[qNum - 1],
      startDate: start,
      endDate:   end,
    };
  });

  const results = await Promise.allSettled(
    quarters.map(({ startDate, endDate }) =>
      jqlSearch(`project is not EMPTY${compClause(components)} AND created >= "${startDate}" AND created <= "${endDate}"`, { signal })
    )
  );

  return quarters.map(({ q, period, acc, startDate, endDate }, i) => {
    const raw = results[i];
    if (raw.status === 'fulfilled' && raw.value?.total > raw.value?.issues?.length) {
      console.warn(`[fetchTabQuarters] Q${i+1} truncated: total=${raw.value.total}, fetched=${raw.value.issues?.length}`);
    }
    const issues = results[i].status === 'fulfilled' ? (results[i].value?.issues || []) : [];
    if (!issues.length) {
      return { q, period, days: 0, tickets: 0, defects: 0, rg: 0, fp: 0, c: 0, h: 0, m: 0, l: 0, hs: null, acc, startDate, endDate };
    }

    const days = new Set(issues.map(issue => moment.tz(issue.fields.created, EST).format('YYYY-MM-DD'))).size;
    let tickets = 0, defects = 0, rg = 0, fp = 0, c = 0, h = 0, m = 0, l = 0;

    issues.forEach(issue => {
      const labels = issue.fields.labels || [];
      const isBug  = issue.fields.issuetype?.name === 'Bug';
      tickets += 1;
      if (isBug) {
        defects += 1;
        const p = issue.fields.priority?.name;
        if      (p === 'Critical') c += 1;
        else if (p === 'High')     h += 1;
        else if (p === 'Medium')   m += 1;
        else if (p === 'Low')      l += 1;
        if (labels.includes('Regression')) rg += 1;
      }
      if (labels.includes('Fast-Path')) fp += 1;
    });

    const hs = tickets > 0 ? parseFloat(((tickets - defects) / tickets * 100).toFixed(2)) : null;
    return { q, period, days, tickets, defects, rg, fp, c, h, m, l, hs, acc, startDate, endDate };
  });
}

export async function fetchDefectsAlertTable({ signal } = {}) {
  const today    = moment().tz(EST).format('YYYY-MM-DD');
  const tomorrow = moment().tz(EST).add(1, 'day').format('YYYY-MM-DD');

  const rcExclude = [
    'Unable to reproduce(Unknown RCA)',
    'Clarification only',
    'Expired Promo',
    'Invalid Test Case /Test Data Issue',
    'Inventory Issue',
    'Working as designed',
    'GTS Technical requirement/gap',
    'Duplicate',
    'Rejected (PRODDEF Admin use only).',
    'Enhancement- (Missed Requirement/ Requirement gap)',
  ].map(v => `"${v}"`).join(', ');

  const jql = [
    'project = PRODDEF',
    'status not in (Cancelled, "On Hold")',
    '"Release Version" is not EMPTY',
    `created >= "${today}"`,
    `created < "${tomorrow}"`,
    `("Root Cause_3" not in (${rcExclude}) OR "Root Cause_3" is EMPTY)`,
    `("Date Resolved" >= "${today} 08:00" OR "Date Resolved" is EMPTY OR "Resolved" is EMPTY)`,
  ].join(' AND ') + ' ORDER BY due DESC';

  const data = await jqlSearch(jql, { signal });

  const byStatus = {};
  data.issues.forEach(issue => {
    const s = issue.fields.status?.name || 'Unknown';
    const p = issue.fields.priority?.name;
    if (!byStatus[s]) byStatus[s] = { status: s, critical: 0, high: 0, medium: 0, low: 0, total: 0 };
    const row = byStatus[s];
    if      (p === 'Critical') row.critical += 1;
    else if (p === 'High')     row.high     += 1;
    else if (p === 'Medium')   row.medium   += 1;
    else if (p === 'Low')      row.low      += 1;
    row.total += 1;
  });

  return Object.values(byStatus);
}

const IMPL_TICKETS_CONFIG = {
  project:    'DOPMO',
  components: ['DIGOPS/UAT', 'DIGOPS/OPUAT', 'DIGOPS/CR_UAT'],
  bizvalLabels: ['BIZ_VAL', 'bizval'],
};

export async function fetchPrevMonthHealthScore(year, month, components, ctx) {
  const prevMonth = month === '01' ? '12' : String(Number(month) - 1).padStart(2, '0');
  const prevYear  = month === '01' ? String(Number(year) - 1) : year;
  return fetchHealthScore(prevYear, prevMonth, components, ctx);
}

export async function fetchPrevMonthDefectsTotal(year, month, components, ctx) {
  const prevMonth = month === '01' ? '12' : String(Number(month) - 1).padStart(2, '0');
  const prevYear  = month === '01' ? String(Number(year) - 1) : year;
  const data = await fetchDefects(prevYear, prevMonth, components, ctx);
  return data.byPriority.reduce((s, d) => s + (d.value || 0), 0);
}

export async function fetchImplTickets({ signal } = {}) {
  const today = moment().tz(EST).format('YYYY-MM-DD');
  const { project, components: implComponents, bizvalLabels } = IMPL_TICKETS_CONFIG;
  const compInClause   = implComponents.map(c => `"${c}"`).join(', ');
  const bizvalInClause = bizvalLabels.map(l => `"${l}"`).join(', ');
  const jql = `project = ${project} AND status not in (Cancelled, "On Hold", Open) AND due = "${today}" AND (component in (${compInClause}) OR summary ~ "BZ VAL" OR summary ~ "BIZ VAL" OR summary ~ "BUSVAL" OR labels in (${bizvalInClause})) AND (labels not in ("Lower-Env", Lower_Env) AND labels is not EMPTY) AND issuetype not in (Task) ORDER BY created DESC`;
  const data = await jqlSearch(jql, { signal });

  const byTeam = {};
  data.issues.forEach(issue => {
    const compNames = (issue.fields.components || []).map(c => c.name);
    const labels    = issue.fields.labels || [];

    // Identify team from JIRA component field
    const teamComp = compNames.find(c => TEAM_BY_COMPONENT[c]);
    const teamName = teamComp ? TEAM_BY_COMPONENT[teamComp] : 'Other';

    // Identify impl type from JIRA component field
    const implComp = compNames.find(c => IMPL_COMPONENT_MAP[c]);
    const implType = implComp ? IMPL_COMPONENT_MAP[implComp] : null;

    // BIZ_VAL has no component equivalent — detected via label
    const isBizVal = labels.includes('BIZ_VAL') || labels.includes('bizval');

    // Skip tickets with no impl component and no BIZ_VAL label
    if (!implType && !isBizVal) return;

    if (!byTeam[teamName]) byTeam[teamName] = { team: teamName, UAT: 0, OPUAT: 0, CR_UAT: 0, BIZ_VAL: 0, Total: 0 };
    if (implType) byTeam[teamName][implType] += 1;
    if (isBizVal) byTeam[teamName].BIZ_VAL  += 1;
    byTeam[teamName].Total += 1;
  });

  return Object.values(byTeam).sort((a, b) => {
    if (a.team === 'Other') return 1;
    if (b.team === 'Other') return -1;
    return 0;
  });
}
