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

// "4/28" + "2026" → "2026-04-28"
function rowDateToIso(dateStr, year) {
  const [m, d] = dateStr.split('/');
  return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

// ── Implementation table ──────────────────────────────────────────────────────
// Per-team cell: clicking UAT/OPUAT/CR_UAT/BIZ_VAL/Total for a team on todayIso
export function implTeamFieldLink(team, field, todayIso) {
  const jql = field === 'Total'
    ? `${projectClause()} AND assignee = "${team}" AND created = "${todayIso}"`
    : `${projectClause()} AND labels = "${field}" AND assignee = "${team}" AND created = "${todayIso}"`;
  return buildUrl(jql);
}

// Consolidated-total row: clicking a column total across all teams
export function implConsolidatedFieldLink(field, todayIso) {
  const jql = field === 'Total'
    ? `${projectClause()} AND created = "${todayIso}"`
    : `${projectClause()} AND labels = "${field}" AND created = "${todayIso}"`;
  return buildUrl(jql);
}

// ── Defects-alert table ───────────────────────────────────────────────────────
// Per-status row: clicking a priority cell for a specific status
export function defectStatusPriorityLink(status, priority, todayIso) {
  const prClause = priority ? ` AND priority = "${priority}"` : '';
  const jql = `issuetype = Bug AND status = "${status}"${prClause} AND created <= "${todayIso}"`;
  return buildUrl(jql);
}

// Consolidated-total row: clicking across all open statuses, optionally filtered by priority
export function defectConsolidatedLink(priority, todayIso) {
  const prClause = priority ? ` AND priority = "${priority}"` : '';
  const jql = `issuetype = Bug AND status in (Open, "In Progress", Reopened, "Pending Review")${prClause} AND created <= "${todayIso}"`;
  return buildUrl(jql);
}

// ── Daily metrics table ───────────────────────────────────────────────────────
export function dailyTotalTicketsLink(dateStr, year) {
  const iso = rowDateToIso(dateStr, year);
  return buildUrl(`${projectClause()} AND created = "${iso}"`);
}

export function dailyTotalDefectsLink(dateStr, year) {
  const iso = rowDateToIso(dateStr, year);
  return buildUrl(`issuetype = Bug AND created = "${iso}"`);
}

export function dailyPriorityLink(dateStr, year, priority) {
  const iso = rowDateToIso(dateStr, year);
  return buildUrl(`issuetype = Bug AND priority = "${priority}" AND created = "${iso}"`);
}

// Monthly totals row (tfoot)
export function monthlyTotalTicketsLink(year, month) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  return buildUrl(`${projectClause()} AND created >= "${start}" AND created <= "${end}"`);
}

export function monthlyTotalDefectsLink(year, month) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  return buildUrl(`issuetype = Bug AND created >= "${start}" AND created <= "${end}"`);
}

export function monthlyPriorityLink(year, month, priority) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).format('YYYY-MM-DD');
  const end   = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, EST).endOf('month').format('YYYY-MM-DD');
  return buildUrl(`issuetype = Bug AND priority = "${priority}" AND created >= "${start}" AND created <= "${end}"`);
}

// ── Quarterly cards ───────────────────────────────────────────────────────────
// qStart / qEnd: "YYYY-MM-DD" strings
export function quarterTotalTicketsLink(qStart, qEnd) {
  return buildUrl(`${projectClause()} AND created >= "${qStart}" AND created <= "${qEnd}"`);
}

export function quarterTotalDefectsLink(qStart, qEnd) {
  return buildUrl(`issuetype = Bug AND created >= "${qStart}" AND created <= "${qEnd}"`);
}

export function quarterPriorityLink(qStart, qEnd, priority) {
  return buildUrl(`issuetype = Bug AND priority = "${priority}" AND created >= "${qStart}" AND created <= "${qEnd}"`);
}
