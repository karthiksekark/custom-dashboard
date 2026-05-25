import { useState, useEffect, useCallback, useRef } from 'react';
import * as cache from '../services/cache';
import { useAppContext } from './useAppContext';

/**
 * Shared base for data hooks. Handles:
 * - AbortController lifecycle (mount load + cleanup)
 * - Silent auto-refresh interval from preferences.refreshInterval
 * - Manual refresh with in-flight abort via refreshControllerRef
 * - lastFetchedAt timestamp
 *
 * @param {object} opts
 * @param {function} opts.load  - async (signal, { silent }) => void. Must set its own loading state.
 * @param {string}   opts.cacheKey - used for cache.invalidate on refresh
 * @param {Array}    opts.deps    - extra useEffect/useCallback deps (year, month, components, etc.)
 */
export function useBaseData({ load, cacheKey, deps = [] }) {
  const { state }         = useAppContext();
  const refreshIntervalMs = state.preferences.refreshInterval != null
    ? state.preferences.refreshInterval * 60 * 1000
    : null;

  const [lastFetchedAt,   setLastFetchedAt]   = useState(null);
  const refreshControllerRef                  = useRef(null);

  // Expose a way for the load function to update lastFetchedAt
  const markFetched = useCallback(() => setLastFetchedAt(new Date()), []);

  // Initial load + auto-refresh interval
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal, { silent: false });

    const interval = refreshIntervalMs
      ? setInterval(() => {
          cache.invalidate(cacheKey);
          load(controller.signal, { silent: true });
        }, refreshIntervalMs)
      : null;

    return () => {
      controller.abort();
      if (interval) clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, cacheKey, refreshIntervalMs, ...deps]);

  // Manual refresh — aborts any prior in-flight refresh
  const refresh = useCallback(() => {
    refreshControllerRef.current?.abort();
    const controller = new AbortController();
    refreshControllerRef.current = controller;
    cache.invalidate(cacheKey);
    load(controller.signal, { silent: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, cacheKey, ...deps]);

  return { lastFetchedAt, markFetched, refresh, refreshIntervalMs };
}
