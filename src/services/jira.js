const JIRA_BASE = import.meta.env.VITE_JIRA_BASE_URL || '';

/**
 * Checks whether the current JIRA session is valid.
 * Returns:
 *   'ok'        — JSESSIONID present and /rest/api/2/myself returns 200
 *   'redirect'  — cookie present but session expired (401/403)
 *   'no-cookie' — JSESSIONID not found in cookies
 *   'bypassed'  — no JIRA URL configured (dev/demo mode)
 */
export async function checkSession() {
  // Dev / non-extension environments — bypass auth
  if (!JIRA_BASE || !globalThis.chrome?.cookies) return 'bypassed';

  try {
    const cookie = await chrome.cookies.get({ url: JIRA_BASE, name: 'JSESSIONID' });
    if (!cookie) return 'no-cookie';

    const res = await fetch(`${JIRA_BASE}/rest/api/2/myself`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    return res.ok ? 'ok' : 'redirect';
  } catch {
    return 'no-cookie';
  }
}

/**
 * Opens JIRA's login page in a new tab.
 * We cannot use os_destination to redirect back to a chrome-extension:// URL —
 * JIRA Server only accepts same-origin relative paths and prepends its own
 * domain to any absolute URL, breaking the return link. Opening in a new tab
 * keeps the extension page alive so the user can return to it after login.
 */
export function redirectToJiraLogin() {
  window.open(`${JIRA_BASE}/login.jsp`, '_blank', 'noopener');
}
