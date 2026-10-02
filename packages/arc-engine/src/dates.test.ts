import { describe, expect, it } from "vitest";
import {
  addDays,
  diffDays,
  eachDay,
  maxDate,
  minDate,
  monthEnd,
  weekStart,
  weekday,
} from "./dates";

describe("dates", () => {
  it("adds days across month and year ends", () => {
    expect(addDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-10-01", 91)).toBe("2026-12-31");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  });

  it("is not shifted by DST changes", () => {
    // EU and US clocks change on these dates; calendar maths must ignore that.
    expect(addDays("2026-10-25", 1)).toBe("2026-10-26");
    expect(addDays("2026-11-01", 1)).toBe("2026-11-02");
    expect(diffDays("2026-11-02", "2026-10-31")).toBe(2);
  });

  it("E19: handles leap years", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2027-02-28", 1)).toBe("2027-03-01");
    expect(monthEnd("2028-02-10")).toBe("2028-02-29");
    expect(monthEnd("2026-11-15")).toBe("2026-11-30");
  });

  it("diffDays is signed", () => {
    expect(diffDays("2026-10-23", "2026-10-01")).toBe(22);
    expect(diffDays("2026-10-01", "2026-10-23")).toBe(-22);
  });

  it("weekday uses 0 = Sunday", () => {
    expect(weekday("2026-10-04")).toBe(0);
    expect(weekday("2026-10-05")).toBe(1);
  });

  it("weeks start on Monday", () => {
    expect(weekStart("2026-10-04")).toBe("2026-09-28"); // Sunday → previous Monday
    expect(weekStart("2026-10-05")).toBe("2026-10-05");
    expect(weekStart("2026-10-07")).toBe("2026-10-05");
  });

  it("eachDay is inclusive and empty for reversed ranges", () => {
    expect(eachDay("2026-10-30", "2026-11-02")).toEqual([
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
    ]);
    expect(eachDay("2026-10-02", "2026-10-01")).toEqual([]);
  });

  it("min/max compare ISO dates", () => {
    expect(minDate("2026-10-01", "2026-09-30")).toBe("2026-09-30");
    expect(maxDate("2026-10-01", "2026-09-30")).toBe("2026-10-01");
  });

  it("rejects malformed dates", () => {
    expect(() => addDays("2026-1-1", 1)).toThrow(RangeError);
  });
});
