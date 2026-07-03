import { describe, it, expect } from 'vitest';
import { formatINR } from './formatters';

describe('formatINR', () => {
  it('formats zero correctly', () => {
    expect(formatINR(0)).toBe('₹0.00');
  });

  it('formats positive numbers correctly', () => {
    expect(formatINR(10.5)).toBe('₹10.50');
  });

  it('formats negative numbers correctly', () => {
    expect(formatINR(-1500.75)).toBe('-₹1,500.75');
  });

  it('formats large numbers according to the Indian numbering system', () => {
    expect(formatINR(1000000)).toBe('₹10,00,000.00');
  });

  it('rounds numbers with more than 2 decimal places', () => {
    expect(formatINR(10.555)).toBe('₹10.56');
    expect(formatINR(10.554)).toBe('₹10.55');
  });
});
