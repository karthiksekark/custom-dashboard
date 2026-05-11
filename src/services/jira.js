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
 * Navigates the current tab to JIRA's login page and asks JIRA to redirect
 * back to the extension page after a successful login (Option B).
 */
export function redirectToJiraLogin() {
  const returnUrl = globalThis.chrome?.runtime?.getURL?.('index.html') ?? window.location.href;
  window.location.href = `${JIRA_BASE}/login.jsp?os_destination=${encodeURIComponent(returnUrl)}`;
}
