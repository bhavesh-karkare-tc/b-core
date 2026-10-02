import { describe, expect, it } from "vitest";
import { countWord, dayLabel, shortDate, timeLeft } from "./format";

describe("format", () => {
  it("dayLabel matches the mockup eyebrow", () => {
    expect(dayLabel("2026-10-23")).toBe("FRI 23 OCT");
  });

  it("shortDate", () => {
    expect(shortDate("2026-11-01")).toBe("Sun 1 Nov");
  });

  it("countWord", () => {
    expect(countWord(5)).toBe("Five");
    expect(countWord(12)).toBe("12");
  });

  it("timeLeft", () => {
    expect(timeLeft(3 * 60 * 60 * 1000)).toBe("3h left");
    expect(timeLeft(45 * 60 * 1000)).toBe("45m left");
    expect(timeLeft(-5)).toBe("0m left");
  });
});
