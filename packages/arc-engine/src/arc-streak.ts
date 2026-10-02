import { MAX_SHIELDS, SHIELD_EVERY } from "./constants";
import type { Chapter, DayResult, ISODate, StreakState } from "./types";

/** Streak state plus the run counters needed to evaluate the next day. */
export type ArcStreakState = StreakState & {
  /** Consecutive weak days, sick days skipped (R2). A used shield does not reset it (R1). */
  weakRun: number;
  /** Consecutive strong days, sick days skipped; every 7th earns a shield. */
  strongRun: number;
};

export type StreakDay = {
  date: ISODate;
  current: number;
  state: StreakState["state"];
  shieldsHeld: number;
  shieldEarned: boolean;
  shieldUsed: boolean;
  /** Sick day: nothing changed. */
  frozen: boolean;
};

export const INITIAL_ARC_STREAK: ArcStreakState = {
  current: 0,
  best: 0,
  state: "safe",
  shieldsHeld: 0,
  lastStrongDate: null,
  weakRun: 0,
  strongRun: 0,
};

/**
 * One day of the "never miss two" state machine (MASTER_DOC §8).
 * - strong → +1, Safe; every 7 consecutive strong days earn a shield (max 2)
 * - first weak day → holds, At risk
 * - second (or later) consecutive weak day → uses a shield (Shielded, holds) or resets to 0 (Broken)
 * - sick day → frozen: nothing changes and it does not split a weak run (R2)
 */
export function stepArcStreak(
  prev: ArcStreakState,
  day: DayResult,
): { next: ArcStreakState; log: StreakDay } {
  const log = (next: ArcStreakState, extra: Partial<StreakDay> = {}) => ({
    next,
    log: {
      date: day.date,
      current: next.current,
      state: next.state,
      shieldsHeld: next.shieldsHeld,
      shieldEarned: false,
      shieldUsed: false,
      frozen: false,
      ...extra,
    },
  });

  if (day.isSick) return log(prev, { frozen: true });

  if (day.isStrong) {
    const current = prev.current + 1;
    const strongRun = prev.strongRun + 1;
    const shieldEarned = strongRun % SHIELD_EVERY === 0 && prev.shieldsHeld < MAX_SHIELDS;
    return log(
      {
        current,
        best: Math.max(prev.best, current),
        state: "safe",
        shieldsHeld: prev.shieldsHeld + (shieldEarned ? 1 : 0),
        lastStrongDate: day.date,
        weakRun: 0,
        strongRun,
      },
      { shieldEarned },
    );
  }

  // Weak day.
  const weakRun = prev.weakRun + 1;
  const base = { ...prev, weakRun, strongRun: 0 };

  if (weakRun === 1) return log({ ...base, state: "at_risk" });
  if (prev.shieldsHeld > 0) {
    return log(
      { ...base, state: "shielded", shieldsHeld: prev.shieldsHeld - 1 },
      { shieldUsed: true },
    );
  }
  return log({ ...base, current: 0, state: "broken" });
}

export type ArcStreakResult = {
  state: ArcStreakState;
  history: StreakDay[];
  /** Best streak reached inside each chapter, by chapter index. */
  bestByChapter: Record<number, number>;
};

/**
 * Replay the streak over days in date order. Always recomputed from the full history,
 * so editing a past day updates everything after it (TC36).
 */
export function computeArcStreak(
  days: readonly DayResult[],
  chapters: readonly Chapter[] = [],
): ArcStreakResult {
  let state = INITIAL_ARC_STREAK;
  const history: StreakDay[] = [];

  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  for (const day of sorted) {
    const { next, log } = stepArcStreak(state, day);
    state = next;
    history.push(log);
  }

  const bestByChapter: Record<number, number> = {};
  for (const c of chapters) {
    const inChapter = history.filter((h) => h.date >= c.startDate && h.date <= c.endDate);
    bestByChapter[c.index] = Math.max(0, ...inChapter.map((h) => h.current));
  }

  return { state, history, bestByChapter };
}
