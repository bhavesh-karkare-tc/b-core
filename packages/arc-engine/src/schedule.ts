import { addDays, diffDays, maxDate, minDate, weekStart, weekday } from "./dates";
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

/** First and last arc day of the Monday–Sunday week containing `date`. */
function arcWeekBounds(date: ISODate, arc: ArcSpan): { first: ISODate; last: ISODate } {
  const arcEnd = addDays(arc.startDate, arc.durationDays - 1);
  const monday = weekStart(date);
  return { first: maxDate(monday, arc.startDate), last: minDate(addDays(monday, 6), arcEnd) };
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
  const { first, last } = arcWeekBounds(date, arc);
  const quota = Math.min(times, diffDays(last, first) + 1);
  const daysLeftAfter = diffDays(last, date);
  return achievedBefore + daysLeftAfter >= quota;
}
