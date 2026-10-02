import { describe, expect, it } from "vitest";
import { entry, habit } from "./__fixtures__/habits";
import { resolveEntry, type ResolveInput } from "./status";
import type { Habit, HabitEntry } from "./types";

const D = "2026-10-23";
const water = habit("3L Water");
const phoneOff = habit("Phone Off by 12 AM");
const mma = habit("MMA Training");
const read = habit("Read 10 Pages");
const top3 = habit("Top 3 Tasks Done");
const noJunk = habit("No Junk");
const noP = habit("No P");

function resolve(h: Habit, e: Partial<HabitEntry> | undefined, opts: Partial<ResolveInput> = {}) {
  return resolveEntry({
    habit: h,
    entry: e ? entry(h.id, D, e) : undefined,
    final: false,
    isSick: false,
    restDay: false,
    ...opts,
  });
}

describe("count habits", () => {
  it("TC12: 12 × 250 ml = 3000 ml is auto Done", () => {
    const r = resolve(water, { value: 12 * 250 });
    expect(r).toMatchObject({ status: "done", points: 10, provisional: false });
  });

  it("TC13: 2,400 ml at cutoff is Minimum (5 points)", () => {
    expect(resolve(water, { value: 2400 }, { final: true })).toMatchObject({
      status: "minimum",
      points: 5,
      provisional: false,
    });
  });

  it("R3: 2,400 ml before cutoff is a provisional Minimum", () => {
    expect(resolve(water, { value: 2400 })).toMatchObject({
      status: "minimum",
      points: 5,
      provisional: true,
    });
  });

  it("TC14: 1,500 ml at cutoff is Missed", () => {
    expect(resolve(water, { value: 1500 }, { final: true })).toMatchObject({
      status: "missed",
      points: 0,
    });
  });

  it("a count entry with no value yet is pending, then Missed", () => {
    expect(resolve(water, { value: null }).status).toBe("unlogged");
    expect(resolve(water, { value: null }, { final: true }).status).toBe("missed");
  });

  it("below minimum before cutoff stays pending", () => {
    expect(resolve(water, { value: 1500 })).toMatchObject({
      status: "unlogged",
      provisional: true,
    });
  });

  it("E12: above target is Done with no extra points", () => {
    expect(resolve(water, { value: 4500 })).toMatchObject({ status: "done", points: 10 });
  });

  it("count without a minimum: below target is Missed at cutoff", () => {
    const strict: Habit = { ...(water as Extract<Habit, { type: "count" }>), minimum: null };
    expect(resolve(strict, { value: 2900 }, { final: true }).status).toBe("missed");
  });

  it("explicit Missed overrides the value", () => {
    expect(resolve(read, { value: 5, status: "missed" }).status).toBe("missed");
  });
});

describe("time habits (night clock, A1)", () => {
  it("TC15: Phone Off at 23:50 is Done", () => {
    expect(resolve(phoneOff, { loggedTime: "23:50" }).status).toBe("done");
  });

  it("Phone Off exactly at 00:00 is Done", () => {
    expect(resolve(phoneOff, { loggedTime: "00:00" }).status).toBe("done");
  });

  it("TC16: Phone Off at 00:20 is Minimum (within 12:30 AM)", () => {
    expect(resolve(phoneOff, { loggedTime: "00:20" })).toMatchObject({
      status: "minimum",
      points: 5,
      provisional: false,
    });
  });

  it("TC17: Phone Off at 01:10 is Missed", () => {
    expect(resolve(phoneOff, { loggedTime: "01:10" })).toMatchObject({
      status: "missed",
      points: 0,
    });
  });

  it("time habit without a minimum: late is Missed", () => {
    const strict: Habit = { ...(phoneOff as Extract<Habit, { type: "time" }>), minimum: null };
    expect(resolve(strict, { loggedTime: "00:20" }).status).toBe("missed");
  });

  it("E13: time habit with no log by cutoff is Missed", () => {
    expect(resolve(phoneOff, { loggedTime: null }, { final: true }).status).toBe("missed");
    expect(resolve(phoneOff, { loggedTime: null }).status).toBe("unlogged");
  });
});

describe("checklist habits", () => {
  it("Done when all items are ticked", () => {
    expect(resolve(top3, { value: 3 }).status).toBe("done");
  });

  it("E14: at the minimum count is Minimum", () => {
    expect(resolve(top3, { value: 1 }, { final: true }).status).toBe("minimum");
  });

  it("E14: below the minimum count is Missed at cutoff", () => {
    expect(resolve(top3, { value: 0 }, { final: true }).status).toBe("missed");
  });
});

describe("yes/no and session habits", () => {
  it("TC11: tapping No Junk logs Done", () => {
    expect(resolve(noJunk, { status: "done" })).toMatchObject({ status: "done", points: 10 });
  });

  it("Minimum from the status sheet", () => {
    expect(resolve(noJunk, { status: "minimum" })).toMatchObject({
      status: "minimum",
      points: 5,
      provisional: false,
    });
    expect(resolve(mma, { status: "minimum" }, {}).status).toBe("minimum");
  });

  it("TC19: a no-minimum habit can only be Done or Missed", () => {
    expect(resolve(noP, { status: "minimum" }).status).toBe("missed");
    expect(resolve(noP, { status: "done" }).status).toBe("done");
  });

  it("a session marked Done is Done", () => {
    expect(resolve(mma, { status: "done", durationMin: 60 }).status).toBe("done");
  });

  it("an entry left unlogged stays pending", () => {
    expect(resolve(noJunk, { status: "unlogged" }).status).toBe("unlogged");
  });
});

describe("cutoff, rest, sick, paused", () => {
  it("TC22: unlogged at cutoff becomes Missed", () => {
    expect(resolve(read, undefined, { final: true })).toMatchObject({
      status: "missed",
      points: 0,
      provisional: false,
    });
  });

  it("unlogged before cutoff is pending with 0 points", () => {
    expect(resolve(read, undefined)).toMatchObject({
      status: "unlogged",
      points: 0,
      provisional: true,
    });
  });

  it("TC18: rest day is Rest with 10 points and ignores any entry", () => {
    expect(resolve(mma, { status: "done" }, { restDay: true })).toMatchObject({
      status: "rest",
      points: 10,
      provisional: false,
    });
  });

  it("TC23: sick day makes every habit Sick and not counted", () => {
    expect(resolve(water, { value: 3000 }, { isSick: true })).toMatchObject({
      status: "sick",
      points: null,
    });
  });

  it("E6: paused habit is Rest, labelled paused", () => {
    const paused: Habit = { ...read, status: "paused" };
    expect(resolve(paused, undefined, { final: true })).toMatchObject({
      status: "rest",
      points: 10,
      paused: true,
    });
  });

  it("R4: per-week slack day is provisional Rest, final Rest at cutoff", () => {
    expect(resolve(mma, undefined, { perWeekRest: true })).toMatchObject({
      status: "rest",
      provisional: true,
    });
    expect(resolve(mma, undefined, { perWeekRest: true, final: true })).toMatchObject({
      status: "rest",
      provisional: false,
    });
  });

  it("R4: a logged per-week day counts as logged, not Rest", () => {
    expect(resolve(mma, { status: "done" }, { perWeekRest: true }).status).toBe("done");
  });
});
