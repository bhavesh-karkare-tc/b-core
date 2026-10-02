import { habitCompletion } from "./completion";
import { weekday } from "./dates";
import type { EntryStatus, ISODate, StreakStateName, Weekday } from "./types";

/** Insights unlock on Day 7; Days 1–6 show a progress bar (MASTER_DOC §10, A13). */
export const INSIGHTS_UNLOCK_DAY = 7;

export function insightsUnlocked(dayNumber: number): boolean {
  return dayNumber >= INSIGHTS_UNLOCK_DAY;
}

/** Trailing average over `window` values, skipping nulls (sick days); null when none in range. */
export function movingAverage(values: readonly (number | null)[], window = 7): (number | null)[] {
  return values.map((_, i) => {
    const slice = values
      .slice(Math.max(0, i - window + 1), i + 1)
      .filter((v): v is number => v !== null);
    return slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : null;
  });
}

export type HabitWeeks = { habitId: string; thisWeek: EntryStatus[]; lastWeek: EntryStatus[] };

export type WeakestHabit = {
  habitId: string;
  /** Completion this week, 0–1. */
  ratio: number;
  /** Completion last week, or null without data. */
  previous: number | null;
  /** ratio − previous, or null. */
  change: number | null;
};

/**
 * Weakest habit this week and its trend vs last week (MASTER_DOC §10 Section C).
 * Null when nothing is counted yet or every habit is fully complete. Ties go to display order.
 */
export function weakestHabit(habits: readonly HabitWeeks[]): WeakestHabit | null {
  let weakest: WeakestHabit | null = null;
  for (const h of habits) {
    const ratio = habitCompletion(h.thisWeek).ratio;
    if (ratio === null || ratio >= 1) continue;
    if (weakest && ratio >= weakest.ratio) continue;
    const previous = habitCompletion(h.lastWeek).ratio;
    weakest = {
      habitId: h.habitId,
      ratio,
      previous,
      change: previous === null ? null : ratio - previous,
    };
  }
  return weakest;
}

export type ScoredDay = { date: ISODate; score: number | null; final: boolean };

export type DayOfWeekPattern = {
  weekday: Weekday;
  average: number;
  /** Average score of every other finalised day. */
  othersAverage: number;
  gap: number;
};

/**
 * Weakest weekday vs the rest (R10): finalised, counted days only; the weekday needs at least
 * `minSamples` days and must sit at least `minGap` points below the average of the other days.
 */
export function dayOfWeekPattern(
  days: readonly ScoredDay[],
  minGap = 10,
  minSamples = 2,
): DayOfWeekPattern | null {
  const counted = days.filter(
    (d): d is ScoredDay & { score: number } => d.final && d.score !== null,
  );
  const byDay = new Map<Weekday, number[]>();
  for (const d of counted) {
    const wd = weekday(d.date);
    byDay.set(wd, [...(byDay.get(wd) ?? []), d.score]);
  }
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  let worst: { weekday: Weekday; average: number } | null = null;
  for (const [wd, scores] of byDay) {
    if (scores.length < minSamples) continue;
    const average = mean(scores);
    if (!worst || average < worst.average) worst = { weekday: wd, average };
  }
  if (!worst) return null;

  const others = counted.filter((d) => weekday(d.date) !== worst.weekday).map((d) => d.score);
  if (others.length === 0) return null;
  const othersAverage = mean(others);
  const gap = othersAverage - worst.average;
  return gap >= minGap ? { ...worst, othersAverage, gap } : null;
}

export type MinimumOveruse = { minimum: number; of: number };

/**
 * Minimum overuse (R11): among the habit's last `window` finalised scheduled days
 * (Rest, Sick and pending skipped), Minimum on at least `share` of them, with ≥ `minSamples` days.
 * `statuses` are oldest → newest.
 */
export function minimumOveruse(
  statuses: readonly EntryStatus[],
  window = 14,
  minSamples = 7,
  share = 0.5,
): MinimumOveruse | null {
  const scheduled = statuses
    .filter((s) => s === "done" || s === "minimum" || s === "missed")
    .slice(-window);
  if (scheduled.length < minSamples) return null;
  const minimum = scheduled.filter((s) => s === "minimum").length;
  return minimum / scheduled.length >= share ? { minimum, of: scheduled.length } : null;
}

/** Streak risk insight: yesterday left the streak at risk and today isn't strong yet. */
export function streakAtRisk(state: StreakStateName, todayStrong: boolean): boolean {
  return state === "at_risk" && !todayStrong;
}
