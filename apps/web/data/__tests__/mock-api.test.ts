import { describe, expect, it } from "vitest";
import { createMockApi, STORAGE_KEY } from "../mock/api";
import { SCENARIOS, type ScenarioId } from "../mock/scenarios";
import { memoryStore } from "../mock/store";
import { DataError, type TodayView } from "../types";
import { TZ } from "./build";

function api(store = memoryStore()) {
  return createMockApi({ store, timeZone: () => TZ });
}

async function active(a: ReturnType<typeof api>) {
  const view = await a.getToday();
  if (view.kind !== "active") throw new Error(`expected active, got ${view.kind}`);
  return view;
}

async function scenarioView(id: ScenarioId): Promise<TodayView> {
  const a = api();
  await a.loadScenario(id);
  return a.getToday();
}

const H = {
  water: "habit-1",
  noJunk: "habit-2",
  phoneOff: "habit-3",
  mma: "habit-4",
  read: "habit-6",
  top3: "habit-8",
  noP: "habit-10",
};
const TODAY = "2026-10-23";

describe("seeded scenarios", () => {
  it("default Day 23: streak 9 Safe, 1 shield, Fighter, today partly logged", async () => {
    const view = await active(api());
    expect(view.day.dayNumber).toBe(23);
    expect(view.streak).toEqual({ current: 9, best: 9, state: "safe", shieldsHeld: 1 });
    expect(view.rank.name).toBe("Fighter");
    // 5 Done + 4 provisional Minimum (R3) + Phone Off pending = 70
    expect(view.day).toMatchObject({ score: 70, doneCount: 5, totalCount: 10, habitsNeeded: 1 });
    expect(view.sickDaysLeft).toBe(2); // day 9 was sick
    expect(view.banners).toEqual([]);
  });

  it("at-risk: yesterday weak", async () => {
    const view = await scenarioView("at-risk");
    expect(view).toMatchObject({ streak: { current: 8, state: "at_risk" } });
    expect(view.kind === "active" && view.banners.map((b) => b.kind)).toEqual(["at_risk"]);
  });

  it("shielded: a shield saved the streak", async () => {
    const view = await scenarioView("shielded");
    expect(view).toMatchObject({ streak: { current: 7, state: "shielded", shieldsHeld: 0 } });
  });

  it("broken: two weak days, no shield", async () => {
    const view = await scenarioView("broken");
    // Best 8: days 1–6, 8 and 10 before the first break.
    expect(view).toMatchObject({ streak: { current: 0, state: "broken", best: 8 } });
  });

  it("yesterday-unlogged: 09:00 with 2 open habits", async () => {
    const view = await scenarioView("yesterday-unlogged");
    expect(view.kind === "active" && view.banners[0]).toMatchObject({
      kind: "yesterday_unlogged",
      date: "2026-10-22",
      unlogged: 2,
    });
  });

  it("sick-today: sick banner, 1 sick day left", async () => {
    const view = await scenarioView("sick-today");
    expect(view).toMatchObject({
      day: { isSick: true },
      sickDaysLeft: 1,
      banners: [{ kind: "sick_day" }],
    });
  });

  it("sunday: MMA is Rest", async () => {
    const view = await scenarioView("sunday");
    expect(view.kind === "active" && view.day.habits[3]?.status).toBe("rest");
  });

  it("all-done: score 100", async () => {
    const view = await scenarioView("all-done");
    expect(view).toMatchObject({ day: { score: 100 } });
    expect(view.kind === "active" && view.banners.map((b) => b.kind)).toContain("all_done");
  });

  it("countdown and day-1", async () => {
    expect(await scenarioView("countdown")).toMatchObject({ kind: "countdown", daysUntilStart: 9 });
    expect(await scenarioView("day-1")).toMatchObject({
      kind: "active",
      day: { dayNumber: 1, score: 0 },
    });
  });

  it("every scenario seeds without throwing", async () => {
    for (const s of SCENARIOS) await expect(scenarioView(s.id)).resolves.toBeDefined();
  });
});

