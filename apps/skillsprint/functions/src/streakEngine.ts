// Level thresholds: index = level number, value = XP required to reach that level.
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000];

export const XP_BY_DIFFICULTY: Record<string, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
};

export function toUTCDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function parseDateParts(d: string): [number, number, number] {
  const parts = d.split('-');
  return [parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)];
}

// Number of full UTC calendar days from `from` to `to` (positive = forward in time).
export function daysBetween(from: string, to: string): number {
  const [fy, fm, fd] = parseDateParts(from);
  const [ty, tm, td] = parseDateParts(to);
  const msFrom = Date.UTC(fy, fm, fd);
  const msTo = Date.UTC(ty, tm, td);
  return Math.round((msTo - msFrom) / (24 * 60 * 60 * 1000));
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  weeklySkipsRemaining: number;
  lastCompletedDate: string;
}

export interface StreakUpdateResult extends StreakState {
  wasNoOp: boolean;
}

export function computeStreakUpdate(state: StreakState, today: string): StreakUpdateResult {
  const { currentStreak, longestStreak, weeklySkipsRemaining, lastCompletedDate } = state;

  if (lastCompletedDate === today) {
    return { currentStreak, longestStreak, weeklySkipsRemaining, lastCompletedDate, wasNoOp: true };
  }

  // Gap of 0 means no prior completion — treat as first submission (gap=1 path).
  const gap = lastCompletedDate ? daysBetween(lastCompletedDate, today) : 1;
  let newStreak: number;
  let newSkips = weeklySkipsRemaining;

  if (gap === 1) {
    newStreak = currentStreak + 1;
  } else if (gap > 1 && weeklySkipsRemaining > 0) {
    newStreak = currentStreak + 1;
    newSkips -= 1;
  } else {
    newStreak = 1;
  }

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(longestStreak, newStreak),
    weeklySkipsRemaining: newSkips,
    lastCompletedDate: today,
    wasNoOp: false,
  };
}

export interface XPResult {
  xpEarned: number;
  streakBonus: boolean;
  speedBonus: boolean;
}

export function computeXP(
  difficulty: string,
  currentStreak: number,
  startedAtISO: string | null,
  submittedAtISO: string,
): XPResult {
  const base = XP_BY_DIFFICULTY[difficulty] ?? XP_BY_DIFFICULTY['easy'];
  const streakBonus = currentStreak > 0 && currentStreak % 7 === 0;

  let speedBonus = false;
  if (startedAtISO !== null) {
    const elapsedMs = new Date(submittedAtISO).getTime() - new Date(startedAtISO).getTime();
    speedBonus = elapsedMs < 5 * 60 * 1000;
  }

  return {
    xpEarned: base + (streakBonus ? 5 : 0) + (speedBonus ? 5 : 0),
    streakBonus,
    speedBonus,
  };
}

export function computeLevel(totalXP: number): number {
  let level = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) {
      level = i;
    } else {
      break;
    }
  }
  return level;
}
