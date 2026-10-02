import { describe, expect, it } from "vitest";
import { arcEndDate, chapterFor, dayNumber, generateChapters } from "./chapters";

describe("chapters", () => {
  it("TC01: default arc 1 Oct + 92 days = 3 chapters ending 31 Dec", () => {
    expect(arcEndDate("2026-10-01", 92)).toBe("2026-12-31");
    expect(generateChapters("2026-10-01", 92)).toEqual([
      { index: 1, month: "2026-10", startDate: "2026-10-01", endDate: "2026-10-31", days: 31 },
      { index: 2, month: "2026-11", startDate: "2026-11-01", endDate: "2026-11-30", days: 30 },
      { index: 3, month: "2026-12", startDate: "2026-12-01", endDate: "2026-12-31", days: 31 },
    ]);
  });

  it("TC07 / E1: mid-month start on 15 Oct makes chapter 1 17 days", () => {
    const chapters = generateChapters("2026-10-15", 92);
    expect(chapters[0]).toMatchObject({ startDate: "2026-10-15", endDate: "2026-10-31", days: 17 });
    // A7: arc stays 92 days, so it runs into January.
    expect(chapters.map((c) => c.days)).toEqual([17, 30, 31, 14]);
    expect(chapters.reduce((sum, c) => sum + c.days, 0)).toBe(92);
  });

  it("E19: leap-year February follows the calendar", () => {
    const chapters = generateChapters("2028-02-01", 60);
    expect(chapters[0]).toMatchObject({ month: "2028-02", days: 29 });
    expect(chapters[1]).toMatchObject({ month: "2028-03", days: 31 });
  });

  it("30-day arc inside one month is one chapter", () => {
    expect(generateChapters("2026-11-01", 30)).toHaveLength(1);
  });

  it("dayNumber counts from Day 1", () => {
    expect(dayNumber("2026-10-01", "2026-10-01")).toBe(1);
    expect(dayNumber("2026-10-01", "2026-10-23")).toBe(23);
    expect(dayNumber("2026-10-01", "2026-12-31")).toBe(92);
    expect(dayNumber("2026-10-01", "2026-09-30")).toBe(0);
  });

  it("chapterFor finds the chapter containing a date", () => {
    const chapters = generateChapters("2026-10-01", 92);
    expect(chapterFor(chapters, "2026-11-15")?.index).toBe(2);
    expect(chapterFor(chapters, "2027-01-01")).toBeUndefined();
  });
});
