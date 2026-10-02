import { describe, expect, it } from "vitest";
import { defaultHabits, habit } from "./__fixtures__/habits";
import { habitOn, isScheduled, perWeekRestEligible } from "./schedule";
import type { Habit, HabitVersion } from "./types";

const water = habit("3L Water");
const mma = habit("MMA Training");

describe("isScheduled", () => {
  it("daily habits are scheduled every day", () => {
    expect(isScheduled(water, "2026-10-04")).toBe(true);
  });

  it("TC18: MMA Training is not scheduled on Sunday (Rest)", () => {
    expect(isScheduled(mma, "2026-10-04")).toBe(false); // Sunday
    expect(isScheduled(mma, "2026-10-05")).toBe(true); // Monday
  });

  it("per-week habits are always scheduled (rest decided by R4)", () => {
    const gym: Habit = { ...mma, schedule: { kind: "perWeek", times: 4 } };
    expect(isScheduled(gym, "2026-10-04")).toBe(true);
  });
});

describe("perWeekRestEligible (R4: rest while you still can)", () => {
  const arc = { startDate: "2026-09-28", durationDays: 92 }; // starts Monday

  it("early days of the week can rest while the quota is reachable", () => {
    // 4×/week: Mon has 6 days left, Wed has 4 left.
    expect(perWeekRestEligible(4, "2026-09-28", 0, arc)).toBe(true);
    expect(perWeekRestEligible(4, "2026-09-30", 0, arc)).toBe(true);
  });

  it("a day becomes required once slack runs out", () => {
    // Thu with nothing done: 0 + 3 days left < 4
    expect(perWeekRestEligible(4, "2026-10-01", 0, arc)).toBe(false);
    // Thu with 1 done: 1 + 3 >= 4
    expect(perWeekRestEligible(4, "2026-10-01", 1, arc)).toBe(true);
    // Sunday needs the quota already met
    expect(perWeekRestEligible(4, "2026-10-04", 3, arc)).toBe(false);
    expect(perWeekRestEligible(4, "2026-10-04", 4, arc)).toBe(true);
  });

  it("caps the quota at the arc days in a partial first week", () => {
    // Arc starts Saturday 3 Oct: only Sat + Sun are in the arc that week, so quota = 2.
    const lateStart = { startDate: "2026-10-03", durationDays: 92 };
    expect(perWeekRestEligible(4, "2026-10-03", 0, lateStart)).toBe(false); // 0 + 1 < 2
    expect(perWeekRestEligible(1, "2026-10-03", 0, lateStart)).toBe(true); // 0 + 1 >= 1
  });

  it("caps the quota in a partial last week", () => {
    // Arc 2026-10-01 + 92 days ends Thu 31 Dec: Mon–Thu = 4 days in the last week.
    const oct = { startDate: "2026-10-01", durationDays: 92 };
    expect(perWeekRestEligible(5, "2026-12-28", 0, oct)).toBe(false); // quota 4, 0 + 3 < 4
    expect(perWeekRestEligible(5, "2026-12-29", 2, oct)).toBe(true); // 2 + 2 >= 4
  });
});

describe("habitOn (E7: versions)", () => {
  const v1: HabitVersion = { habitId: "h1", validFrom: "2026-10-01", habit: water };
  const v2: HabitVersion = {
    habitId: "h1",
    validFrom: "2026-11-01",
    habit: { ...(water as Extract<Habit, { type: "count" }>), target: 3500 },
  };

  it("returns the version valid on the date", () => {
    expect(habitOn([v2, v1], "2026-10-31")).toBe(water);
    expect(habitOn([v1, v2], "2026-11-01")).toMatchObject({ target: 3500 });
  });

  it("returns undefined before the first version", () => {
    expect(habitOn([v1], "2026-09-30")).toBeUndefined();
  });

  it("fixture sanity: 10 default habits", () => {
    expect(defaultHabits).toHaveLength(10);
  });
});
