import { describe, expect, it } from "vitest";
import { times } from "./__fixtures__/entries";
import { habitCompletion } from "./completion";

describe("habitCompletion", () => {
  it("TC44: 10 scheduled days: 6 Done, 2 Minimum, 2 Missed = 70%", () => {
    const c = habitCompletion([...times(6, "done"), ...times(2, "minimum"), ...times(2, "missed")]);
    expect(c.ratio).toBeCloseTo(0.7);
    expect(c).toMatchObject({ done: 6, minimum: 2, missed: 2, rest: 0, counted: 10 });
  });

  it("Rest counts as complete", () => {
    expect(habitCompletion(["done", "rest", "missed", "missed"]).ratio).toBe(0.5);
  });

  it("A3: sick and pending days are excluded", () => {
    const c = habitCompletion(["done", "sick", "unlogged"]);
    expect(c).toMatchObject({ ratio: 1, counted: 1 });
  });

  it("no counted days has no ratio", () => {
    expect(habitCompletion(["sick"]).ratio).toBeNull();
    expect(habitCompletion([]).ratio).toBeNull();
  });
});
