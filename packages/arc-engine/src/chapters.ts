import { addDays, diffDays, minDate, monthEnd } from "./dates";
import type { Chapter, ISODate } from "./types";

export function arcEndDate(startDate: ISODate, durationDays: number): ISODate {
  return addDays(startDate, durationDays - 1);
}

/** 1-based arc day number for `date` ("Day 23 of 92"). Can be ≤ 0 before start. */
export function dayNumber(startDate: ISODate, date: ISODate): number {
  return diffDays(date, startDate) + 1;
}

/**
 * One chapter per calendar month the arc touches (MASTER_DOC §6, E1, E19).
 * A mid-month start makes the first chapter shorter.
 */
export function generateChapters(startDate: ISODate, durationDays: number): Chapter[] {
  const end = arcEndDate(startDate, durationDays);
  const chapters: Chapter[] = [];
  let cursor = startDate;
  while (cursor <= end) {
    const chapterEnd = minDate(monthEnd(cursor), end);
    chapters.push({
      index: chapters.length + 1,
      month: cursor.slice(0, 7),
      startDate: cursor,
      endDate: chapterEnd,
      days: diffDays(chapterEnd, cursor) + 1,
    });
    cursor = addDays(chapterEnd, 1);
  }
  return chapters;
}

export function chapterFor(chapters: readonly Chapter[], date: ISODate): Chapter | undefined {
  return chapters.find((c) => date >= c.startDate && date <= c.endDate);
}
