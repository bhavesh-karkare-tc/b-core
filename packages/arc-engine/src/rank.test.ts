import { describe, expect, it } from "vitest";
import { maxRank, nextRank, rankFor, rankThresholds } from "./rank";

describe("ranks (92-day arc)", () => {
  it("rank boundaries", () => {
    const cases: [number, string][] = [
      [0, "Recruit"],
      [999, "Recruit"],
      [1000, "Fighter"],
      [2499, "Fighter"],
      [2500, "Contender"],
      [4499, "Contender"],
      [4500, "Warrior"],
      [6499, "Warrior"],
      [6500, "Champion"],
      [7999, "Champion"],
      [8000, "Legend"],
      [9200, "Legend"],
    ];
    for (const [points, rank] of cases) expect(rankFor(points)).toBe(rank);
  });

  it("TC38 (logic): passing 1,000 arc points reaches Fighter", () => {
    expect(rankFor(1001)).toBe("Fighter");
  });

  it('shows points to next rank, e.g. "420 points to Contender"', () => {
    expect(nextRank(2080)).toEqual({ name: "Contender", points: 2500, remaining: 420 });
    expect(nextRank(0)).toEqual({ name: "Fighter", points: 1000, remaining: 1000 });
  });

  it("Legend has no next rank", () => {
    expect(nextRank(8000)).toBeNull();
  });
});

describe("rank scaling (A5)", () => {
  it("scales linearly for 30 and 60 days, rounded to 10", () => {
    expect(rankThresholds(60).map((t) => t.points)).toEqual([0, 650, 1630, 2930, 4240, 5220]);
    expect(rankThresholds(30).map((t) => t.points)).toEqual([0, 330, 820, 1470, 2120, 2610]);
  });

  it("92 days is unscaled", () => {
    expect(rankThresholds().map((t) => t.points)).toEqual([0, 1000, 2500, 4500, 6500, 8000]);
  });

  it("uses the scaled thresholds for a 30-day arc", () => {
    expect(rankFor(330, 30)).toBe("Fighter");
    expect(nextRank(330, 30)).toEqual({ name: "Contender", points: 820, remaining: 490 });
  });
});

describe("maxRank", () => {
  it("rank never goes down", () => {
    expect(maxRank("Warrior", "Contender")).toBe("Warrior");
    expect(maxRank("Fighter", "Champion")).toBe("Champion");
    expect(maxRank("Legend", "Legend")).toBe("Legend");
  });
});
