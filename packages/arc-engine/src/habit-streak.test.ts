import { describe, expect, it } from "vitest";
import { times } from "./__fixtures__/entries";
import { computeHabitStreak } from "./habit-streak";

describe("habit streak", () => {
  it("TC37: Done Mon to Sat, Rest Sun, Done Mon → MMA streak 7 (Rest holds)", () => {
    expect(computeHabitStreak([...times(6, "done"), "rest", "done"])).toEqual({
      current: 7,
      best: 7,
      atRisk: false,
    });
  });

  it("Minimum counts like Done", () => {
    expect(computeHabitStreak(["done", "minimum", "minimum"]).current).toBe(3);
  });

  it("one Missed puts it at risk and holds", () => {
    expect(computeHabitStreak(["done", "done", "missed"])).toEqual({
      current: 2,
      best: 2,
      atRisk: true,
    });
  });

  it("a Done after one Missed continues the streak", () => {
    expect(computeHabitStreak(["done", "done", "missed", "done"])).toEqual({
      current: 3,
      best: 3,
      atRisk: false,
    });
  });

  it("two Missed in a row reset it; best is kept", () => {
    expect(computeHabitStreak(["done", "done", "done", "missed", "missed"])).toEqual({
      current: 0,
      best: 3,
      atRisk: false,
    });
  });

  it("A2: Rest and Sick between two Missed do not split them", () => {
    expect(computeHabitStreak(["done", "missed", "rest", "missed"]).current).toBe(0);
    expect(computeHabitStreak(["done", "missed", "sick", "missed"]).current).toBe(0);
  });

  it("pending (unlogged) today does not change the streak", () => {
    expect(computeHabitStreak(["done", "done", "unlogged"])).toEqual({
      current: 2,
      best: 2,
      atRisk: false,
    });
  });

  it("empty history is zero", () => {
    expect(computeHabitStreak([])).toEqual({ current: 0, best: 0, atRisk: false });
  });
});
