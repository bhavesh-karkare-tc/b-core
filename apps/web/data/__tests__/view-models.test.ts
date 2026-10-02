import { describe, expect, it } from "vitest";
import { buildCloseDaySummary, buildDayView, buildTodayView, formatClock } from "../view-models";
import { allDone, arcData, at, entry, firstDone, sickLog } from "./build";

describe("buildTodayView: arc states", () => {
  it("no arc", () => {
    expect(buildTodayView(null, at("2026-10-23", "15:00"))).toEqual({ kind: "no_arc" });
  });

  it("TC06: future start shows a countdown", () => {
    const view = buildTodayView(arcData({ startDate: "2026-11-01" }), at("2026-10-23", "15:00"));
    expect(view).toMatchObject({ kind: "countdown", daysUntilStart: 9 });
  });

  it("E17: completed after the Day 92 cutoff", () => {
    expect(buildTodayView(arcData(), at("2027-01-01", "12:00")).kind).toBe("completed");
  });
});

describe("buildTodayView: active day", () => {
  const now = at("2026-10-23", "15:00");

  it("Day 23 header data: day number, chapters, empty day", () => {
    const view = buildTodayView(arcData(), now);
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.day).toMatchObject({
      date: "2026-10-23",
      dayNumber: 23,
      score: 0,
      provisional: true,
    });
    expect(view.chapters).toEqual([
      { index: 1, label: "OCT", days: 31, elapsed: 23 },
      { index: 2, label: "NOV", days: 30, elapsed: 0 },
      { index: 3, label: "DEC", days: 31, elapsed: 0 },
    ]);
    expect(view.currentChapter).toBe(1);
    expect(view.day.habits).toHaveLength(10);
    expect(view.day.habits[0]).toMatchObject({ number: "01", meta: "0 / 3,000 ml", progress: 0 });
  });

  it("TC11: tapping No Junk → Done and the score updates", () => {
    const data = arcData();
    data.entries = [entry("h2", "2026-10-23", { status: "done" })];
    const view = buildTodayView(data, now);
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.day.habits[1]).toMatchObject({ status: "done", statusLabel: "Done" });
    expect(view.day.score).toBe(10);
    expect(view.day).toMatchObject({ doneCount: 1, totalCount: 10, habitsNeeded: 7 });
  });

  it("R3: a count between minimum and target reads 'Minimum so far'", () => {
    const data = arcData();
    data.entries = [entry("h1", "2026-10-23", { value: 2250 })];
    const view = buildTodayView(data, now);
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.day.habits[0]).toMatchObject({
      status: "minimum",
      statusLabel: "Minimum so far",
      provisional: true,
      meta: "2,250 / 3,000 ml",
      progress: 0.75,
      quickAction: "increment",
    });
  });

  it("TC18: Sunday MMA is a Rest row with no quick action", () => {
    const view = buildTodayView(arcData(), at("2026-10-18", "15:00"));
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.day.habits[3]).toMatchObject({
      status: "rest",
      points: 10,
      meta: "Rest day",
      quickAction: null,
    });
    expect(view.day.totalCount).toBe(9);
  });

  it("row meta per habit type", () => {
    const data = arcData();
    data.entries = [
      entry("h3", "2026-10-23", { loggedTime: "00:20" }),
      entry("h4", "2026-10-23", { status: "done", durationMin: 60 }),
      entry("h8", "2026-10-23", { value: 1 }),
      entry("h9", "2026-10-23", { status: "minimum" }),
    ];
    const view = buildTodayView(data, now);
    if (view.kind !== "active") throw new Error(view.kind);
    const meta = view.day.habits.map((h) => h.meta);
    expect(meta[2]).toBe("Logged 12:20 AM");
    expect(meta[3]).toBe("Session · 60 min");
    expect(meta[7]).toBe("1 / 3 tasks");
    expect(meta[8]).toBe("Minimum · Face wash only");
    expect(meta[9]).toBe("Done or missed");
    expect(meta[6]).toBe("Min: 2 of 3 meals");
  });

  it("rank and streak come from the engine", () => {
    const data = arcData();
    data.entries = ["2026-10-20", "2026-10-21", "2026-10-22"].flatMap((d) => allDone(data, d));
    const view = buildTodayView(data, now);
    if (view.kind !== "active") throw new Error(view.kind);
    // Days 1–19 empty (weak) then 3 perfect days → streak 3, safe.
    expect(view.streak).toMatchObject({ current: 3, state: "safe" });
    // 300 + 3 empty Sundays where MMA Rest scores 10 each.
    expect(view.rank).toMatchObject({ name: "Recruit", points: 330 });
    expect(view.rank.next).toEqual({ name: "Fighter", remaining: 670 });
  });
});

