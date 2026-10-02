import { describe, expect, it } from "vitest";
import { defaultHabits, entry, habit } from "./__fixtures__/habits";
import { cutoffWrites, evaluateArc, type EvaluateInput } from "./evaluate";
import { instantAt } from "./timezone";
import type { DayLog, Habit, HabitEntry, HabitVersion } from "./types";

const tz = "Asia/Kolkata";
const arc = { startDate: "2026-10-01", durationDays: 92, timeZone: tz, strongThreshold: 80 };
const versions = (habits: Habit[], validFrom = "2026-10-01"): HabitVersion[] =>
  habits.map((h) => ({ habitId: h.id, validFrom, habit: h }));

/** All 10 habits done on a date (MMA skipped on Sundays — it is Rest). */
function allDone(date: string): HabitEntry[] {
  return defaultHabits.map((h) => {
    switch (h.type) {
      case "count":
        return entry(h.id, date, { value: h.target });
      case "checklist":
        return entry(h.id, date, { value: h.items });
      case "time":
        return entry(h.id, date, { loggedTime: "23:30" });
      default:
        return entry(h.id, date, { status: "done" });
    }
  });
}

function run(partial: Partial<EvaluateInput>) {
  return evaluateArc({
    arc,
    habitVersions: versions(defaultHabits),
    entries: [],
    dayLogs: [],
    now: instantAt("2026-10-03", "09:00", tz),
    ...partial,
  });
}

describe("evaluateArc", () => {
  it("evaluates from Day 1 to today; only days past cutoff are final", () => {
    const days = run({});
    expect(days.map((d) => [d.date, d.final])).toEqual([
      ["2026-10-01", true],
      ["2026-10-02", false], // yesterday, before noon
      ["2026-10-03", false], // today
    ]);
  });

  it("TC22: an empty finalised day is all Missed (0); open days are pending", () => {
    const [day1, day2] = run({});
    expect(day1).toMatchObject({ score: 0, isWeak: true, provisional: false });
    expect(day1?.entries.every((e) => e.status === "missed")).toBe(true);
    expect(day2?.entries.every((e) => e.status === "unlogged")).toBe(true);
    expect(day2?.provisional).toBe(true);
  });

  it("a fully logged day scores 100 and is strong", () => {
    const [day1] = run({ entries: allDone("2026-10-01") });
    expect(day1).toMatchObject({ score: 100, isStrong: true });
  });

  it("TC18: Sunday MMA is Rest worth 10 points", () => {
    const days = run({ now: instantAt("2026-10-05", "09:00", tz), entries: [] });
    const sunday = days.find((d) => d.date === "2026-10-04");
    const mma = sunday?.entries.find((e) => e.habitId === habit("MMA Training").id);
    expect(mma).toMatchObject({ status: "rest", points: 10 });
    expect(sunday?.score).toBe(10); // 9 missed + 1 rest
  });

  it("TC23: a sick day is excluded from scoring", () => {
    const logs: DayLog[] = [
      { arcId: "arc-1", date: "2026-10-01", isSick: true, journal: null, mood: null },
    ];
    const [day1] = run({ dayLogs: logs });
    expect(day1).toMatchObject({ score: null, isSick: true, isWeak: false, isStrong: false });
  });

  it("habits are ordered by display order", () => {
    const shuffled = versions([...defaultHabits].reverse());
    const [day1] = run({ habitVersions: shuffled });
    expect(day1?.entries.map((e) => e.habitId)).toEqual(defaultHabits.map((h) => h.id));
  });

  it("E7: a new version applies from its validFrom date", () => {
    const read = habit("Read 10 Pages") as Extract<Habit, { type: "count" }>;
    const v2: HabitVersion = {
      habitId: read.id,
      validFrom: "2026-10-02",
      habit: { ...read, target: 5 },
    };
    const days = run({
      habitVersions: [...versions(defaultHabits), v2],
      entries: [
        entry(read.id, "2026-10-01", { value: 5 }),
        entry(read.id, "2026-10-02", { value: 5 }),
      ],
    });
    const status = (i: number) => days[i]?.entries.find((e) => e.habitId === read.id)?.status;
    expect(status(0)).toBe("minimum"); // target 10, min 3
    expect(status(1)).toBe("done"); // target 5 from 2 Oct
  });

  it("R4: per-week habit rests while the quota is reachable, then is required", () => {
    // 1 habit, 3×/week. Arc starts Monday 5 Oct.
    const gym: Habit = {
      ...habit("MMA Training"),
      id: "gym",
      schedule: { kind: "perWeek", times: 3 },
    };
    const mondayArc = { ...arc, startDate: "2026-10-05" };
    const days = evaluateArc({
      arc: mondayArc,
      habitVersions: versions([gym], "2026-10-05"),
      entries: [entry("gym", "2026-10-06", { status: "done" })],
      dayLogs: [],
      now: instantAt("2026-10-12", "13:00", tz), // whole first week final
    });
    const statuses = days.slice(0, 7).map((d) => d.entries[0]?.status);
    // Mon rest (0+6≥3), Tue done, Wed–Fri rest (1+n≥3 while n≥2): Wed 1+4, Thu 1+3, Fri 1+2,
    // Sat 1+1 < 3 → required → missed, Sun 1+0 < 3 → missed.
    expect(statuses).toEqual(["rest", "done", "rest", "rest", "rest", "missed", "missed"]);
  });

  it("stops at the arc end even if now is later", () => {
    const short = { ...arc, durationDays: 3 };
    expect(
      evaluateArc({
        arc: short,
        habitVersions: [],
        entries: [],
        dayLogs: [],
        now: instantAt("2026-10-10", "12:00", tz),
      }),
    ).toHaveLength(3);
  });

  it("returns nothing before the arc starts", () => {
    expect(run({ now: instantAt("2026-09-30", "12:00", tz) })).toEqual([]);
  });
});

describe("cutoffWrites", () => {
  const now = instantAt("2026-10-02", "12:00", tz);

  it("TC22: pending habits become Missed with source cutoff", () => {
    const [day1] = run({ entries: [entry("h2", "2026-10-01", { status: "done" })] });
    const writes = cutoffWrites(
      "2026-10-01",
      day1?.entries ?? [],
      [entry("h2", "2026-10-01", { status: "done" })],
      now,
    );
    expect(writes).toHaveLength(9);
    expect(writes.every((w) => w.status === "missed" && w.source === "cutoff")).toBe(true);
    expect(writes[0]?.updatedAt).toBe(now.toISOString());
  });

  it("keeps a logged value below minimum, and skips user-set Missed", () => {
    const logged = [
      entry("h1", "2026-10-01", { value: 1500 }), // below minimum → missed at cutoff
      entry("h2", "2026-10-01", { status: "missed" }), // already the user's choice
    ];
    const [day1] = run({ entries: logged });
    const writes = cutoffWrites("2026-10-01", day1?.entries ?? [], logged, now);
    expect(writes.find((w) => w.habitId === "h1")).toMatchObject({ value: 1500, source: "cutoff" });
    expect(writes.find((w) => w.habitId === "h2")).toBeUndefined();
  });
});
