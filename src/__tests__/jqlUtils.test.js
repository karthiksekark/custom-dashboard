import { describe, it, expect } from 'vitest';
import { compClause, rangeJql, todayIso, todayLabel } from '../utils/jqlUtils';

describe('compClause', () => {
  it('returns empty string for empty string input', () => {
    expect(compClause('')).toBe('');
  });

  it('returns empty string for undefined input', () => {
    expect(compClause(undefined)).toBe('');
  });

  it('returns empty string for whitespace-only input', () => {
    expect(compClause('   ')).toBe('');
  });

  it('builds correct clause for single component', () => {
    expect(compClause('DIGOPS/FED')).toBe(' AND component in ("DIGOPS/FED")');
  });

  it('builds correct clause for multiple components', () => {
    expect(compClause('DIGOPS/FED, DIGOPS/Catalog')).toBe(
      ' AND component in ("DIGOPS/FED", "DIGOPS/Catalog")'
    );
  });

  it('trims whitespace around component names', () => {
    expect(compClause('  Alpha  ,  Beta  ')).toBe(' AND component in ("Alpha", "Beta")');
  });

  it('escapes double-quotes in component names', () => {
    expect(compClause('DIGOPS/"Special"')).toBe(' AND component in ("DIGOPS/\\"Special\\"")');
  });

  it('filters out empty parts from trailing commas', () => {
    expect(compClause('DIGOPS/FED,')).toBe(' AND component in ("DIGOPS/FED")');
  });
});

describe('rangeJql', () => {
  it('returns correct start and end for January', () => {
    const { start, end } = rangeJql(2026, 1);
    expect(start).toBe('2026-01-01');
    expect(end).toBe('2026-01-31');
  });

  it('returns correct start and end for February (28 days in non-leap year)', () => {
    const { start, end } = rangeJql(2026, 2);
    expect(start).toBe('2026-02-01');
    expect(end).toBe('2026-02-28');
  });

  it('returns correct start and end for February in a leap year', () => {
    const { start, end } = rangeJql(2024, 2);
    expect(start).toBe('2024-02-01');
    expect(end).toBe('2024-02-29');
  });

  it('returns correct start and end for December', () => {
    const { start, end } = rangeJql(2026, 12);
    expect(start).toBe('2026-12-01');
    expect(end).toBe('2026-12-31');
  });

  it('accepts string year and month', () => {
    const { start, end } = rangeJql('2026', '5');
    expect(start).toBe('2026-05-01');
    expect(end).toBe('2026-05-31');
  });
});

describe('todayIso', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    const result = todayIso();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('todayLabel', () => {
  it('returns a string in M/D/YYYY format', () => {
    const result = todayLabel();
    expect(result).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
  });
});
