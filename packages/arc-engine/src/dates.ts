import {
  addDays as addDaysFns,
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDay,
  parseISO,
  startOfISOWeek,
} from "date-fns";
import type { ISODate, Weekday } from "./types";

/*
 * Calendar maths on ISO dates. Dates are parsed to local midnight and formatted back,
 * so results never depend on the machine's timezone.
 */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function toDate(date: ISODate): Date {
  if (!ISO_DATE.test(date)) throw new RangeError(`Invalid ISO date: ${date}`);
  return parseISO(date);
}

function toISO(date: Date): ISODate {
  return format(date, "yyyy-MM-dd");
}

export function addDays(date: ISODate, amount: number): ISODate {
  return toISO(addDaysFns(toDate(date), amount));
}

/** Whole calendar days from `from` to `to` (positive when `to` is later). */
export function diffDays(to: ISODate, from: ISODate): number {
  return differenceInCalendarDays(toDate(to), toDate(from));
}

export function weekday(date: ISODate): Weekday {
  return getDay(toDate(date)) as Weekday;
}

/** Monday of the week containing `date` (weeks run Monday to Sunday). */
export function weekStart(date: ISODate): ISODate {
  return toISO(startOfISOWeek(toDate(date)));
}

/** Last day of the month containing `date`. */
export function monthEnd(date: ISODate): ISODate {
  return toISO(endOfMonth(toDate(date)));
}

/** Every date from `start` to `end`, inclusive. Empty when `end` is before `start`. */
export function eachDay(start: ISODate, end: ISODate): ISODate[] {
  const count = diffDays(end, start) + 1;
  return Array.from({ length: Math.max(0, count) }, (_, i) => addDays(start, i));
}

/** Min/max for ISO dates (string order equals date order). */
export function minDate(a: ISODate, b: ISODate): ISODate {
  return a <= b ? a : b;
}

export function maxDate(a: ISODate, b: ISODate): ISODate {
  return a >= b ? a : b;
}
