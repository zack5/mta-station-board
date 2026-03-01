import { describe, it, expect } from 'vitest';
import { parseRouteText, isRoutePart } from '../utils/utils';

describe('Route Regex Logic', () => {
  it('identifies bracketed routes', () => {
    const parts = parseRouteText('Take the [A]');
    // Expect: ['Take the ', 'A']
    expect(parts).toContain('A');
    expect(isRoutePart('A')).toBe(true);
  });

  it('identifies standalone routes at start/middle/end', () => {
    const input = 'A or B or C';
    const parts = parseRouteText(input);
    
    expect(parts).toContain('A');
    expect(parts).toContain('B');
    expect(parts).toContain('C');
  });

  it('identifies routes separated by slashes', () => {
    const parts = parseRouteText('N/R/W trains');
    expect(parts).toEqual(['N', 'R', 'W', ' trains']);
  });

  it('ignores characters inside words', () => {
    const parts = parseRouteText('The Apple train');
    // 'A' is inside 'Apple', so it should NOT be split out
    expect(parts).toEqual(['The Apple train']);
    expect(parts).not.toContain('A');
  });

  it('ignores multi-character strings in brackets (if that is intended)', () => {
    const parts = parseRouteText('The [BMT] line');
    // Your regex [A-Z0-9] only matches single characters
    expect(parts).toEqual(['The [BMT] line']);
  });

  it('handles numbers as routes', () => {
    const parts = parseRouteText('Take the 7 to Queens');
    expect(parts).toContain('7');
    expect(isRoutePart('7')).toBe(true);
  });

  it('handles numbers as routes', () => {
    const parts = parseRouteText('[7] runs every 8 minutes');
    expect(parts).toContain('7');
    expect(parts).not.toContain('8');
  });
});