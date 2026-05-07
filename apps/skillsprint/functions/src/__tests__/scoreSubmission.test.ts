import { describe, it, expect } from 'vitest';
import { scoreFillInBlank, scoreChoice, isTimedOut } from '../scoreSubmission';

// --- fill_in_blank ---

describe('scoreFillInBlank', () => {
  it('returns 100 for exact match', () => {
    expect(scoreFillInBlank('map', 'map', undefined).score).toBe(100);
  });

  it('is case-insensitive', () => {
    expect(scoreFillInBlank('MAP', 'map', undefined).score).toBe(100);
    expect(scoreFillInBlank('Map', 'map', undefined).score).toBe(100);
  });

  it('trims whitespace before comparing', () => {
    expect(scoreFillInBlank('  map  ', 'map', undefined).score).toBe(100);
    expect(scoreFillInBlank('map', '  map  ', undefined).score).toBe(100);
  });

  it('returns 0 for wrong answer', () => {
    expect(scoreFillInBlank('filter', 'map', undefined).score).toBe(0);
  });

  it('handles array answer (uses first element)', () => {
    expect(scoreFillInBlank(['map'], 'map', undefined).score).toBe(100);
    expect(scoreFillInBlank(['filter'], 'map', undefined).score).toBe(0);
  });

  it('feedback is always a tuple of exactly 3 strings', () => {
    const correct = scoreFillInBlank('map', 'map', undefined);
    expect(correct.feedback).toHaveLength(3);
    correct.feedback.forEach((f) => expect(typeof f).toBe('string'));

    const wrong = scoreFillInBlank('filter', 'map', undefined);
    expect(wrong.feedback).toHaveLength(3);
    wrong.feedback.forEach((f) => expect(typeof f).toBe('string'));
  });

  it('includes hint in feedback when provided', () => {
    const { feedback } = scoreFillInBlank('filter', 'map', 'Use Array.prototype.map');
    expect(feedback.join(' ')).toContain('Array.prototype.map');
  });
});

// --- multiple_choice / code_reading ---

describe('scoreChoice', () => {
  it('returns 100 for correct index as string', () => {
    expect(scoreChoice('2', 2, undefined).score).toBe(100);
  });

  it('returns 100 for correct index 0', () => {
    expect(scoreChoice('0', 0, undefined).score).toBe(100);
  });

  it('returns 0 for wrong index', () => {
    expect(scoreChoice('1', 2, undefined).score).toBe(0);
    expect(scoreChoice('0', 3, undefined).score).toBe(0);
  });

  it('handles array answer (uses first element)', () => {
    expect(scoreChoice(['2'], 2, undefined).score).toBe(100);
    expect(scoreChoice(['1'], 2, undefined).score).toBe(0);
  });

  it('feedback is always a tuple of exactly 3 strings', () => {
    const correct = scoreChoice('1', 1, 'Because X is true');
    expect(correct.feedback).toHaveLength(3);
    correct.feedback.forEach((f) => expect(typeof f).toBe('string'));

    const wrong = scoreChoice('0', 1, 'Because X is true');
    expect(wrong.feedback).toHaveLength(3);
    wrong.feedback.forEach((f) => expect(typeof f).toBe('string'));
  });

  it('includes explanation in feedback when provided', () => {
    const { feedback } = scoreChoice('1', 1, 'Explanation here');
    expect(feedback.join(' ')).toContain('Explanation here');
  });
});

// --- timer enforcement ---

describe('isTimedOut', () => {
  const now = Math.floor(Date.now() / 1000);

  it('returns false when elapsed is well within limit', () => {
    const startedAt = new Date((now - 300) * 1000).toISOString(); // 5 min ago
    expect(isTimedOut(startedAt, now)).toBe(false);
  });

  it('returns false at exactly 630s elapsed', () => {
    const startedAt = new Date((now - 630) * 1000).toISOString();
    expect(isTimedOut(startedAt, now)).toBe(false);
  });

  it('returns true at 631s elapsed', () => {
    const startedAt = new Date((now - 631) * 1000).toISOString();
    expect(isTimedOut(startedAt, now)).toBe(true);
  });

  it('returns true when significantly over limit', () => {
    const startedAt = new Date((now - 1200) * 1000).toISOString(); // 20 min ago
    expect(isTimedOut(startedAt, now)).toBe(true);
  });
});
