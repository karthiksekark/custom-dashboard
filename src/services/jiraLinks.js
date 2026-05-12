import moment from 'moment-timezone';

const EST       = 'America/New_York';
const JIRA_BASE = import.meta.env.VITE_JIRA_BASE_URL  || '';
const PROJECT   = import.meta.env.VITE_JIRA_PROJECT_KEY || null;

// ── Internal helpers ──────────────────────────────────────────────────────────
function projectClause() {
  return PROJECT ? `project = "${PROJECT}"` : 'project is not EMPTY';
}

function buildUrl(jql) {
  if (!JIRA_BASE) return null;
  return `${JIRA_BASE}/issues/?jql=${encodeURIComponent(jql)}`;
}

function rowDateToIso(dateStr, year) {
  const [m, d] = dateStr.split('/');
  return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function compClause(components) {
  if (!components?.trim()) return '';
  const names = components.split(',').map(c => c.trim()).filter(Boolean);
  return names.length ? ` AND component in (${names.map(n => `"${n}"`).join(', ')})` : '';
}

// ── Implementation table ──────────────────────────────────────────────────────
export function implTeamFieldLink(team, field, todayIso, components) {
  const comp = compClause(components);
  const jql  = field === 'Total'
    ? `${projectClause()}${comp} AND assignee = "${team}" AND created = "${todayIso}"`
    : `${projectClause()}${comp} AND labels = "${field}" AND assignee = "${team}" AND created = "${todayIso}"`;
  return buildUrl(jql);
}

export function implConsolidatedFieldLink(field, todayIso, components) {
  const comp = compClause(components);
  const jql  = field === 'Total'
    ? `${projectClause()}${comp} AND created = "${todayIso}"`
    : `${projectClause()}${comp} AND labels = "${field}" AND created = "${todayIso}"`;
  return buildUrl(jql);
}

// ── Defects-alert table ───────────────────────────────────────────────────────
export function defectStatusPriorityLink(status, priority, todayIso, components) {
  const comp     = compClause(components);
  const prClause = priority ? ` AND priority = "${priority}"` : '';
  return buildUrl(`issuetype = Bug${comp} AND status = "${status}"${prClause} AND created <= "${todayIso}"`);
}

export function defectConsolidatedLink(priority, todayIso, components) {
  const comp     = compClause(components);
  const prClause = priority ? ` AND priority = "${priority}"` : '';
  return buildUrl(`issuetype = Bug${comp} AND status in (Open, "In Progress", Reopened, "Pending Review")${prClause} AND created <= "${todayIso}"`);
}

// ── Daily metrics table ───────────────────────────────────────────────────────
export function dailyTotalTicketsLink(dateStr, year, components) {
  const iso  = rowDateToIso(dateStr, year);
  const comp = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND created = "${iso}"`);
}

export function dailyTotalDefectsLink(dateStr, year, components) {
  const iso  = rowDateToIso(dateStr, year);
  const comp = compClause(components);
  return buildUrl(`issuetype = Bug${comp} AND created = "${iso}"`);
}

export function dailyPriorityLink(dateStr, year, priority, components) {
  const iso  = rowDateToIso(dateStr, year);
  const comp = compClause(components);
  return buildUrl(`issuetype = Bug${comp} AND priority = "${priority}" AND created = "${iso}"`);
}

// Monthly totals (tfoot)
export function monthlyTotalTicketsLink(year, month, components) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  const comp  = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND created >= "${start}" AND created <= "${end}"`);
}

export function monthlyTotalDefectsLink(year, month, components) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  const comp  = compClause(components);
  return buildUrl(`issuetype = Bug${comp} AND created >= "${start}" AND created <= "${end}"`);
}

export function monthlyPriorityLink(year, month, priority, components) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  const comp  = compClause(components);
  return buildUrl(`issuetype = Bug${comp} AND priority = "${priority}" AND created >= "${start}" AND created <= "${end}"`);
}

// ── Quarterly cards ───────────────────────────────────────────────────────────
export function quarterTotalTicketsLink(qStart, qEnd, components) {
  const comp = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND created >= "${qStart}" AND created <= "${qEnd}"`);
}

export function quarterTotalDefectsLink(qStart, qEnd, components) {
  const comp = compClause(components);
  return buildUrl(`issuetype = Bug${comp} AND created >= "${qStart}" AND created <= "${qEnd}"`);
}

export function quarterPriorityLink(qStart, qEnd, priority, components) {
  const comp = compClause(components);
  return buildUrl(`issuetype = Bug${comp} AND priority = "${priority}" AND created >= "${qStart}" AND created <= "${qEnd}"`);
}

// ── Tab-specific daily links (regression, fast-path, direct-publishing) ───────
export function tabDailyRegressionLink(dateStr, year, components) {
  const iso  = rowDateToIso(dateStr, year);
  const comp = compClause(components);
  return buildUrl(`issuetype = Bug AND labels = "Regression"${comp} AND created = "${iso}"`);
}

export function tabDailyFastPathLink(dateStr, year, components) {
  const iso  = rowDateToIso(dateStr, year);
  const comp = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND labels = "Fast-Path" AND created = "${iso}"`);
}

export function tabDailyDirectPubLink(dateStr, year, components) {
  const iso  = rowDateToIso(dateStr, year);
  const comp = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND labels = "Direct-Publishing" AND created = "${iso}"`);
}

export function tabMonthlyRegressionLink(year, month, components) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  const comp  = compClause(components);
  return buildUrl(`issuetype = Bug AND labels = "Regression"${comp} AND created >= "${start}" AND created <= "${end}"`);
}

export function tabMonthlyFastPathLink(year, month, components) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  const comp  = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND labels = "Fast-Path" AND created >= "${start}" AND created <= "${end}"`);
}

export function tabMonthlyDirectPubLink(year, month, components) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  const comp  = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND labels = "Direct-Publishing" AND created >= "${start}" AND created <= "${end}"`);
}

// ── Tab quarterly links (regression + fast-path) ──────────────────────────────
export function tabQuarterRegressionLink(qStart, qEnd, components) {
  const comp = compClause(components);
  return buildUrl(`issuetype = Bug AND labels = "Regression"${comp} AND created >= "${qStart}" AND created <= "${qEnd}"`);
}

export function tabQuarterFastPathLink(qStart, qEnd, components) {
  const comp = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND labels = "Fast-Path" AND created >= "${qStart}" AND created <= "${qEnd}"`);
}
