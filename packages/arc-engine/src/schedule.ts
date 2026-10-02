import { addDays, diffDays, eachDay, maxDate, minDate, weekStart, weekday } from "./dates";
import type { Habit, HabitVersion, ISODate } from "./types";

type ArcSpan = { startDate: ISODate; durationDays: number };

/** The habit as it was on `date`: latest version with `validFrom` on or before it. */
export function habitOn(versions: readonly HabitVersion[], date: ISODate): Habit | undefined {
  let current: HabitVersion | undefined;
  for (const version of versions) {
    if (version.validFrom <= date && (!current || version.validFrom >= current.validFrom)) {
      current = version;
    }
  }
  return current?.habit;
}

/**
 * Whether the schedule asks for the habit on `date`. Unscheduled days are Rest.
 * Per-week habits are always "scheduled"; their Rest is decided by `perWeekRestEligible`.
 */
export function isScheduled(habit: Habit, date: ISODate): boolean {
  switch (habit.schedule.kind) {
    case "daily":
    case "perWeek":
      return true;
    case "weekdays":
      return habit.schedule.days.includes(weekday(date));
  }
}

/** Arc days in the Monday–Sunday week containing `date`. */
function arcDaysInWeek(date: ISODate, arc: ArcSpan): ISODate[] {
  const arcEnd = addDays(arc.startDate, arc.durationDays - 1);
  const monday = weekStart(date);
  return eachDay(maxDate(monday, arc.startDate), minDate(addDays(monday, 6), arcEnd));
}

/**
 * Rule R4 — "rest while you still can", decided one day at a time.
 * An unlogged day of an X-per-week habit is Rest if the weekly quota is still reachable
 * without it: `achievedBefore + days left in the week after this one >= quota`.
 * The quota is capped at the arc days in a partial first/last week.
 *
 * @param achievedBefore Done/Minimum days earlier in the same week.
 */
export function perWeekRestEligible(
  times: number,
  date: ISODate,
  achievedBefore: number,
  arc: ArcSpan,
): boolean {
  const week = arcDaysInWeek(date, arc);
  const quota = Math.min(times, week.length);
  const lastDay = week[week.length - 1] ?? date;
  const daysLeftAfter = Math.max(0, diffDays(lastDay, date));
  return achievedBefore + daysLeftAfter >= quota;
}