describe("logging", () => {
  it("TC11: Yes/No tap → Done, score updates", async () => {
    const a = api();
    await a.loadScenario("day-1");
    await a.logHabit(TODAY, H.noJunk, "done");
    const view = await active(a);
    expect(view.day.habits[1]?.status).toBe("done");
    expect(view.day.score).toBe(10);
  });

  it("TC12: count quick-add to 3000 ml is auto Done", async () => {
    const a = api();
    await a.loadScenario("day-1");
    for (let i = 1; i <= 12; i++) await a.setHabitValue(TODAY, H.water, { value: i * 250 });
    expect((await active(a)).day.habits[0]).toMatchObject({ status: "done", value: 3000 });
  });

  it("time habit logs a clock time", async () => {
    const a = api();
    await a.loadScenario("day-1");
    await a.setHabitValue(TODAY, H.phoneOff, { loggedTime: "00:20" });
    expect((await active(a)).day.habits[2]).toMatchObject({
      status: "minimum",
      loggedTime: "00:20",
    });
  });

  it("time quick action logs the demo clock time", async () => {
    const a = api();
    await a.loadScenario("day-1"); // pinned 08:00
    await a.logTimeNow(TODAY, H.phoneOff);
    // A1 night clock: 08:00 is after the 00:30 minimum → Missed.
    expect((await active(a)).day.habits[2]).toMatchObject({
      loggedTime: "08:00",
      status: "missed",
    });
    await a.setDemoNow(new Date("2026-10-23T18:10:00Z").toISOString()); // 23:40 IST
    await a.logTimeNow(TODAY, H.phoneOff);
    expect((await active(a)).day.habits[2]).toMatchObject({ loggedTime: "23:40", status: "done" });
    await expect(a.logTimeNow(TODAY, H.water)).rejects.toMatchObject({ code: "invalid_input" });
  });

  it("session: done with duration", async () => {
    const a = api();
    await a.loadScenario("day-1");
    await a.logHabit(TODAY, H.mma, "done");
    await a.setHabitValue(TODAY, H.mma, { durationMin: 45 });
    expect((await active(a)).day.habits[3]).toMatchObject({
      status: "done",
      meta: "Session · 45 min",
    });
  });

  it("checklist: ticking items sets the value", async () => {
    const a = api();
    await a.loadScenario("day-1");
    await a.setChecklistItem(TODAY, H.top3, 0, { text: "Ship it", done: true });
    await a.setChecklistItem(TODAY, H.top3, 2, { done: true });
    const row = (await active(a)).day.habits[7];
    expect(row).toMatchObject({ value: 2, status: "minimum" });
    expect(row?.checklist?.[0]).toEqual({ text: "Ship it", done: true });
  });

  it("explicit Missed, then a value clears it", async () => {
    const a = api();
    await a.loadScenario("day-1");
    await a.logHabit(TODAY, H.read, "missed");
    expect((await active(a)).day.habits[5]?.status).toBe("missed");
    await a.setHabitValue(TODAY, H.read, { value: 10 });
    expect((await active(a)).day.habits[5]?.status).toBe("done");
  });

  it("persists across instances sharing a store", async () => {
    const store = memoryStore();
    await api(store).logHabit(TODAY, H.noJunk, "missed");
    expect((await active(api(store))).day.habits[1]?.status).toBe("missed");
  });

  it("re-seeds when storage is corrupt", async () => {
    const store = memoryStore({ [STORAGE_KEY]: "{not json" });
    expect((await active(api(store))).day.dayNumber).toBe(23);
  });
});

