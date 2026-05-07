import { describe, it, expect } from 'vitest';
import { getDifficulty } from '../assignDailySprints';

describe('getDifficulty — level bands', () => {
  it('maps level 1 to easy', () => expect(getDifficulty(1, 0)).toBe('easy'));
  it('maps level 3 to easy', () => expect(getDifficulty(3, 0)).toBe('easy'));
  it('maps level 4 to medium', () => expect(getDifficulty(4, 0)).toBe('medium'));
  it('maps level 7 to medium', () => expect(getDifficulty(7, 0)).toBe('medium'));
  it('maps level 8 to hard', () => expect(getDifficulty(8, 0)).toBe('hard'));
  it('maps level 20 to hard', () => expect(getDifficulty(20, 0)).toBe('hard'));
});

describe('getDifficulty — stretch day (dayIndex % 5 === 4)', () => {
  it('steps easy → medium on day 4', () => expect(getDifficulty(1, 4)).toBe('medium'));
  it('steps medium → hard on day 4', () => expect(getDifficulty(4, 4)).toBe('hard'));
  it('keeps hard → hard on day 4 (no higher band)', () => expect(getDifficulty(8, 4)).toBe('hard'));

  it('steps easy → medium on day 9', () => expect(getDifficulty(2, 9)).toBe('medium'));
  it('steps medium → hard on day 14', () => expect(getDifficulty(6, 14)).toBe('hard'));
});

describe('getDifficulty — non-stretch days', () => {
  it('day 0 is not stretch', () => expect(getDifficulty(1, 0)).toBe('easy'));
  it('day 3 is not stretch', () => expect(getDifficulty(1, 3)).toBe('easy'));
  it('day 5 is not stretch (5 % 5 === 0, not 4)', () => expect(getDifficulty(1, 5)).toBe('easy'));
  it('day 10 is not stretch', () => expect(getDifficulty(4, 10)).toBe('medium'));
});
