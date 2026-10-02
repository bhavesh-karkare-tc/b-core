import { describe, expect, it } from "vitest";
import { sickDayAllowance, sickDaysRemaining } from "./sick";

describe("sick days", () => {
  it("3 per 92-day arc, scaled 1 per 30 days (A4)", () => {
    expect(sickDayAllowance(92)).toBe(3);
    expect(sickDayAllowance(60)).toBe(2);
    expect(sickDayAllowance(30)).toBe(1);
  });

  it("TC24 / E9: remaining hits 0 after the allowance is used", () => {
    expect(sickDaysRemaining(92, 2)).toBe(1);
    expect(sickDaysRemaining(92, 3)).toBe(0);
    expect(sickDaysRemaining(92, 4)).toBe(0);
  });
});
