import { describe, expect, it } from "vitest";
import { ARC_DEFAULT_DAYS } from "./index";

describe("arc-engine", () => {
  it("default arc is 92 days (1 Oct to 31 Dec)", () => {
    expect(ARC_DEFAULT_DAYS).toBe(92);
  });
});
