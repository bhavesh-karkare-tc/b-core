import { describe, expect, it } from "vitest";
import {
  canChangeThreshold,
  canUseSickDay,
  cutoffInstant,
  editWindow,
  hasArcStarted,
  isArcComplete,
  isArcLocked,
  isEditable,
  isFinal,
  timeUntilCutoff,
} from "./cutoff";
import { instantAt } from "./timezone";

const tz = "Asia/Kolkata";
const arc = { startDate: "2026-10-01", durationDays: 92, timeZone: tz, sickDaysUsed: 0 };
const at = (date: string, time: string, zone = tz) => instantAt(date, time, zone);

describe("cutoff", () => {
  it("a day closes at 12:00 noon the next day in the arc timezone", () => {
    expect(cutoffInstant("2026-10-22", tz).toISOString()).toBe("2026-10-23T06:30:00.000Z");
  });

  it("TC20: yesterday at 10:00 is still editable", () => {
    expect(isEditable("2026-10-22", at("2026-10-23", "10:00"), arc)).toBe(true);
    expect(timeUntilCutoff("2026-10-22", at("2026-10-23", "10:00"), tz)).toBe(2 * 60 * 60 * 1000);
  });

  it("TC21: yesterday at 12:05 is read-only", () => {
    expect(editWindow("2026-10-22", at("2026-10-23", "12:05"), arc)).toEqual({
      editable: false,
      reason: "closed",
    });
    expect(timeUntilCutoff("2026-10-22", at("2026-10-23", "12:05"), tz)).toBe(0);
  });

  it("closes exactly at noon", () => {
    expect(isFinal("2026-10-22", at("2026-10-23", "11:59"), tz)).toBe(false);
    expect(isFinal("2026-10-22", at("2026-10-23", "12:00"), tz)).toBe(true);
  });

  it("today is editable and reports when it closes", () => {
    expect(editWindow("2026-10-23", at("2026-10-23", "21:00"), arc)).toEqual({
      editable: true,
      closesAt: at("2026-10-24", "12:00"),
    });
  });

  it("older days, future days and days outside the arc are not editable", () => {
    const now = at("2026-10-23", "10:00");
    expect(editWindow("2026-10-21", now, arc)).toMatchObject({ reason: "closed" });
    expect(editWindow("2026-10-24", now, arc)).toMatchObject({ reason: "future" });
    expect(editWindow("2026-09-30", now, arc)).toMatchObject({ reason: "before_start" });
    expect(editWindow("2027-01-01", now, arc)).toMatchObject({ reason: "after_end" });
  });

  it("cutoff follows DST in UTC-8 to UTC+11 zones", () => {
    // Sydney switches to UTC+11 on Sun 4 Oct 2026.
    expect(cutoffInstant("2026-10-03", "Australia/Sydney").toISOString()).toBe(
      "2026-10-04T01:00:00.000Z",
    );
    expect(cutoffInstant("2026-10-02", "Australia/Sydney").toISOString()).toBe(
      "2026-10-03T02:00:00.000Z",
    );
    // Los Angeles switches to UTC-8 on Sun 1 Nov 2026.
    expect(cutoffInstant("2026-10-31", "America/Los_Angeles").toISOString()).toBe(
      "2026-11-01T20:00:00.000Z",
    );
    expect(cutoffInstant("2026-10-30", "America/Los_Angeles").toISOString()).toBe(
      "2026-10-31T19:00:00.000Z",
    );
  });
});

describe("arc start, lock and completion", () => {
  it("TC06: future start date → not started, Day 1 not editable yet", () => {
    const tomorrowStart = { ...arc, startDate: "2026-10-03" };
    const now = at("2026-10-02", "18:00");
    expect(hasArcStarted(tomorrowStart, now)).toBe(false);
    expect(editWindow("2026-10-03", now, tomorrowStart)).toMatchObject({ reason: "future" });
    expect(hasArcStarted(tomorrowStart, at("2026-10-03", "00:00"))).toBe(true);
  });

  it("TC08: habits lock after the end of Day 3", () => {
    expect(isArcLocked(arc, at("2026-10-03", "23:59"))).toBe(false);
    expect(isArcLocked(arc, at("2026-10-04", "00:00"))).toBe(true);
    expect(isArcLocked(arc, at("2026-10-04", "09:00"))).toBe(true); // Day 4
  });

  it("E18: threshold can change only before lock", () => {
    expect(canChangeThreshold(arc, at("2026-10-02", "12:00"))).toBe(true);
    expect(canChangeThreshold(arc, at("2026-10-05", "12:00"))).toBe(false);
  });

  it("E17: the arc completes at the Day 92 cutoff", () => {
    expect(isArcComplete(arc, at("2027-01-01", "11:59"))).toBe(false);
    expect(isArcComplete(arc, at("2027-01-01", "12:00"))).toBe(true);
  });
});

describe("sick day eligibility", () => {
  const now = at("2026-10-23", "10:00");

  it("TC23: allowed on an editable day with allowance left", () => {
    expect(canUseSickDay(arc, "2026-10-23", now, false)).toEqual({ allowed: true });
    expect(canUseSickDay(arc, "2026-10-22", now, false)).toEqual({ allowed: true }); // before cutoff
  });

  it("E10: not allowed once the day passed cutoff", () => {
    expect(canUseSickDay(arc, "2026-10-21", now, false)).toEqual({
      allowed: false,
      reason: "not_editable",
    });
  });

  it("TC24 / E9: hidden once all sick days are used", () => {
    expect(canUseSickDay({ ...arc, sickDaysUsed: 3 }, "2026-10-23", now, false)).toEqual({
      allowed: false,
      reason: "no_days_left",
    });
  });

  it("cannot mark the same day sick twice", () => {
    expect(canUseSickDay(arc, "2026-10-23", now, true)).toEqual({
      allowed: false,
      reason: "already_sick",
    });
  });
});
