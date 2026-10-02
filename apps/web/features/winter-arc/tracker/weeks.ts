import { weekStart } from "@b-core/arc-engine";
import type { TrackerRow } from "@/data";

export type TrackerWeek = { start: string; rows: TrackerRow[] };

/** Split a chapter's rows into Monday–Sunday weeks (first/last may be partial). */
export function chapterWeeks(rows: TrackerRow[]): TrackerWeek[] {
  const weeks: TrackerWeek[] = [];
  for (const row of rows) {
    const start = weekStart(row.date);
    const last = weeks.at(-1);
    if (last && last.start === start) last.rows.push(row);
    else weeks.push({ start, rows: [row] });
  }
  return weeks;
}

/** The week to show first: the one with today, else the last reached, else the first. */
export function defaultWeekIndex(weeks: TrackerWeek[]): number {
  const today = weeks.findIndex((w) => w.rows.some((r) => r.isToday));
  if (today >= 0) return today;
  const reached = weeks.map((w) => w.rows.some((r) => !r.future)).lastIndexOf(true);
  return Math.max(0, reached);
}
