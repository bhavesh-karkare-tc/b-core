import { describe, expect, it } from "vitest";
import { dayCodes } from "./__fixtures__/days";
import { resolved, times } from "./__fixtures__/entries";
import {
  baselineCheck,
  bestAndWeakest,
  bodyCheckDelta,
  dueReports,
  monthlySnapshot,
  reportPeriods,
  weeklySnapshot,
} from "./reports";
import { instantAt } from "./timezone";
import type { DayResult } from "./types";

const tz = "Asia/Kolkata";
const arc = { startDate: "2026-10-01", durationDays: 92, timeZone: tz };

describe("report periods (R12)", () => {
  const periods = reportPeriods(arc);
  const weekly = periods.filter((p) => p.type === "weekly");
  const monthly = periods.filter((p) => p.type === "monthly");

  it("short first and last weeks are summarised with their arc days", () => {
    expect(weekly).toHaveLength(14);
    expect(weekly[0]).toMatchObject({
      index: 1,
      periodStart: "2026-10-01",
      periodEnd: "2026-10-04",
      days: 4,
    });
    expect(weekly[1]).toMatchObject({
      index: 2,
      periodStart: "2026-10-05",
      periodEnd: "2026-10-11",
      days: 7,
    });
    expect(weekly.at(-1)).toMatchObject({
      periodStart: "2026-12-28",
      periodEnd: "2026-12-31",
      days: 4,
    });
  });

  it("one monthly review per chapter", () => {
    expect(monthly.map((m) => [m.index, m.periodStart, m.days])).toEqual([
      [1, "2026-10-01", 31],
      [2, "2026-11-01", 30],
      [3, "2026-12-01", 31],
    ]);
  });

  it("TC46: weekly generated Monday 12:00 after the Sunday cutoff; monthly on the 1st at noon", () => {
    expect(weekly[1]?.generatedAt.toISOString()).toBe(
      instantAt("2026-10-12", "12:00", tz).toISOString(),
    );
    expect(monthly[0]?.generatedAt.toISOString()).toBe(
      instantAt("2026-11-01", "12:00", tz).toISOString(),
    );
  });

  it("sorted by generation time, weekly before monthly at the same time", () => {
    const at = (i: number) => periods[i]?.generatedAt.getTime() ?? 0;
    for (let i = 1; i < periods.length; i++) expect(at(i)).toBeGreaterThanOrEqual(at(i - 1));
  });
});

describe("dueReports (TC46)", () => {
  it("nothing before the first Monday noon", () => {
    expect(dueReports(arc, instantAt("2026-10-05", "11:59", tz))).toEqual([]);
  });

  it("week 1 appears at Monday 12:00", () => {
    expect(
      dueReports(arc, instantAt("2026-10-05", "12:00", tz)).map((r) => [r.type, r.index]),
    ).toEqual([["weekly", 1]]);
  });

  it("Day 23 (Fri 23 Oct): weeks 1–3 due, no monthly yet", () => {
    expect(dueReports(arc, instantAt("2026-10-23", "15:00", tz)).map((r) => r.index)).toEqual([
      1, 2, 3,
    ]);
  });

  it("1 Nov noon adds October's review", () => {
    const due = dueReports(arc, instantAt("2026-11-01", "12:00", tz));
    expect(due.at(-1)).toMatchObject({ type: "monthly", index: 1 });
  });
});

describe("bestAndWeakest", () => {
  it("highest and lowest completion; weakest null when only one habit", () => {
    expect(
      bestAndWeakest([
        { habitId: "a", statuses: times(4, "done") },
        { habitId: "b", statuses: ["done", "missed"] },
        { habitId: "c", statuses: ["sick"] },
      ]),
    ).toEqual({ best: { habitId: "a", ratio: 1 }, weakest: { habitId: "b", ratio: 0.5 } });
    expect(bestAndWeakest([{ habitId: "a", statuses: ["done"] }])).toEqual({
      best: { habitId: "a", ratio: 1 },
      weakest: null,
    });
    expect(bestAndWeakest([])).toEqual({ best: null, weakest: null });
  });
});

