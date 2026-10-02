import { describe, expect, it } from "vitest";
import { insightCopy } from "./insight-copy";

describe("insightCopy", () => {
  it("weakest habit with trend (MASTER_DOC example)", () => {
    expect(
      insightCopy({
        kind: "weakest_habit",
        habitId: "h6",
        name: "Read 10 Pages",
        ratio: 0.48,
        change: -0.09,
      }).body,
    ).toBe("Read 10 Pages is at 48%, down 9 points from last week.");
    expect(
      insightCopy({ kind: "weakest_habit", habitId: "h6", name: "Read", ratio: 0.5, change: 0.01 })
        .body,
    ).toBe("Read is at 50%, up 1 point from last week.");
    expect(
      insightCopy({ kind: "weakest_habit", habitId: "h6", name: "Read", ratio: 0.5, change: null })
        .body,
    ).toBe("Read is at 50%.");
  });

  it("day of week (MASTER_DOC example)", () => {
    expect(
      insightCopy({
        kind: "day_of_week",
        weekday: "Saturday",
        average: 61,
        othersAverage: 83,
        gap: 22,
      }).body,
    ).toBe("Your Saturday average is 61, 22 below your other days.");
  });

  it("minimum overuse (MASTER_DOC example)", () => {
    expect(
      insightCopy({
        kind: "minimum_overuse",
        habitId: "h6",
        name: "Read 10 Pages",
        minimum: 9,
        of: 14,
      }).body,
    ).toBe("Read 10 Pages was Minimum 9 of 14 days. Consider a reachable target next chapter.");
  });

  it("streak risk", () => {
    expect(insightCopy({ kind: "streak_risk", threshold: 80, habitsNeeded: 1 }).body).toBe(
      "Score 80 to stay safe: 1 more habit.",
    );
    expect(insightCopy({ kind: "streak_risk", threshold: 80, habitsNeeded: null }).body).toBe(
      "Score 80 to stay safe.",
    );
  });
});
