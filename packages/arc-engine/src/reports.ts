import { computeArcStreak } from "./arc-streak";
import { arcEndDate, generateChapters } from "./chapters";
import { habitCompletion } from "./completion";
import { cutoffInstant } from "./cutoff";
import { addDays, diffDays, maxDate, minDate, weekStart } from "./dates";
import { dayOfWeekPattern, type DayOfWeekPattern } from "./insights";
import type { Arc, BodyCheck, DayResult, EntryStatus, ISODate, StreakStateName } from "./types";

export type ReportType = "weekly" | "monthly";

export type DueReport = {
  type: ReportType;
  /** Week number (1-based) or chapter index. */
  index: number;
  periodStart: ISODate;
  periodEnd: ISODate;
  /** Arc days in the period. */
  days: number;
  /** When it is generated: the cutoff of its last day (Monday / the 1st at noon, MASTER_DOC §11). */
  generatedAt: Date;
};

type ArcClock = Pick<Arc, "startDate" | "durationDays" | "timeZone">;

/** Every report period of the arc, due or not, in generation order (R12: short weeks included). */
export function reportPeriods(arc: ArcClock): DueReport[] {
  const end = arcEndDate(arc.startDate, arc.durationDays);
  const periods: DueReport[] = [];
  let index = 1;
  for (let monday = weekStart(arc.startDate); monday <= end; monday = addDays(monday, 7)) {
    const periodStart = maxDate(monday, arc.startDate);
    const periodEnd = minDate(addDays(monday, 6), end);
    periods.push({
      type: "weekly",
      index: index++,
      periodStart,
      periodEnd,
      days: diffDays(periodEnd, periodStart) + 1,
      generatedAt: cutoffInstant(periodEnd, arc.timeZone),
    });
  }
  for (const c of generateChapters(arc.startDate, arc.durationDays)) {
    periods.push({
      type: "monthly",
      index: c.index,
      periodStart: c.startDate,
      periodEnd: c.endDate,
      days: c.days,
      generatedAt: cutoffInstant(c.endDate, arc.timeZone),
    });
  }
  // Stable sort: weekly periods were added first, so a week and a chapter ending on the
  // same day keep weekly before monthly.
  return periods.sort((a, b) => a.generatedAt.getTime() - b.generatedAt.getTime());
}

/** Reports whose generation time has passed (TC46). */
export function dueReports(arc: ArcClock, now: Date): DueReport[] {
  return reportPeriods(arc).filter((r) => now.getTime() >= r.generatedAt.getTime());
}

export type HabitStatuses = { habitId: string; statuses: EntryStatus[] };
export type HabitRatio = { habitId: string; ratio: number };

/** Strongest and weakest habit by completion (ties keep display order). */
export function bestAndWeakest(habits: readonly HabitStatuses[]): {
  best: HabitRatio | null;
  weakest: HabitRatio | null;
} {
  let best: HabitRatio | null = null;
  let weakest: HabitRatio | null = null;
  for (const h of habits) {
    const ratio = habitCompletion(h.statuses).ratio;
    if (ratio === null) continue;
    if (!best || ratio > best.ratio) best = { habitId: h.habitId, ratio };
    if (!weakest || ratio < weakest.ratio) weakest = { habitId: h.habitId, ratio };
  }
  return { best, weakest: weakest && best && weakest.habitId !== best.habitId ? weakest : null };
}

type Totals = { total: number; average: number | null; countedDays: number; strongDays: number };

function totalsOf(days: readonly DayResult[]): Totals {
  const scores = days.flatMap((d) => (d.score === null ? [] : [d.score]));
  const total = scores.reduce((a, b) => a + b, 0);
  return {
    total,
    average: scores.length ? total / scores.length : null,
    countedDays: scores.length,
    strongDays: days.filter((d) => d.isStrong).length,
  };
}

function statusesIn(days: readonly DayResult[], habitIds: readonly string[]): HabitStatuses[] {
  return habitIds.map((habitId) => ({
    habitId,
    statuses: days.flatMap((d) =>
      d.entries.filter((e) => e.habitId === habitId).map((e) => e.status),
    ),
  }));
}

