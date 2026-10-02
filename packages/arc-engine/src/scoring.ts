import { MAX_POINTS_PER_HABIT } from "./constants";
import { weekStart } from "./dates";
import type { Chapter, DayResult, HeatLevel, ISODate, ResolvedEntry } from "./types";

/**
 * Daily score = round(sum(points) / (10 × counted habits) × 100) (MASTER_DOC §8).
 * Sick entries are not counted. Returns null when nothing is counted.
 */
export function dailyScore(entries: readonly ResolvedEntry[]): number | null {
  let sum = 0;
  let counted = 0;
  for (const e of entries) {
    if (e.points === null) continue;
    sum += e.points;
    counted += 1;
  }
  if (counted === 0) return null;
  return Math.round((sum / (MAX_POINTS_PER_HABIT * counted)) * 100);
}

/** Strong day: score at or above the threshold. */
export function isStrongScore(score: number | null, threshold: number): boolean {
  return score !== null && score >= threshold;
}

export function dayResult(
  date: ISODate,
  entries: readonly ResolvedEntry[],
  threshold: number,
): DayResult {
  const score = dailyScore(entries);
  const counted = entries.filter((e) => e.points !== null);
  return {
    date,
    entries: [...entries],
    score,
    isSick: score === null,
    isStrong: isStrongScore(score, threshold),
    isWeak: score !== null && score < threshold,
    recoveryDay: counted.length > 0 && counted.every((e) => e.status === "rest"),
    provisional: entries.some((e) => e.provisional),
  };
}

export type PeriodTotals = {
  /** Sum of daily scores (sick days add nothing). */
  total: number;
  /** Average over counted days, or null if none. */
  average: number | null;
  countedDays: number;
  strongDays: number;
};

function totals(days: readonly DayResult[]): PeriodTotals {
  let total = 0;
  let countedDays = 0;
  let strongDays = 0;
  for (const d of days) {
    if (d.score === null) continue;
    total += d.score;
    countedDays += 1;
    if (d.isStrong) strongDays += 1;
  }
  return { total, average: countedDays ? total / countedDays : null, countedDays, strongDays };
}

export type WeekTotals = PeriodTotals & { weekStart: ISODate };

/** Weekly score = sum of daily scores Monday to Sunday (max 700), plus the average. */
export function weeklyTotals(days: readonly DayResult[]): WeekTotals[] {
  const byWeek = new Map<ISODate, DayResult[]>();
  for (const d of days) {
    const key = weekStart(d.date);
    byWeek.set(key, [...(byWeek.get(key) ?? []), d]);
  }
  return [...byWeek.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => ({ weekStart: key, ...totals(list) }));
}

export type ChapterTotals = PeriodTotals & { index: number; max: number };

/** Chapter score = sum of daily scores in the chapter; max = 100 × chapter days (TC07, E19). */
export function chapterTotals(
  days: readonly DayResult[],
  chapters: readonly Chapter[],
): ChapterTotals[] {
  return chapters.map((c) => ({
    index: c.index,
    max: chapterMaxScore(c),
    ...totals(days.filter((d) => d.date >= c.startDate && d.date <= c.endDate)),
  }));
}

export function chapterMaxScore(chapter: Chapter): number {
  return 100 * chapter.days;
}

/** Arc points = sum of all daily scores + bonus points. Used for rank only. */
export function arcPoints(days: readonly DayResult[], bonusPoints = 0): number {
  return totals(days).total + bonusPoints;
}

/** Heatmap level: <40 = 0, 40–59 = 1, 60–79 = 2, 80–99 = 3, 100 = 4; sick shown apart. */
export function heatLevel(score: number | null): HeatLevel {
  if (score === null) return "sick";
  if (score >= 100) return 4;
  if (score >= 80) return 3;
  if (score >= 60) return 2;
  if (score >= 40) return 1;
  return 0;
}

/**
 * Fewest more habits to log to reach the threshold today ("Five more ticks to stay safe").
 * Each pending habit logged Done adds 10; upgrading a Minimum to Done adds 5.
 * Returns 0 when already strong, null when the threshold is out of reach (or nothing is counted).
 */
export function habitsNeededForStrong(
  entries: readonly ResolvedEntry[],
  threshold: number,
): number | null {
  const score = dailyScore(entries);
  if (score === null) return null;
  if (score >= threshold) return 0;

  const counted = entries.flatMap((e) => (e.points === null ? [] : [{ ...e, points: e.points }]));
  const gains = counted
    .map((e) => (e.status === "unlogged" ? MAX_POINTS_PER_HABIT : e.status === "minimum" ? 5 : 0))
    .filter((g) => g > 0)
    .sort((a, b) => b - a);

  let sum = counted.reduce((acc, e) => acc + e.points, 0);
  for (const [i, gain] of gains.entries()) {
    sum += gain;
    if (Math.round((sum / (MAX_POINTS_PER_HABIT * counted.length)) * 100) >= threshold)
      return i + 1;
  }
  return null;
}
