import { describe, it, expect, beforeEach, vi } from 'vitest';
import { set, get, has, invalidate, clear, makeKey } from '../services/cache';

beforeEach(() => {
  clear();
  vi.useRealTimers();
});

describe('makeKey', () => {
  it('joins parts with pipe separator', () => {
    expect(makeKey('2026', '5', 'DIGOPS/FED')).toBe('2026|5|DIGOPS/FED');
  });

  it('works with a single part', () => {
    expect(makeKey('abc')).toBe('abc');
  });
});

describe('set and get', () => {
  it('returns value after set', () => {
    set('key1', { data: 42 });
    expect(get('key1')).toEqual({ data: 42 });
  });

  it('returns undefined for unknown key', () => {
    expect(get('nonexistent')).toBeUndefined();
  });

  it('stores different types of values', () => {
    set('str', 'hello');
    set('num', 99);
    set('arr', [1, 2, 3]);
    expect(get('str')).toBe('hello');
    expect(get('num')).toBe(99);
    expect(get('arr')).toEqual([1, 2, 3]);
  });
});

describe('TTL expiry', () => {
  it('returns undefined for expired entry (get)', () => {
    vi.useFakeTimers();
    set('expiring', 'value', 1000);
    vi.advanceTimersByTime(1001);
    expect(get('expiring')).toBeUndefined();
  });

  it('returns value for non-expired entry', () => {
    vi.useFakeTimers();
    set('fresh', 'value', 5000);
    vi.advanceTimersByTime(4999);
    expect(get('fresh')).toBe('value');
  });
});

describe('has', () => {
  it('returns true for an existing, non-expired key', () => {
    set('present', 'data');
    expect(has('present')).toBe(true);
  });

  it('returns false for a missing key', () => {
    expect(has('missing')).toBe(false);
  });

  it('returns false for an expired key', () => {
    vi.useFakeTimers();
    set('shortlived', 'data', 500);
    vi.advanceTimersByTime(501);
    expect(has('shortlived')).toBe(false);
  });
});

describe('invalidate', () => {
  it('removes a specific key', () => {
    set('toRemove', 'value');
    invalidate('toRemove');
    expect(get('toRemove')).toBeUndefined();
    expect(has('toRemove')).toBe(false);
  });

  it('does not affect other keys', () => {
    set('keep', 'value');
    set('remove', 'value');
    invalidate('remove');
    expect(get('keep')).toBe('value');
  });

  it('does not throw for nonexistent key', () => {
    expect(() => invalidate('ghost')).not.toThrow();
  });
});

describe('clear', () => {
  it('removes all entries', () => {
    set('a', 1);
    set('b', 2);
    set('c', 3);
    clear();
    expect(get('a')).toBeUndefined();
    expect(get('b')).toBeUndefined();
    expect(get('c')).toBeUndefined();
  });
});