export type WeeklySnapshot = Totals & {
  days: number;
  /** 100 × arc days in the week. */
  max: number;
  previousAverage: number | null;
  change: number | null;
  best: HabitRatio | null;
  weakest: HabitRatio | null;
  streakStart: number;
  streakEnd: number;
  streakState: StreakStateName;
};

/** Weekly summary numbers (MASTER_DOC §11). `days` are all evaluated arc days in date order. */
export function weeklySnapshot(
  days: readonly DayResult[],
  habitIds: readonly string[],
  period: Pick<DueReport, "periodStart" | "periodEnd" | "days">,
): WeeklySnapshot {
  const inWeek = days.filter((d) => d.date >= period.periodStart && d.date <= period.periodEnd);
  const prevStart = addDays(weekStart(period.periodStart), -7);
  const prevEnd = addDays(weekStart(period.periodStart), -1);
  const previous = totalsOf(days.filter((d) => d.date >= prevStart && d.date <= prevEnd));
  const totals = totalsOf(inWeek);
  const before = computeArcStreak(days.filter((d) => d.date < period.periodStart)).state;
  const after = computeArcStreak(days.filter((d) => d.date <= period.periodEnd)).state;
  return {
    ...totals,
    days: period.days,
    max: period.days * 100,
    previousAverage: previous.average,
    change:
      totals.average !== null && previous.average !== null
        ? totals.average - previous.average
        : null,
    ...bestAndWeakest(statusesIn(inWeek, habitIds)),
    streakStart: before.current,
    streakEnd: after.current,
    streakState: after.state,
  };
}

export type HabitTotals = {
  habitId: string;
  done: number;
  minimum: number;
  missed: number;
  rest: number;
  ratio: number | null;
};

export type MonthlySnapshot = Totals & {
  days: number;
  max: number;
  bestStreak: number;
  best: HabitRatio | null;
  weakest: HabitRatio | null;
  habits: HabitTotals[];
  pattern: DayOfWeekPattern | null;
};

/** Monthly review numbers for one chapter (MASTER_DOC §11). */
export function monthlySnapshot(
  days: readonly DayResult[],
  habitIds: readonly string[],
  period: Pick<DueReport, "index" | "periodStart" | "periodEnd" | "days">,
): MonthlySnapshot {
  const inChapter = days.filter((d) => d.date >= period.periodStart && d.date <= period.periodEnd);
  const { history } = computeArcStreak(days);
  const inPeriod = history.filter(
    (h) => h.date >= period.periodStart && h.date <= period.periodEnd,
  );
  const statuses = statusesIn(inChapter, habitIds);
  return {
    ...totalsOf(inChapter),
    days: period.days,
    max: period.days * 100,
    bestStreak: Math.max(0, ...inPeriod.map((h) => h.current)),
    ...bestAndWeakest(statuses),
    habits: statuses.map(({ habitId, statuses: s }) => {
      const c = habitCompletion(s);
      return {
        habitId,
        done: c.done,
        minimum: c.minimum,
        missed: c.missed,
        rest: c.rest,
        ratio: c.ratio,
      };
    }),
    pattern: dayOfWeekPattern(
      inChapter.map((d) => ({ date: d.date, score: d.score, final: true })),
    ),
  };
}

export type BodyMetrics = Pick<BodyCheck, "weightKg" | "waistCm" | "pushupsMax" | "energy">;

/** Change between two body checks per metric; null where either side is missing ("Not logged"). */
export function bodyCheckDelta(
  start: BodyMetrics | null,
  end: BodyMetrics | null,
): Record<keyof BodyMetrics, number | null> {
  const diff = (k: keyof BodyMetrics) => {
    const a = start?.[k] ?? null;
    const b = end?.[k] ?? null;
    return a === null || b === null ? null : Math.round((b - a) * 10) / 10;
  };
  return {
    weightKg: diff("weightKg"),
    waistCm: diff("waistCm"),
    pushupsMax: diff("pushupsMax"),
    energy: diff("energy"),
  };
}

/** The baseline for a chapter: the latest body check on or before its first day. */
export function baselineCheck<T extends Pick<BodyCheck, "date">>(
  checks: readonly T[],
  chapterStart: ISODate,
): T | null {
  return (
    [...checks]
      .filter((c) => c.date <= chapterStart)
      .sort((a, b) => b.date.localeCompare(a.date))[0] ?? null
  );
}
