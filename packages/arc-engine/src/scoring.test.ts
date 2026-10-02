import { describe, expect, it } from "vitest";
import { resolved, times } from "./__fixtures__/entries";
import {
  arcPoints,
  chapterMaxScore,
  chapterTotals,
  dailyScore,
  dayResult,
  heatLevel,
  isStrongScore,
  weeklyTotals,
} from "./scoring";
import type { Chapter, DayResult } from "./types";

/** A counted day with a given score (entries irrelevant for totals). */
function day(date: string, score: number | null, threshold = 80): DayResult {
  return {
    date,
    entries: [],
    score,
    isSick: score === null,
    isStrong: isStrongScore(score, threshold),
    isWeak: score !== null && score < threshold,
    recoveryDay: false,
    provisional: false,
  };
}

describe("dailyScore", () => {
  it("TC28: 7 Done, 1 Minimum, 1 Rest, 1 Missed = 85", () => {
    const entries = resolved([...times(7, "done"), "minimum", "rest", "missed"]);
    expect(dailyScore(entries)).toBe(85);
  });

  it("TC29: a sick day has no score", () => {
    expect(dailyScore(resolved(times(10, "sick")))).toBeNull();
  });

  it("sick entries are excluded from the denominator", () => {
    // 2 done of 2 counted = 100
    expect(dailyScore(resolved(["done", "done", "sick"]))).toBe(100);
  });

  it("unlogged counts as 0 before cutoff", () => {
    expect(dailyScore(resolved([...times(5, "done"), ...times(5, "unlogged")]))).toBe(50);
  });

  it("rounds to the nearest whole number", () => {
    // 25 / 30 = 83.33 → 83
    expect(dailyScore(resolved(["done", "done", "minimum"]))).toBe(83);
    // 25 / 40 = 62.5 → 63
    expect(dailyScore(resolved(["done", "done", "minimum", "missed"]))).toBe(63);
  });

  it("empty list has no score", () => {
    expect(dailyScore([])).toBeNull();
  });
});

describe("dayResult", () => {
  it("TC30: score 80 with threshold 80 is strong", () => {
    const r = dayResult("2026-10-05", resolved([...times(8, "done"), ...times(2, "missed")]), 80);
    expect(r).toMatchObject({ score: 80, isStrong: true, isWeak: false, isSick: false });
  });

  it("score below the threshold (75) is weak", () => {
    const r = dayResult(
      "2026-10-05",
      resolved([...times(7, "done"), "minimum", ...times(2, "missed")]),
      80,
    );
    expect(r).toMatchObject({ score: 75, isStrong: false, isWeak: true });
  });

  it("TC29: sick day is neither weak nor strong", () => {
    const r = dayResult("2026-10-05", resolved(times(10, "sick")), 80);
    expect(r).toMatchObject({ score: null, isSick: true, isStrong: false, isWeak: false });
  });

  it("E8: all Rest = 100, strong, recovery day", () => {
    const r = dayResult("2026-10-05", resolved(times(10, "rest")), 80);
    expect(r).toMatchObject({ score: 100, isStrong: true, recoveryDay: true });
  });

  it("is provisional while any entry is provisional", () => {
    expect(dayResult("2026-10-05", resolved(["done"], true), 80).provisional).toBe(true);
    expect(dayResult("2026-10-05", resolved(["done"]), 80).provisional).toBe(false);
  });

  it("respects a custom threshold", () => {
    const entries = resolved([...times(6, "done"), ...times(4, "missed")]);
    expect(dayResult("2026-10-05", entries, 60).isStrong).toBe(true);
    expect(dayResult("2026-10-05", entries, 80).isStrong).toBe(false);
  });
});

describe("weeklyTotals", () => {
  it("sums Monday to Sunday (max 700) and averages counted days", () => {
    const week = ["05", "06", "07", "08", "09", "10", "11"].map((d) => day(`2026-10-${d}`, 100));
    expect(weeklyTotals(week)).toEqual([
      { weekStart: "2026-10-05", total: 700, average: 100, countedDays: 7, strongDays: 7 },
    ]);
  });

  it("splits by week, ignores sick days in the average", () => {
    const days = [
      day("2026-10-10", 80),
      day("2026-10-11", null), // Sunday, sick
      day("2026-10-12", 60), // next Monday
    ];
    expect(weeklyTotals(days)).toEqual([
      { weekStart: "2026-10-05", total: 80, average: 80, countedDays: 1, strongDays: 1 },
      { weekStart: "2026-10-12", total: 60, average: 60, countedDays: 1, strongDays: 0 },
    ]);
  });

  it("all-sick week has no average", () => {
    expect(weeklyTotals([day("2026-10-05", null)])[0]?.average).toBeNull();
  });
});

describe("chapterTotals", () => {
  const oct: Chapter = {
    index: 1,
    month: "2026-10",
    startDate: "2026-10-15",
    endDate: "2026-10-31",
    days: 17,
  };
  const nov: Chapter = {
    index: 2,
    month: "2026-11",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    days: 30,
  };

  it("TC07: a 17-day chapter has max score 1,700", () => {
    expect(chapterMaxScore(oct)).toBe(1700);
  });

  it("E19: a 30-day month scales to 3,000", () => {
    expect(chapterMaxScore(nov)).toBe(3000);
  });

  it("sums only the days inside each chapter", () => {
    const days = [day("2026-10-31", 90), day("2026-11-01", 70), day("2026-11-02", 80)];
    expect(chapterTotals(days, [oct, nov])).toEqual([
      { index: 1, max: 1700, total: 90, average: 90, countedDays: 1, strongDays: 1 },
      { index: 2, max: 3000, total: 150, average: 75, countedDays: 2, strongDays: 1 },
    ]);
  });
});

describe("arcPoints", () => {
  it("sums daily scores plus bonus; sick days add nothing", () => {
    const days = [day("2026-10-01", 85), day("2026-10-02", null), day("2026-10-03", 70)];
    expect(arcPoints(days)).toBe(155);
    expect(arcPoints(days, 150)).toBe(305);
  });
});

describe("heatLevel", () => {
  it("TC42: 100, 85, 60, 30 and sick map to distinct levels", () => {
    expect(heatLevel(100)).toBe(4);
    expect(heatLevel(85)).toBe(3);
    expect(heatLevel(60)).toBe(2);
    expect(heatLevel(30)).toBe(0);
    expect(heatLevel(null)).toBe("sick");
  });

  it("level boundaries: 39/40, 59/60, 79/80, 99/100", () => {
    expect([39, 40, 59, 60, 79, 80, 99, 100].map(heatLevel)).toEqual([0, 1, 1, 2, 2, 3, 3, 4]);
  });
});
