import { describe, expect, it } from "vitest";
import { times } from "./__fixtures__/entries";
import {
  dayOfWeekPattern,
  insightsUnlocked,
  minimumOveruse,
  movingAverage,
  streakAtRisk,
  weakestHabit,
  type ScoredDay,
} from "./insights";
import { addDays } from "./dates";

describe("insights unlock (A13)", () => {
  it("TC43: Day 3 locked; unlocks on Day 7", () => {
    expect(insightsUnlocked(3)).toBe(false);
    expect(insightsUnlocked(6)).toBe(false);
    expect(insightsUnlocked(7)).toBe(true);
  });
});

describe("movingAverage", () => {
  it("trailing 7-day average, skipping sick days", () => {
    expect(movingAverage([70, 80, 90], 2)).toEqual([70, 75, 85]);
    expect(movingAverage([100, null, 80], 7)).toEqual([100, 100, 90]);
    expect(movingAverage([null], 7)).toEqual([null]);
  });
});

describe("weakestHabit", () => {
  it("picks the lowest completion this week and its change vs last week", () => {
    const result = weakestHabit([
      { habitId: "water", thisWeek: times(7, "done"), lastWeek: times(7, "done") },
      {
        habitId: "read",
        thisWeek: [...times(3, "done"), ...times(4, "missed")],
        lastWeek: [...times(4, "done"), ...times(3, "missed")],
      },
      { habitId: "steps", thisWeek: [...times(5, "done"), ...times(2, "missed")], lastWeek: [] },
    ]);
    expect(result?.habitId).toBe("read");
    expect(result?.ratio).toBeCloseTo(3 / 7);
    expect(result?.change).toBeCloseTo(3 / 7 - 4 / 7);
  });

  it("no previous week → change null; ties keep display order", () => {
    const result = weakestHabit([
      { habitId: "a", thisWeek: ["done", "missed"], lastWeek: [] },
      { habitId: "b", thisWeek: ["done", "missed"], lastWeek: [] },
    ]);
    expect(result).toEqual({ habitId: "a", ratio: 0.5, previous: null, change: null });
  });

  it("null when nothing counted or everything complete", () => {
    expect(weakestHabit([{ habitId: "a", thisWeek: ["sick"], lastWeek: [] }])).toBeNull();
    expect(weakestHabit([{ habitId: "a", thisWeek: ["done", "rest"], lastWeek: [] }])).toBeNull();
    expect(weakestHabit([])).toBeNull();
  });
});

describe("dayOfWeekPattern (R10)", () => {
  // 3 weeks from Mon 5 Oct 2026: weekdays 85, Saturdays 60.
  const days: ScoredDay[] = Array.from({ length: 21 }, (_, i) => {
    const date = addDays("2026-10-05", i);
    return { date, score: i % 7 === 5 ? 60 : 85, final: true };
  });

  it('"Your Saturday average is 60, 25 below the other days"', () => {
    expect(dayOfWeekPattern(days)).toEqual({ weekday: 6, average: 60, othersAverage: 85, gap: 25 });
  });

  it("needs a gap of at least 10 points", () => {
    const close = days.map((d) => (d.score === 60 ? { ...d, score: 80 } : d));
    expect(dayOfWeekPattern(close)).toBeNull();
    expect(dayOfWeekPattern(close, 5)?.gap).toBe(5);
  });

  it("needs at least 2 samples of the weekday; ignores open and sick days", () => {
    const oneSaturday = days.slice(0, 7);
    expect(dayOfWeekPattern(oneSaturday)).toBeNull();
    const withOpen = days.map((d) => (d.score === 60 ? { ...d, final: false } : d));
    expect(dayOfWeekPattern(withOpen)).toBeNull();
    expect(dayOfWeekPattern([{ date: "2026-10-05", score: null, final: true }])).toBeNull();
  });

  it("null when only one weekday has data", () => {
    const mondays = [0, 7, 14].map((i) => ({
      date: addDays("2026-10-05", i),
      score: 50,
      final: true,
    }));
    expect(dayOfWeekPattern(mondays)).toBeNull();
  });
});

describe("minimumOveruse (R11)", () => {
  it('"Read 10 Pages was Minimum 9 of 14 days"', () => {
    const statuses = [...times(5, "done"), ...times(9, "minimum")];
    expect(minimumOveruse(statuses)).toEqual({ minimum: 9, of: 14 });
  });

  it("only the last 14 scheduled days; rest, sick and pending skipped", () => {
    const old = times(10, "minimum");
    const recent = [
      ...times(10, "done"),
      "rest",
      "sick",
      "unlogged",
      ...times(4, "minimum"),
    ] as const;
    expect(minimumOveruse([...old, ...recent])).toBeNull(); // last 14 scheduled: 10 done + 4 min
  });

  it("needs 7 samples and a 50% share", () => {
    expect(minimumOveruse(times(6, "minimum"))).toBeNull();
    expect(minimumOveruse([...times(4, "minimum"), ...times(4, "done")])).toEqual({
      minimum: 4,
      of: 8,
    });
    expect(minimumOveruse([...times(3, "minimum"), ...times(5, "done")])).toBeNull();
  });
});

describe("streakAtRisk", () => {
  it("only when at risk and today isn't strong yet", () => {
    expect(streakAtRisk("at_risk", false)).toBe(true);
    expect(streakAtRisk("at_risk", true)).toBe(false);
    expect(streakAtRisk("safe", false)).toBe(false);
  });
});
