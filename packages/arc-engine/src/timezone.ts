import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import type { ClockTime, ISODate } from "./types";

/** The calendar date of instant `now` in `timeZone`. */
export function localDate(now: Date, timeZone: string): ISODate {
  return formatInTimeZone(now, timeZone, "yyyy-MM-dd");
}

/** Wall-clock time of instant `now` in `timeZone`, `HH:mm`. */
export function localTime(now: Date, timeZone: string): ClockTime {
  return formatInTimeZone(now, timeZone, "HH:mm");
}

/** The instant when the wall clock in `timeZone` shows `time` on `date`. */
export function instantAt(date: ISODate, time: ClockTime, timeZone: string): Date {
  return fromZonedTime(`${date}T${time}:00`, timeZone);
}

/** Minutes since midnight for an `HH:mm` string. */
export function clockMinutes(time: ClockTime): number {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) throw new RangeError(`Invalid clock time: ${time}`);
  return Number(match[1]) * 60 + Number(match[2]);
}

/**
 * Minutes on the "night clock" used to compare bedtime-style targets (assumption A1):
 * 12:00–23:59 map to 720–1439, 00:00–11:59 map to 1440–2159. So 23:50 < 00:00 < 00:30.
 */
export function nightMinutes(time: ClockTime): number {
  const minutes = clockMinutes(time);
  return minutes < 12 * 60 ? minutes + 24 * 60 : minutes;
}