describe("banners", () => {
  it("TC20: yesterday with unlogged habits before noon shows the banner", () => {
    const data = arcData();
    data.entries = firstDone(data, "2026-10-22", 8);
    const view = buildTodayView(data, at("2026-10-23", "09:00"));
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.banners).toContainEqual({
      kind: "yesterday_unlogged",
      date: "2026-10-22",
      unlogged: 2,
      closesAt: at("2026-10-23", "12:00").toISOString(),
    });
  });

  it("TC21: after noon yesterday is closed — no banner, read-only", () => {
    const data = arcData();
    data.entries = firstDone(data, "2026-10-22", 8);
    const now = at("2026-10-23", "12:05");
    const view = buildTodayView(data, now);
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.banners.some((b) => b.kind === "yesterday_unlogged")).toBe(false);
    const yesterday = buildDayView(data, "2026-10-22", now);
    expect(yesterday?.editWindow).toEqual({ editable: false, reason: "closed" });
    expect(yesterday?.habits.every((h) => h.quickAction === null)).toBe(true);
  });

  it("at risk after one weak day, with habits needed", () => {
    const data = arcData();
    data.entries = [
      ...["2026-10-20", "2026-10-21"].flatMap((d) => allDone(data, d)),
      ...firstDone(data, "2026-10-22", 5), // weak
    ];
    const view = buildTodayView(data, at("2026-10-23", "15:00"));
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.streak.state).toBe("at_risk");
    expect(view.banners).toContainEqual({ kind: "at_risk", habitsNeeded: 8 });
  });

  it("broken after two weak days without a shield", () => {
    const view = buildTodayView(arcData(), at("2026-10-23", "15:00"));
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.banners).toContainEqual({ kind: "broken", best: 0 });
  });

  it("sick day shows only the sick banner", () => {
    const data = arcData({ sickDaysUsed: 1 });
    data.dayLogs = [sickLog("2026-10-23")];
    const view = buildTodayView(data, at("2026-10-23", "15:00"));
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.banners).toEqual([{ kind: "sick_day" }]);
    expect(view.day.habits.every((h) => h.status === "sick" && h.quickAction === null)).toBe(true);
    expect(view.sickDaysLeft).toBe(2);
    expect(view.day.sickDay).toEqual({ allowed: false, reason: "already_sick" });
  });

  it("all done", () => {
    const data = arcData();
    data.entries = allDone(data, "2026-10-23");
    const view = buildTodayView(data, at("2026-10-23", "15:00"));
    if (view.kind !== "active") throw new Error(view.kind);
    expect(view.banners).toContainEqual({ kind: "all_done" });
    expect(view.day).toMatchObject({ score: 100, isStrong: true, habitsNeeded: 0 });
  });
});

describe("buildCloseDaySummary", () => {
  it("strong day grows the streak", () => {
    const data = arcData();
    data.entries = allDone(data, "2026-10-23");
    expect(buildCloseDaySummary(data, "2026-10-23", at("2026-10-23", "21:30"))).toMatchObject({
      score: 100,
      isStrong: true,
      effect: "grows",
      streak: { current: 1, state: "safe" },
    });
  });

  it("first weak day after a strong one is at risk", () => {
    const data = arcData();
    data.entries = [...allDone(data, "2026-10-22"), ...firstDone(data, "2026-10-23", 3)];
    expect(buildCloseDaySummary(data, "2026-10-23", at("2026-10-23", "21:30"))?.effect).toBe(
      "at_risk",
    );
  });

  it("second weak day breaks it", () => {
    const data = arcData();
    data.entries = allDone(data, "2026-10-21");
    expect(buildCloseDaySummary(data, "2026-10-23", at("2026-10-23", "21:30"))?.effect).toBe(
      "broken",
    );
  });

  it("sick day freezes it", () => {
    const data = arcData();
    data.dayLogs = [sickLog("2026-10-23")];
    expect(buildCloseDaySummary(data, "2026-10-23", at("2026-10-23", "21:30"))?.effect).toBe(
      "frozen",
    );
  });

  it("null for a day outside the evaluated range", () => {
    expect(buildCloseDaySummary(arcData(), "2026-10-24", at("2026-10-23", "21:30"))).toBeNull();
  });
});

describe("formatClock", () => {
  it("formats 24h times as 12h", () => {
    expect(formatClock("00:00")).toBe("12:00 AM");
    expect(formatClock("00:30")).toBe("12:30 AM");
    expect(formatClock("12:05")).toBe("12:05 PM");
    expect(formatClock("23:45")).toBe("11:45 PM");
  });
});