describe("guards", () => {
  async function code(p: Promise<unknown>) {
    try {
      await p;
    } catch (e) {
      return e instanceof DataError ? e.code : "other";
    }
    return "ok";
  }

  it("TC18: Rest day cannot be changed", async () => {
    const a = api();
    await a.loadScenario("sunday");
    expect(await code(a.logHabit("2026-10-18", H.mma, "done"))).toBe("rest_day");
  });

  it("TC19: a no-minimum habit rejects Minimum", async () => {
    const a = api();
    expect(await code(a.logHabit(TODAY, H.noP, "minimum"))).toBe("invalid_input");
  });

  it("value habits reject Done by status", async () => {
    expect(await code(api().logHabit(TODAY, H.water, "done"))).toBe("invalid_input");
  });

  it("TC20 / TC21: yesterday editable at 09:00, locked after noon", async () => {
    const a = api();
    await a.loadScenario("yesterday-unlogged");
    expect(await code(a.logHabit("2026-10-22", H.noJunk, "done"))).toBe("ok");
    await a.setDemoNow(new Date("2026-10-23T06:35:00Z").toISOString()); // 12:05 IST
    expect(await code(a.logHabit("2026-10-22", H.noJunk, "missed"))).toBe("not_editable");
  });

  it("future days are locked", async () => {
    expect(await code(api().logHabit("2026-10-24", H.noJunk, "done"))).toBe("not_editable");
  });

  it("unknown habit", async () => {
    expect(await code(api().logHabit(TODAY, "nope", "done"))).toBe("unknown_habit");
  });

  it("sick day blocks logging", async () => {
    const a = api();
    await a.loadScenario("sick-today");
    expect(await code(a.logHabit(TODAY, H.noJunk, "done"))).toBe("sick_day");
  });

  it("invalid values are rejected", async () => {
    const a = api();
    expect(await code(a.setHabitValue(TODAY, H.water, { value: -1 }))).toBe("invalid_input");
    expect(await code(a.setHabitValue(TODAY, H.phoneOff, { loggedTime: "25:00" }))).toBe(
      "invalid_input",
    );
    expect(await code(a.setChecklistItem(TODAY, H.top3, 5, { done: true }))).toBe("invalid_input");
    expect(await code(a.setDemoNow("not a date"))).toBe("invalid_input");
  });

  it("TC06: before the arc starts nothing is editable", async () => {
    const a = api();
    await a.loadScenario("countdown");
    expect(await code(a.logHabit("2026-10-23", H.noJunk, "done"))).toBe("not_editable");
  });
});

describe("sick day and close the day", () => {
  it("TC23: sick day → all Sick, excluded, streak frozen, sick days used +1", async () => {
    const a = api();
    const before = await active(a);
    await a.markSickDay(TODAY);
    const after = await active(a);
    expect(after.day).toMatchObject({ isSick: true, score: null });
    expect(after.sickDaysLeft).toBe(before.sickDaysLeft - 1);
    expect(after.streak).toEqual(before.streak);
    const summary = await a.getCloseDaySummary(TODAY);
    expect(summary).toMatchObject({ effect: "frozen", streak: { current: 9 } });
  });

  it("TC24: sick option is refused when none are left", async () => {
    const a = api();
    await a.loadScenario("sick-today"); // 2 used
    await a.setDemoNow(new Date("2026-10-24T09:30:00Z").toISOString()); // 15:00 IST next day
    await a.markSickDay("2026-10-24"); // 3rd
    await a.setDemoNow(new Date("2026-10-25T09:30:00Z").toISOString());
    await expect(a.markSickDay("2026-10-25")).rejects.toMatchObject({ code: "sick_not_allowed" });
  });

  it("close the day stores journal + mood and returns the streak effect", async () => {
    const a = api();
    await a.loadScenario("all-done");
    const summary = await a.closeDay(TODAY, { journal: "  Best day yet.  ", mood: 5 });
    expect(summary).toMatchObject({ score: 100, effect: "grows", streak: { current: 10 } });
    expect((await active(a)).day).toMatchObject({ journal: "Best day yet.", mood: 5 });
    expect((await active(a)).day.closedAt).not.toBeNull();
  });

  it("TC25: journal over 140 characters is rejected", async () => {
    await expect(
      api().closeDay(TODAY, { journal: "x".repeat(141), mood: null }),
    ).rejects.toMatchObject({
      code: "invalid_input",
    });
  });

  it("closing a locked day is refused", async () => {
    await expect(api().closeDay("2026-10-20", { journal: null, mood: 3 })).rejects.toMatchObject({
      code: "not_editable",
    });
  });
});

describe("demo controls", () => {
  it("reports scenario, clock and timezone; reset restores the default", async () => {
    const a = api();
    await a.loadScenario("sunday");
    expect(await a.getDemoState()).toMatchObject({ scenario: "sunday", timeZone: TZ });
    expect(await a.getDemoToday()).toBe("2026-10-18");
    await a.resetDemo();
    expect((await a.getDemoState()).scenario).toBe("day23");
  });

  it("getActiveArc and getDay", async () => {
    const a = api();
    expect(await a.getActiveArc()).toMatchObject({ name: "Winter Arc", endDate: "2026-12-31" });
    expect((await a.getDay("2026-10-22"))?.final).toBe(true);
  });
});
