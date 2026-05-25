/**
 * Simple in-memory TTL cache for JIRA API responses.
 * Keyed by period + components. Default TTL: 2 minutes.
 */
export const DEFAULT_TTL_MS = 2 * 60 * 1000;

const store = new Map();

export function makeKey(...parts) {
  return parts.join('|');
}

export function has(key) {
  const entry = store.get(key);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) { store.delete(key); return false; }
  return true;
}

export function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) { store.delete(key); return undefined; }
  return entry.value;
}

export function set(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function invalidate(key) {
  store.delete(key);
}

export function clear() {
  store.clear();
}
