import { describe, expect, it } from "vitest";
import {
  canAddHabit,
  canChangeHabitList,
  clampHabitName,
  isHabitFieldEditable,
  isValidDuration,
  isValidStartDate,
  isValidThreshold,
  lockDate,
  plannedEndDate,
  startDateOptions,
  validateHabitDraft,
  validateHabitList,
  validateMyWhy,
} from "./setup";
import { WINTER_ARC_TEMPLATE, type HabitDraft } from "./templates";
import { instantAt } from "./timezone";

const tz = "Asia/Kolkata";
const byName = (name: string) => {
  const d = WINTER_ARC_TEMPLATE.find((h) => h.name === name);
  if (!d) throw new Error(name);
  return d;
};
const fields = (d: HabitDraft) => validateHabitDraft(d).map((i) => i.field);

describe("habit list (TC02, TC03)", () => {
  it("TC02: fewer than 3 habits is blocked with 'Add at least 3 habits'", () => {
    expect(validateHabitList(2)).toEqual({ kind: "too_few", message: "Add at least 3 habits" });
    expect(validateHabitList(3)).toBeNull();
  });

  it("TC03: Add button hides at 10", () => {
    expect(canAddHabit(9)).toBe(true);
    expect(canAddHabit(10)).toBe(false);
    expect(validateHabitList(11)?.kind).toBe("too_many");
  });
});

describe("habit drafts", () => {
  it("every default template habit is valid", () => {
    for (const d of WINTER_ARC_TEMPLATE) expect(validateHabitDraft(d)).toEqual([]);
  });

  it("TC04: names stop at 30 characters", () => {
    expect(clampHabitName("x".repeat(31))).toHaveLength(30);
    expect(clampHabitName("Read")).toBe("Read");
    expect(fields({ ...byName("No Junk"), name: "x".repeat(31) })).toEqual(["name"]);
    expect(fields({ ...byName("No Junk"), name: "   " })).toEqual(["name"]);
  });

  it("count: target, minimum below target, step, unit", () => {
    const water = byName("3L Water") as Extract<HabitDraft, { type: "count" }>;
    expect(fields({ ...water, target: 0 })).toContain("target");
    expect(fields({ ...water, minimum: 3000 })).toEqual(["minimum"]);
    expect(fields({ ...water, minimum: null })).toEqual([]);
    expect(fields({ ...water, step: 0 })).toEqual(["step"]);
    expect(fields({ ...water, unit: " " })).toEqual(["unit"]);
  });

  it("checklist: 1–10 items, minimum below items", () => {
    const top3 = byName("Top 3 Tasks Done") as Extract<HabitDraft, { type: "checklist" }>;
    expect(fields({ ...top3, items: 0 })).toContain("items");
    expect(fields({ ...top3, items: 11 })).toContain("items");
    expect(fields({ ...top3, minimum: 3 })).toEqual(["minimum"]);
    expect(fields({ ...top3, minimum: null })).toEqual([]);
  });

  it("time: minimum must be later than target on the night clock", () => {
    const phone = byName("Phone Off by 12 AM") as Extract<HabitDraft, { type: "time" }>;
    expect(fields({ ...phone, minimum: "23:30" })).toEqual(["minimum"]); // earlier than 00:00
    expect(fields({ ...phone, minimum: "00:00" })).toEqual(["minimum"]);
    expect(fields({ ...phone, minimum: "01:00" })).toEqual([]);
    expect(fields({ ...phone, minimum: null })).toEqual([]);
  });

  it("yes/no and session with a minimum need its description", () => {
    expect(fields({ ...byName("Skin Care"), minimumText: "" })).toEqual(["minimumText"]);
    expect(fields({ ...byName("MMA Training"), minimumText: null })).toEqual(["minimumText"]);
    expect(fields(byName("No P"))).toEqual([]); // no minimum
  });

  it("schedule: weekdays need a day; per-week is 1–6", () => {
    const mma = byName("MMA Training");
    expect(fields({ ...mma, schedule: { kind: "weekdays", days: [] } })).toEqual(["schedule"]);
    expect(fields({ ...mma, schedule: { kind: "perWeek", times: 7 } })).toEqual(["schedule"]);
    expect(fields({ ...mma, schedule: { kind: "perWeek", times: 4 } })).toEqual([]);
  });
});

describe("My Why (TC05)", () => {
  it("is required with at least 10 characters", () => {
    expect(validateMyWhy("")).toBe("Write at least 10 characters");
    expect(validateMyWhy("  short  ")).toBe("Write at least 10 characters");
    expect(validateMyWhy("Never miss two.")).toBeNull();
  });

  it("allows up to 3 lines and 240 characters", () => {
    expect(validateMyWhy("one line\ntwo line\nthree line")).toBeNull();
    expect(validateMyWhy("one line\ntwo line\nthree line\nfour")).toBe("Keep it to 3 lines");
    expect(validateMyWhy("x".repeat(241))).toBe("Keep it under 240 characters");
  });
});

describe("dates, length, threshold", () => {
  it("start options: today or the next 1st", () => {
    expect(startDateOptions(instantAt("2026-10-23", "15:00", tz), tz)).toEqual({
      today: "2026-10-23",
      nextMonthStart: "2026-11-01",
    });
    expect(startDateOptions(instantAt("2026-12-15", "09:00", tz), tz).nextMonthStart).toBe(
      "2027-01-01",
    );
    expect(startDateOptions(instantAt("2026-11-01", "09:00", tz), tz)).toEqual({
      today: "2026-11-01",
      nextMonthStart: "2026-11-01",
    });
  });

  it("start date can't be in the past", () => {
    const now = instantAt("2026-10-23", "15:00", tz);
    expect(isValidStartDate("2026-10-23", now, tz)).toBe(true);
    expect(isValidStartDate("2026-11-01", now, tz)).toBe(true);
    expect(isValidStartDate("2026-10-22", now, tz)).toBe(false);
    expect(isValidStartDate("not-a-date", now, tz)).toBe(false);
  });

  it("durations 30, 60, 92; threshold 60–100", () => {
    expect([30, 60, 92, 45].map(isValidDuration)).toEqual([true, true, true, false]);
    expect([59, 60, 80, 100, 101, 80.5].map(isValidThreshold)).toEqual([
      false,
      true,
      true,
      true,
      false,
      false,
    ]);
  });

  it("planned end and lock dates", () => {
    expect(plannedEndDate("2026-11-01", 92)).toBe("2027-01-31");
    expect(lockDate("2026-10-01")).toBe("2026-10-03");
  });
});

describe("Day 3 lock (TC08)", () => {
  const arc = { startDate: "2026-10-01", durationDays: 92, timeZone: tz };

  it("before lock every field and the habit list are editable", () => {
    const now = instantAt("2026-10-03", "20:00", tz);
    expect(isHabitFieldEditable("target", arc, now)).toBe(true);
    expect(isHabitFieldEditable("type", arc, now)).toBe(true);
    expect(canChangeHabitList(arc, now)).toBe(true);
  });

  it("TC08: Day 4 — target disabled, rename and reminder allowed", () => {
    const now = instantAt("2026-10-04", "09:00", tz);
    expect(isHabitFieldEditable("target", arc, now)).toBe(false);
    expect(isHabitFieldEditable("schedule", arc, now)).toBe(false);
    expect(isHabitFieldEditable("type", arc, now)).toBe(false);
    expect(isHabitFieldEditable("name", arc, now)).toBe(true);
    expect(isHabitFieldEditable("reminderTime", arc, now)).toBe(true);
    expect(canChangeHabitList(arc, now)).toBe(false);
  });
});
