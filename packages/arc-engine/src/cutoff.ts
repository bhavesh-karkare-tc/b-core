import { arcEndDate } from "./chapters";
import { CUTOFF_HOUR, LOCK_AFTER_DAY } from "./constants";
import { addDays } from "./dates";
import { sickDaysRemaining } from "./sick";
import { instantAt, localDate } from "./timezone";
import type { Arc, ISODate } from "./types";

type ArcClock = Pick<Arc, "startDate" | "durationDays" | "timeZone">;

const CUTOFF_TIME = `${String(CUTOFF_HOUR).padStart(2, "0")}:00`;

/** When `date` closes: 12:00 noon the next day in the arc timezone (MASTER_DOC §7). */
export function cutoffInstant(date: ISODate, timeZone: string): Date {
  return instantAt(addDays(date, 1), CUTOFF_TIME, timeZone);
}

/** True once the day's cutoff has passed: its snapshot is final. */
export function isFinal(date: ISODate, now: Date, timeZone: string): boolean {
  return now.getTime() >= cutoffInstant(date, timeZone).getTime();
}

/** Milliseconds left to edit `date` (0 once closed). */
export function timeUntilCutoff(date: ISODate, now: Date, timeZone: string): number {
  return Math.max(0, cutoffInstant(date, timeZone).getTime() - now.getTime());
}

export type EditWindow =
  | { editable: true; closesAt: Date }
  | { editable: false; reason: "before_start" | "after_end" | "future" | "closed" };

/**
 * Whether a day of the arc can be edited now (MASTER_DOC §7 edit window, TC20, TC21).
 * Today and yesterday stay open until noon of the following day; older days are read-only.
 */
export function editWindow(date: ISODate, now: Date, arc: ArcClock): EditWindow {
  if (date < arc.startDate) return { editable: false, reason: "before_start" };
  if (date > arcEndDate(arc.startDate, arc.durationDays))
    return { editable: false, reason: "after_end" };
  if (date > localDate(now, arc.timeZone)) return { editable: false, reason: "future" };
  if (isFinal(date, now, arc.timeZone)) return { editable: false, reason: "closed" };
  return { editable: true, closesAt: cutoffInstant(date, arc.timeZone) };
}

export function isEditable(date: ISODate, now: Date, arc: ArcClock): boolean {
  return editWindow(date, now, arc).editable;
}

/** The arc has begun in its timezone (before that: countdown, logging disabled — TC06). */
export function hasArcStarted(arc: ArcClock, now: Date): boolean {
  return localDate(now, arc.timeZone) >= arc.startDate;
}

/**
 * Habit type, target and schedule lock after the end of Day 3 (TC08).
 * Only rename and reminder time are allowed afterwards.
 */
export function isArcLocked(arc: ArcClock, now: Date): boolean {
  const lockAt = instantAt(addDays(arc.startDate, LOCK_AFTER_DAY), "00:00", arc.timeZone);
  return now.getTime() >= lockAt.getTime();
}

/** E18: the strong-day threshold can change only before lock, never retroactively. */
export function canChangeThreshold(arc: ArcClock, now: Date): boolean {
  return !isArcLocked(arc, now);
}

/** E17: the arc completes at the cutoff of its last day. */
export function isArcComplete(arc: ArcClock, now: Date): boolean {
  return isFinal(arcEndDate(arc.startDate, arc.durationDays), now, arc.timeZone);
}

export type SickDayCheck =
  { allowed: true } | { allowed: false; reason: "already_sick" | "no_days_left" | "not_editable" };

/**
 * Sick day rules (MASTER_DOC §7, A4, E9, E10): allowance left, and only while the day
 * is still editable — never after cutoff.
 */
export function canUseSickDay(
  arc: ArcClock & Pick<Arc, "sickDaysUsed">,
  date: ISODate,
  now: Date,
  alreadySick: boolean,
): SickDayCheck {
  if (alreadySick) return { allowed: false, reason: "already_sick" };
  if (sickDaysRemaining(arc.durationDays, arc.sickDaysUsed) === 0) {
    return { allowed: false, reason: "no_days_left" };
  }
  if (!isEditable(date, now, arc)) return { allowed: false, reason: "not_editable" };
  return { allowed: true };
}