/** Days with two habits: h1 always done, h2 done on strong days, missed on weak. */
function twoHabitDays(codes: string): DayResult[] {
  return dayCodes(codes).map((d) => ({
    ...d,
    entries: d.isSick
      ? resolved(["sick", "sick"])
      : resolved(["done", d.isStrong ? "done" : "missed"]),
  }));
}

describe("weeklySnapshot", () => {
  const days = twoHabitDays(`SSSS${"SSWSSSS"}`); // Thu 1 – Sun 11 Oct
  const week2 = { periodStart: "2026-10-05", periodEnd: "2026-10-11", days: 7 };

  it("totals, average, strong days, change vs last week, best/weakest, streak change", () => {
    const s = weeklySnapshot(days, ["h1", "h2"], week2);
    expect(s).toMatchObject({
      total: 90 * 6 + 60,
      countedDays: 7,
      strongDays: 6,
      max: 700,
      previousAverage: 90,
      best: { habitId: "h1", ratio: 1 },
      weakest: { habitId: "h2", ratio: 6 / 7 },
      streakStart: 4,
      streakEnd: 10, // S S (6), W holds at risk, S S S S (10)
      streakState: "safe",
    });
    expect(s.average).toBeCloseTo(600 / 7);
    expect(s.change).toBeCloseTo(600 / 7 - 90);
  });

  it("first (short) week has no previous week", () => {
    const s = weeklySnapshot(days, ["h1", "h2"], {
      periodStart: "2026-10-01",
      periodEnd: "2026-10-04",
      days: 4,
    });
    expect(s).toMatchObject({
      days: 4,
      max: 400,
      previousAverage: null,
      change: null,
      streakStart: 0,
      streakEnd: 4,
    });
  });
});

describe("monthlySnapshot", () => {
  it("chapter totals, best streak in chapter, habit totals, weekday pattern (R10)", () => {
    const days = twoHabitDays("SSSSSWWSSSKSS");
    const s = monthlySnapshot(days, ["h1", "h2"], {
      index: 1,
      periodStart: "2026-10-01",
      periodEnd: "2026-10-31",
      days: 31,
    });
    expect(s).toMatchObject({ max: 3100, countedDays: 12, strongDays: 10, bestStreak: 5 });
    expect(s.habits.find((h) => h.habitId === "h2")).toMatchObject({
      done: 10,
      missed: 2,
      ratio: 10 / 12,
    });
    // Tuesdays (6 Oct weak, 13 Oct strong) average 75; the other 10 counted days average 87.
    expect(s.pattern).toEqual({ weekday: 2, average: 75, othersAverage: 87, gap: 12 });
  });
});

describe("body checks", () => {
  const m = (weightKg: number | null, energy: number | null) => ({
    weightKg,
    waistCm: null,
    pushupsMax: 20,
    energy,
  });

  it("delta per metric; 'Not logged' (null) when either side is missing", () => {
    expect(bodyCheckDelta(m(78.5, 6), m(77.2, 7))).toEqual({
      weightKg: -1.3,
      waistCm: null,
      pushupsMax: 0,
      energy: 1,
    });
    expect(bodyCheckDelta(m(78, 6), null)).toEqual({
      weightKg: null,
      waistCm: null,
      pushupsMax: null,
      energy: null,
    });
  });

  it("baseline = latest check on or before the chapter start", () => {
    const checks = [{ date: "2026-10-01" }, { date: "2026-11-01" }, { date: "2026-11-03" }];
    expect(baselineCheck(checks, "2026-11-01")?.date).toBe("2026-11-01");
    expect(baselineCheck(checks, "2026-10-15")?.date).toBe("2026-10-01");
    expect(baselineCheck(checks, "2026-09-30")).toBeNull();
  });
});
