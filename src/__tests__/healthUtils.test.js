import { describe, it, expect } from 'vitest';
import { healthColor, statusDot } from '../services/healthUtils';

describe('healthColor', () => {
  it('returns muted grey for null score', () => {
    expect(healthColor(null)).toBe('#94a3b8');
  });

  it('returns muted grey for undefined score', () => {
    expect(healthColor(undefined)).toBe('#94a3b8');
  });

  it('returns red for score below 70', () => {
    expect(healthColor(69)).toBe('#dc2626');
    expect(healthColor(0)).toBe('#dc2626');
    expect(healthColor(50)).toBe('#dc2626');
  });

  it('returns yellow for score of exactly 70', () => {
    expect(healthColor(70)).toBe('#ca8a04');
  });

  it('returns yellow for score between 70 and 84', () => {
    expect(healthColor(75)).toBe('#ca8a04');
    expect(healthColor(84)).toBe('#ca8a04');
  });

  it('returns lime green for score of exactly 85', () => {
    expect(healthColor(85)).toBe('#65a30d');
  });

  it('returns lime green for score between 85 and 94', () => {
    expect(healthColor(90)).toBe('#65a30d');
    expect(healthColor(94)).toBe('#65a30d');
  });

  it('returns green for score of exactly 95', () => {
    expect(healthColor(95)).toBe('#16a34a');
  });

  it('returns green for score of 100', () => {
    expect(healthColor(100)).toBe('#16a34a');
  });
});

describe('statusDot', () => {
  it('returns red for Open', () => {
    expect(statusDot('Open')).toBe('#dc2626');
  });

  it('returns blue for In Progress', () => {
    expect(statusDot('In Progress')).toBe('#2563eb');
  });

  it('returns orange for Reopened', () => {
    expect(statusDot('Reopened')).toBe('#ea580c');
  });

  it('returns yellow for Pending Review', () => {
    expect(statusDot('Pending Review')).toBe('#ca8a04');
  });

  it('returns muted grey for unknown status', () => {
    expect(statusDot('Unknown')).toBe('#94a3b8');
    expect(statusDot('')).toBe('#94a3b8');
    expect(statusDot('Closed')).toBe('#94a3b8');
  });
});
