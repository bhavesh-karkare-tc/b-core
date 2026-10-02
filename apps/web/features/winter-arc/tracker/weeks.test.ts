import { describe, expect, it } from "vitest";
import type { TrackerRow } from "@/data";
import { chapterWeeks, defaultWeekIndex } from "./weeks";

const row = (date: string, extra: Partial<TrackerRow> = {}) =>
  ({ date, future: false, isToday: false, ...extra }) as TrackerRow;
const october = Array.from({ length: 31 }, (_, i) =>
  row(`2026-10-${String(i + 1).padStart(2, "0")}`),
);

describe("chapter weeks", () => {
  it("splits October 2026 into Monday-start weeks with partial ends", () => {
    const weeks = chapterWeeks(october);
    expect(weeks.map((w) => [w.start, w.rows.length])).toEqual([
      ["2026-09-28", 4],
      ["2026-10-05", 7],
      ["2026-10-12", 7],
      ["2026-10-19", 7],
      ["2026-10-26", 6],
    ]);
  });

  it("defaults to the week with today, else the last reached week", () => {
    const withToday = october.map((r) => (r.date === "2026-10-23" ? { ...r, isToday: true } : r));
    expect(defaultWeekIndex(chapterWeeks(withToday))).toBe(3);
    const past = october.map((r) => ({ ...r, future: r.date > "2026-10-08" }));
    expect(defaultWeekIndex(chapterWeeks(past))).toBe(1);
    expect(defaultWeekIndex(chapterWeeks(october.map((r) => ({ ...r, future: true }))))).toBe(0);
  });
});
