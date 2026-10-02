import { describe, expect, it } from "vitest";
import { clockMinutes, instantAt, localDate, localTime, nightMinutes } from "./timezone";

describe("timezone", () => {
  const instant = new Date("2026-10-02T06:30:00Z");

  it("localDate depends on the arc timezone (UTC-8 to UTC+10)", () => {
    expect(localDate(instant, "UTC")).toBe("2026-10-02");
    expect(localDate(instant, "America/Los_Angeles")).toBe("2026-10-01"); // 23:30 previous day
    expect(localDate(instant, "Australia/Brisbane")).toBe("2026-10-02"); // 16:30
    expect(localDate(instant, "Asia/Kolkata")).toBe("2026-10-02"); // 12:00
  });

  it("localTime returns the wall clock", () => {
    expect(localTime(instant, "Asia/Kolkata")).toBe("12:00");
    expect(localTime(instant, "America/Los_Angeles")).toBe("23:30");
  });

  it("instantAt converts a wall-clock time to an instant", () => {
    expect(instantAt("2026-10-02", "12:00", "Asia/Kolkata").toISOString()).toBe(
      "2026-10-02T06:30:00.000Z",
    );
    expect(instantAt("2026-10-02", "12:00", "UTC").toISOString()).toBe("2026-10-02T12:00:00.000Z");
  });

  it("instantAt respects DST", () => {
    // Sydney moves to UTC+11 on 4 Oct 2026; Los Angeles back to UTC-8 on 1 Nov 2026.
    expect(instantAt("2026-10-03", "12:00", "Australia/Sydney").toISOString()).toBe(
      "2026-10-03T02:00:00.000Z",
    );
    expect(instantAt("2026-10-05", "12:00", "Australia/Sydney").toISOString()).toBe(
      "2026-10-05T01:00:00.000Z",
    );
    expect(instantAt("2026-10-31", "12:00", "America/Los_Angeles").toISOString()).toBe(
      "2026-10-31T19:00:00.000Z",
    );
    expect(instantAt("2026-11-02", "12:00", "America/Los_Angeles").toISOString()).toBe(
      "2026-11-02T20:00:00.000Z",
    );
  });

  it("clockMinutes parses HH:mm and rejects bad input", () => {
    expect(clockMinutes("00:00")).toBe(0);
    expect(clockMinutes("23:59")).toBe(1439);
    expect(() => clockMinutes("24:00")).toThrow(RangeError);
    expect(() => clockMinutes("9:00")).toThrow(RangeError);
  });

  it("nightMinutes orders bedtimes across midnight (A1)", () => {
    expect(nightMinutes("23:50")).toBeLessThan(nightMinutes("00:00"));
    expect(nightMinutes("00:00")).toBeLessThan(nightMinutes("00:30"));
    expect(nightMinutes("00:30")).toBeLessThan(nightMinutes("01:10"));
    expect(nightMinutes("11:59")).toBe(2159);
    expect(nightMinutes("12:00")).toBe(720);
  });
});
