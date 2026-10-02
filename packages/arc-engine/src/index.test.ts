import { describe, expect, it } from "vitest";
import { ARC_DEFAULT_DAYS, POINTS } from "./index";

describe("arc-engine", () => {
  it("default arc is 92 days (1 Oct to 31 Dec)", () => {
    expect(ARC_DEFAULT_DAYS).toBe(92);
  });

  it("points per status match MASTER_DOC §8", () => {
    expect(POINTS).toEqual({ done: 10, minimum: 5, rest: 10, missed: 0, unlogged: 0, sick: null });
  });
});
