import moment from 'moment-timezone';

// Single source of truth for timezone — all date calculations use this
export const APP_TIMEZONE = 'America/New_York';

export const CLOSED_STATUSES = ['Done', 'Closed', 'Resolved'];
export const PRIORITY_LIST   = ['Critical', 'High', 'Medium', 'Low'];

// Root cause values excluded from health score and defect alert table
export const RC_EXCLUDE_VALUES = [
  'Unable to reproduce(Unknown RCA)',
  'Clarification only',
  'Expired Promo',
  'Invalid Test Case /Test Data Issue',
  'Inventory Issue',
  'Working as designed',
  'GTS Technical requirement/gap',
  'Duplicate',
  'Rejected (PRODDEF Admin use only) ',
  'Enhancement- (Missed Requirement/ Requirement gap)',
];
export const RC_EXCLUDE_JQL = RC_EXCLUDE_VALUES.map(v => `"${v}"`).join(', ');

/**
 * Builds AND component in ("A","B") clause from a comma-separated string.
 * Returns empty string if components is blank/undefined.
 * Escapes double-quotes in component names to prevent JQL injection.
 */
export function compClause(components) {
  if (!components?.trim()) return '';
  const names = components.split(',').map(c => c.trim()).filter(Boolean);
  if (!names.length) return '';
  const safe = names.map(n => `"${n.replace(/"/g, '\\"')}"`);
  return ` AND component in (${safe.join(', ')})`;
}

/**
 * Returns { start, end } ISO date strings for the given year/month in APP_TIMEZONE.
 */
export function rangeJql(year, month) {
  const start = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, APP_TIMEZONE)
    .format('YYYY-MM-DD');
  const end = moment.tz({ year: Number(year), month: Number(month) - 1, day: 1 }, APP_TIMEZONE)
    .endOf('month').format('YYYY-MM-DD');
  return { start, end };
}

/**
 * Returns today's ISO date string in APP_TIMEZONE.
 */
export function todayIso() {
  return moment().tz(APP_TIMEZONE).format('YYYY-MM-DD');
}

/**
 * Returns today's display label in APP_TIMEZONE.
 */
export function todayLabel() {
  return moment().tz(APP_TIMEZONE).format('M/D/YYYY');
}
