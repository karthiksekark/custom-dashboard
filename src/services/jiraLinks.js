import moment from 'moment-timezone';
import { compClause, rangeJql, RC_EXCLUDE_JQL } from '../utils/jqlUtils';

const JIRA_BASE = import.meta.env.VITE_JIRA_BASE_URL   || '';
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

// ── Implementation table ──────────────────────────────────────────────────────
const IMPL_TYPE_CLAUSE = {
  UAT:    'component in ("DIGOPS/UAT")',
  OPUAT:  'component in ("DIGOPS/OPUAT")',
  CR_UAT: 'component in ("DIGOPS/CR_UAT")',
  BIZ_VAL: '(summary ~ "BZ VAL" OR summary ~ "BIZ VAL" OR summary ~ "BUSVAL" OR labels in ("BIZ_VAL", "bizval"))',
  Total:  '(component in ("DIGOPS/UAT","DIGOPS/OPUAT","DIGOPS/CR_UAT") OR summary ~ "BZ VAL" OR summary ~ "BIZ VAL" OR summary ~ "BUSVAL" OR labels in ("BIZ_VAL", "bizval"))',
};

const IMPL_BASE_JQL = 'project = DOPMO AND status not in (Cancelled, "On Hold", Open) AND (labels not in ("Lower-Env", Lower_Env) AND labels is not EMPTY) AND issuetype not in (Task)';

export function implTeamFieldLink(teamComps, field, todayIso) {
  const typeClause = IMPL_TYPE_CLAUSE[field];
  if (!typeClause) return null;
  const comp = compClause(teamComps);
  return buildUrl(`${IMPL_BASE_JQL}${comp} AND due = "${todayIso}" AND ${typeClause}`);
}

export function implConsolidatedFieldLink(field, todayIso) {
  const typeClause = IMPL_TYPE_CLAUSE[field];
  if (!typeClause) return null;
  return buildUrl(`${IMPL_BASE_JQL} AND due = "${todayIso}" AND ${typeClause}`);
}

// ── Defects-alert table ───────────────────────────────────────────────────────
function defectAlertBaseJql(todayIso) {
  const tomorrow = moment(todayIso).add(1, 'day').format('YYYY-MM-DD');
  return [
    'project = PRODDEF',
    'status not in (Cancelled, "On Hold")',
    '"Release Version" is not EMPTY',
    `created >= "${todayIso}"`,
    `created < "${tomorrow}"`,
    `("Root Cause_3" not in (${RC_EXCLUDE_JQL}) OR "Root Cause_3" is EMPTY)`,
    `("Date Resolved" >= "${todayIso} 08:00" OR "Date Resolved" is EMPTY OR "Resolved" is EMPTY)`,
  ].join(' AND ');
}

export function defectStatusPriorityLink(status, priority, todayIso) {
  const prClause = priority ? ` AND priority = "${priority}"` : '';
  return buildUrl(`${defectAlertBaseJql(todayIso)} AND status = "${status}"${prClause}`);
}

export function defectConsolidatedLink(priority, todayIso) {
  const prClause = priority ? ` AND priority = "${priority}"` : '';
  return buildUrl(`${defectAlertBaseJql(todayIso)}${prClause}`);
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
  const { start, end } = rangeJql(year, month);
  const comp = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND created >= "${start}" AND created <= "${end}"`);
}

export function monthlyTotalDefectsLink(year, month, components) {
  const { start, end } = rangeJql(year, month);
  const comp = compClause(components);
  return buildUrl(`issuetype = Bug${comp} AND created >= "${start}" AND created <= "${end}"`);
}

export function monthlyPriorityLink(year, month, priority, components) {
  const { start, end } = rangeJql(year, month);
  const comp = compClause(components);
  return buildUrl(`issuetype = Bug${comp} AND priority = "${priority}" AND created >= "${start}" AND created <= "${end}"`);
}

// ── Release Mgmt daily metrics table ─────────────────────────────────────────
// DOPMO base: component/label/status/issuetype conditions matching fetchDailyMetrics
const RM_DOPMO_BASE = 'project = DOPMO AND (component in ("DIGOPS/UAT","DIGOPS/OPUAT","DIGOPS/CR_UAT") OR summary ~ "BZ VAL" OR summary ~ "BIZ VAL" OR summary ~ "BUSVAL" OR labels in ("bizval")) AND (labels not in ("Lower-Env", Lower_Env) AND labels is not EMPTY) AND status not in (Cancelled, "On Hold", Open) AND issuetype not in (Task)';
// PRODDEF base: status/Release Version conditions matching fetchDailyMetrics
const RM_PRODDEF_BASE = 'project = PRODDEF AND status not in (Cancelled, "On Hold") AND "Release Version" is not EMPTY AND priority in ("Critical", "High", "Medium", "Low")';

// Convert M/D dateStr + 4-digit year → "Content M/D/YY" (Release Version field value)
function toReleaseVersion(dateStr, year) {
  return `Content ${dateStr}/${year.slice(-2)}`;
}

export function rmDailyTicketsLink(dateStr, year) {
  return buildUrl(`${RM_DOPMO_BASE} AND due = "${rowDateToIso(dateStr, year)}"`);
}

export function rmDailyDefectsLink(dateStr, year) {
  return buildUrl(`${RM_PRODDEF_BASE} AND "Release Version" = "${toReleaseVersion(dateStr, year)}"`);
}

export function rmDailyPriorityLink(dateStr, year, priority) {
  return buildUrl(`${RM_PRODDEF_BASE} AND "Release Version" = "${toReleaseVersion(dateStr, year)}" AND priority = "${priority}"`);
}

export function rmMonthlyTicketsLink(year, month) {
  const { start, end } = rangeJql(year, month);
  return buildUrl(`${RM_DOPMO_BASE} AND due >= "${start}" AND due <= "${end}"`);
}

export function rmMonthlyDefectsLink(year, month) {
  const { start, end } = rangeJql(year, month);
  return buildUrl(`${RM_PRODDEF_BASE} AND created >= "${start}" AND created <= "${end}"`);
}

export function rmMonthlyPriorityLink(year, month, priority) {
  const { start, end } = rangeJql(year, month);
  return buildUrl(`${RM_PRODDEF_BASE} AND created >= "${start}" AND created <= "${end}" AND priority = "${priority}"`);
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
  const { start, end } = rangeJql(year, month);
  const comp = compClause(components);
  return buildUrl(`issuetype = Bug AND labels = "Regression"${comp} AND created >= "${start}" AND created <= "${end}"`);
}

export function tabMonthlyFastPathLink(year, month, components) {
  const { start, end } = rangeJql(year, month);
  const comp = compClause(components);
  return buildUrl(`${projectClause()}${comp} AND labels = "Fast-Path" AND created >= "${start}" AND created <= "${end}"`);
}

export function tabMonthlyDirectPubLink(year, month, components) {
  const { start, end } = rangeJql(year, month);
  const comp = compClause(components);
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
