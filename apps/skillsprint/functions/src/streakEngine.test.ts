import { describe, it, expect } from 'vitest';
import {
  computeStreakUpdate,
  computeXP,
  computeLevel,
  daysBetween,
  LEVEL_THRESHOLDS,
} from './streakEngine';

// ---------------------------------------------------------------------------
// daysBetween
// ---------------------------------------------------------------------------

describe('daysBetween', () => {
  it('consecutive days returns 1', () => {
    expect(daysBetween('2025-01-01', '2025-01-02')).toBe(1);
  });

  it('same day returns 0', () => {
    expect(daysBetween('2025-03-15', '2025-03-15')).toBe(0);
  });

  it('2-day gap returns 2', () => {
    expect(daysBetween('2025-01-01', '2025-01-03')).toBe(2);
  });

  it('handles month boundary (Jan 31 → Feb 1)', () => {
    expect(daysBetween('2025-01-31', '2025-02-01')).toBe(1);
  });

  it('handles year boundary (Dec 31 → Jan 1)', () => {
    expect(daysBetween('2024-12-31', '2025-01-01')).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// computeStreakUpdate
// ---------------------------------------------------------------------------

describe('computeStreakUpdate', () => {
  const base = () => ({
    currentStreak: 5,
    longestStreak: 10,
    weeklySkipsRemaining: 1,
    lastCompletedDate: '2025-01-10',
  });

  it('consecutive day increments streak', () => {
    const result = computeStreakUpdate(base(), '2025-01-11');
    expect(result.currentStreak).toBe(6);
    expect(result.lastCompletedDate).toBe('2025-01-11');
    expect(result.wasNoOp).toBe(false);
  });

  it('same day is a no-op — streak and date unchanged', () => {
    const result = computeStreakUpdate(base(), '2025-01-10');
    expect(result.wasNoOp).toBe(true);
    expect(result.currentStreak).toBe(5);
    expect(result.lastCompletedDate).toBe('2025-01-10');
  });

  it('2-day gap with skip available: skip consumed, streak maintained', () => {
    const state = { ...base(), weeklySkipsRemaining: 1 };
    const result = computeStreakUpdate(state, '2025-01-12');
    expect(result.currentStreak).toBe(6);
    expect(result.weeklySkipsRemaining).toBe(0);
    expect(result.wasNoOp).toBe(false);
  });

  it('2-day gap with no skip: streak resets to 1', () => {
    const state = { ...base(), weeklySkipsRemaining: 0 };
    const result = computeStreakUpdate(state, '2025-01-12');
    expect(result.currentStreak).toBe(1);
    expect(result.weeklySkipsRemaining).toBe(0);
  });

  it('updates longestStreak when new streak exceeds previous best', () => {
    const state = { ...base(), currentStreak: 10, longestStreak: 10 };
    const result = computeStreakUpdate(state, '2025-01-11');
    expect(result.currentStreak).toBe(11);
    expect(result.longestStreak).toBe(11);
  });

  it('does not reduce longestStreak on streak reset', () => {
    const state = { ...base(), longestStreak: 20, weeklySkipsRemaining: 0 };
    const result = computeStreakUpdate(state, '2025-01-12');
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(20);
  });

  it('first ever submission (empty lastCompletedDate) starts streak at 1', () => {
    const state = {
      currentStreak: 0,
      longestStreak: 0,
      weeklySkipsRemaining: 1,
      lastCompletedDate: '',
    };
    const result = computeStreakUpdate(state, '2025-05-01');
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
    expect(result.wasNoOp).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// computeXP
// ---------------------------------------------------------------------------

describe('computeXP', () => {
  const START = '2025-01-01T12:00:00.000Z';
  const UNDER_5_MIN = '2025-01-01T12:04:00.000Z'; // 4 min elapsed
  const OVER_5_MIN = '2025-01-01T12:06:00.000Z'; // 6 min elapsed

  it('easy base XP = 10', () => {
    expect(computeXP('easy', 3, null, START).xpEarned).toBe(10);
  });

  it('medium base XP = 20', () => {
    expect(computeXP('medium', 3, null, START).xpEarned).toBe(20);
  });

  it('hard base XP = 35', () => {
    expect(computeXP('hard', 3, null, START).xpEarned).toBe(35);
  });

  it('streak bonus fires at 7-day multiple', () => {
    const { streakBonus, xpEarned } = computeXP('easy', 7, null, START);
    expect(streakBonus).toBe(true);
    expect(xpEarned).toBe(15); // 10 + 5
  });

  it('streak bonus fires at 14-day multiple', () => {
    expect(computeXP('easy', 14, null, START).streakBonus).toBe(true);
  });

  it('no streak bonus for non-multiples of 7', () => {
    expect(computeXP('easy', 1, null, START).streakBonus).toBe(false);
    expect(computeXP('easy', 6, null, START).streakBonus).toBe(false);
    expect(computeXP('easy', 8, null, START).streakBonus).toBe(false);
  });

  it('speed bonus awarded under 5 minutes', () => {
    const { speedBonus, xpEarned } = computeXP('easy', 3, START, UNDER_5_MIN);
    expect(speedBonus).toBe(true);
    expect(xpEarned).toBe(15); // 10 + 5
  });

  it('no speed bonus when elapsed >= 5 minutes', () => {
    expect(computeXP('easy', 3, START, OVER_5_MIN).speedBonus).toBe(false);
  });

  it('no speed bonus when startedAt is null', () => {
    expect(computeXP('easy', 3, null, START).speedBonus).toBe(false);
  });

  it('streak and speed bonuses stack', () => {
    const { xpEarned } = computeXP('easy', 7, START, UNDER_5_MIN);
    expect(xpEarned).toBe(20); // 10 + 5 + 5
  });

  it('unknown difficulty falls back to easy base (10 XP)', () => {
    expect(computeXP('legendary', 1, null, START).xpEarned).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// computeLevel
// ---------------------------------------------------------------------------

describe('computeLevel', () => {
  it('level 0 at 0 XP', () => {
    expect(computeLevel(0)).toBe(0);
  });

  it('still level 0 just below first threshold (99 XP)', () => {
    expect(computeLevel(99)).toBe(0);
  });

  it('level 1 at exactly 100 XP', () => {
    expect(computeLevel(100)).toBe(1);
    expect(computeLevel(LEVEL_THRESHOLDS[1])).toBe(1);
  });

  it('level 1 just below level 2 (249 XP)', () => {
    expect(computeLevel(249)).toBe(1);
  });

  it('level 2 at exactly 250 XP', () => {
    expect(computeLevel(250)).toBe(2);
    expect(computeLevel(LEVEL_THRESHOLDS[2])).toBe(2);
  });

  it('level 3 at 500 XP', () => {
    expect(computeLevel(500)).toBe(3);
  });

  it('level 7 at 4000 XP (max level)', () => {
    expect(computeLevel(4000)).toBe(7);
  });

  it('stays at max level above 4000 XP', () => {
    expect(computeLevel(9999)).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// Timezone edge case
// ---------------------------------------------------------------------------

describe('timezone edge case', () => {
  it('submission at 23:59 UTC followed by one at 00:01 next day counts as consecutive', () => {
    // lastCompletedDate was set during a 23:59 UTC submission on Mar 14
    const state = {
      currentStreak: 3,
      longestStreak: 5,
      weeklySkipsRemaining: 1,
      lastCompletedDate: '2025-03-14',
    };
    // Next submission arrives just after UTC midnight on Mar 15
    const result = computeStreakUpdate(state, '2025-03-15');
    expect(result.currentStreak).toBe(4);
    expect(result.wasNoOp).toBe(false);
  });

  it('two submissions both arriving on same UTC date are idempotent', () => {
    const state = {
      currentStreak: 3,
      longestStreak: 5,
      weeklySkipsRemaining: 1,
      lastCompletedDate: '2025-03-15',
    };
    const result = computeStreakUpdate(state, '2025-03-15');
    expect(result.wasNoOp).toBe(true);
    expect(result.currentStreak).toBe(3);
  });
});
