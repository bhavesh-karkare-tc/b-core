import { WINTER_ARC_TEMPLATE, type HabitDraft } from "@b-core/arc-engine";
import { describe, expect, it } from "vitest";
import { createMockApi } from "../mock/api";
import { memoryStore } from "../mock/store";
import type { CreateArcInput } from "../types";
import { TZ } from "./build";

function must<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("missing fixture");
  return value;
}

function api() {
  let n = 0;
  return createMockApi({ store: memoryStore(), timeZone: () => TZ, makeId: (p) => `${p}-${++n}` });
}

const input = (patch: Partial<CreateArcInput> = {}): CreateArcInput => ({
  habits: [...WINTER_ARC_TEMPLATE],
  startDate: "2026-10-23",
  durationDays: 92,
  strongThreshold: 80,
  myWhy: "Finish the year stronger.",
  chapterTarget: "Water every day",
  bodyCheck: { weightKg: 78.5, waistCm: 84, pushupsMax: 30, energy: 6 },
  commitName: "Bhavesh",
  ...patch,
});

async function code(p: Promise<unknown>) {
  try {
    await p;
    return "ok";
  } catch (e) {
    return (e as { code?: string }).code ?? "other";
  }
}

describe("setup context", () => {
  it("new user: no arc, default template, start options, no previous template", async () => {
    const a = api();
    await a.loadScenario("no-arc");
    const ctx = await a.getSetupContext();
    expect(ctx.activeArc).toBeNull();
    expect(ctx.templates.default).toHaveLength(10);
    expect(ctx.templates.previous).toBeNull();
    expect(ctx.startOptions).toEqual({ today: "2026-10-23", nextMonthStart: "2026-11-01" });
    expect((await a.getToday()).kind).toBe("no_arc");
  });

  it("returning user: the previous arc's habits can be copied", async () => {
    const a = api();
    await a.loadScenario("returning");
    const ctx = await a.getSetupContext();
    expect(ctx.pastArcs).toEqual([
      {
        id: "arc-winter-2025",
        startDate: "2025-10-01",
        endDate: "2025-12-31",
        status: "completed",
        habitCount: 9,
      },
    ]);
    expect(ctx.templates.previous?.map((h) => h.name)).toContain("Cold Shower");
    expect(ctx.templates.previous?.some((h) => "id" in h)).toBe(false);
  });

  it("drafts survive reloads and clear on create", async () => {
    const a = api();
    await a.loadScenario("no-arc");
    await a.saveSetupDraft({
      step: 3,
      template: "default",
      habits: [...WINTER_ARC_TEMPLATE],
      startDate: null,
      durationDays: 92,
      strongThreshold: 80,
      myWhy: "",
      chapterTarget: "",
      bodyCheck: null,
      bodyCheckSkipped: false,
      commitName: "",
    });
    expect((await a.getSetupContext()).draft?.step).toBe(3);
    await a.createArc(input());
    expect((await a.getSetupContext()).draft).toBeNull();
  });
});

describe("createArc", () => {
  it("TC01: default template → 10 habits, 92 days, 3 chapters, lands on Today Day 1", async () => {
    const a = api();
    await a.loadScenario("no-arc");
    const arc = await a.createArc(input({ startDate: "2026-10-23" }));
    expect(arc).toMatchObject({
      durationDays: 92,
      endDate: "2027-01-22",
      strongThreshold: 80,
      timeZone: TZ,
    });
    const today = await a.getToday();
    if (today.kind !== "active") throw new Error(today.kind);
    expect(today.day).toMatchObject({ dayNumber: 1, score: 0 });
    expect(today.day.habits.map((h) => h.habit.name)).toEqual(
      WINTER_ARC_TEMPLATE.map((h) => h.name),
    );
    expect(today.chapters.map((c) => c.label)).toEqual(["OCT", "NOV", "DEC", "JAN"]);
    const settings = await a.getHabitSettings();
    expect(settings.habits.map((h) => h.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("TC01: starting 1 Nov gives 3 chapters (Nov, Dec, Jan)", async () => {
    const a = api();
    await a.loadScenario("no-arc");
    await a.createArc(input({ startDate: "2026-11-01" }));
    const today = await a.getToday();
    expect(today).toMatchObject({ kind: "countdown", daysUntilStart: 9 });
  });

  it("TC06: future start → countdown, logging disabled", async () => {
    const a = api();
    await a.loadScenario("no-arc");
    await a.createArc(input({ startDate: "2026-10-24" }));
    expect(await a.getToday()).toMatchObject({ kind: "countdown", daysUntilStart: 1 });
    const habitId = (await a.getHabitSettings()).habits[1]?.id ?? "";
    expect(await code(a.logHabit("2026-10-24", habitId, "done"))).toBe("not_editable");
  });

  it("TC09: a second arc while one is active is refused", async () => {
    const a = api();
    expect(await code(a.createArc(input()))).toBe("arc_active");
  });

  it("TC09 / E15: abandoning keeps the old arc as a read-only past arc", async () => {
    const a = api();
    await a.abandonArc();
    expect((await a.getToday()).kind).toBe("no_arc");
    const ctx = await a.getSetupContext();
    expect(ctx.pastArcs[0]).toMatchObject({ id: "arc-winter-2026", status: "abandoned" });
    expect(await code(a.createArc(input()))).toBe("ok");
  });

  it("validates the whole input", async () => {
    const a = api();
    await a.loadScenario("no-arc");
    const habits = [...WINTER_ARC_TEMPLATE];
    expect(await code(a.createArc(input({ habits: habits.slice(0, 2) })))).toBe("invalid_input"); // TC02
    expect(await code(a.createArc(input({ myWhy: "short" })))).toBe("invalid_input"); // TC05
    expect(await code(a.createArc(input({ durationDays: 45 })))).toBe("invalid_input");
    expect(await code(a.createArc(input({ strongThreshold: 50 })))).toBe("invalid_input");
    expect(await code(a.createArc(input({ startDate: "2026-10-22" })))).toBe("invalid_input");
    expect(await code(a.createArc(input({ commitName: "  " })))).toBe("invalid_input");
    expect(
      await code(
        a.createArc(
          input({ bodyCheck: { weightKg: 5, waistCm: null, pushupsMax: null, energy: null } }),
        ),
      ),
    ).toBe("invalid_input");
    const bad = { ...habits[0], name: "" } as HabitDraft;
    expect(await code(a.createArc(input({ habits: [bad, ...habits.slice(1)] })))).toBe(
      "invalid_input",
    );
  });

  it("stores the body check, chapter target and commitment; skipping is allowed", async () => {
    const a = api();
    await a.loadScenario("no-arc");
    expect(await code(a.createArc(input({ bodyCheck: null, chapterTarget: null })))).toBe("ok");
  });
});

describe("habit settings and the Day 3 lock", () => {
  async function freshArc() {
    const a = api();
    await a.loadScenario("no-arc");
    await a.createArc(input({ startDate: "2026-10-23" }));
    return a;
  }

  it("R7: before lock a target change is retroactive", async () => {
    const a = await freshArc();
    const water = (await a.getHabitSettings()).habits[0];
    if (water?.type !== "count") throw new Error("water");
    await a.setHabitValue("2026-10-23", water.id, { value: 2500 });
    const { id: _id, arcId: _arcId, ...draft } = water;
    await a.updateHabit(water.id, { ...draft, target: 2500, minimum: 1500 });
    const today = await a.getToday();
    expect(today.kind === "active" && today.day.habits[0]?.status).toBe("done");
  });

  it("TC08: Day 4 — target change is locked, rename is allowed", async () => {
    const a = await freshArc();
    await a.setDemoNow(new Date("2026-10-26T04:30:00Z").toISOString()); // Day 4, 10:00 IST
    const settings = await a.getHabitSettings();
    expect(settings).toMatchObject({ locked: true, lockDate: "2026-10-25", canChangeList: false });
    expect(settings.editableFields).toEqual(["name", "reminderTime"]);
    const water = settings.habits[0];
    if (water?.type !== "count") throw new Error("water");
    const { id: _id, arcId: _arcId, ...draft } = water;
    expect(await code(a.updateHabit(water.id, { ...draft, target: 2500 }))).toBe("locked");
    expect(
      await code(a.updateHabit(water.id, { ...draft, name: "Water 3L", reminderTime: "09:00" })),
    ).toBe("ok");
    expect((await a.getHabitSettings()).habits[0]).toMatchObject({
      name: "Water 3L",
      reminderTime: "09:00",
      target: 3000,
    });
  });

  it("E6: add / remove only before lock, within 3–10", async () => {
    const a = await freshArc();
    const habits = (await a.getHabitSettings()).habits;
    expect(await code(a.addHabit({ ...must(WINTER_ARC_TEMPLATE[1]), name: "Cold Shower" }))).toBe(
      "invalid_input",
    ); // 10 max
    expect(await code(a.removeHabit(must(habits[9]).id))).toBe("ok");
    expect(await code(a.addHabit({ ...must(WINTER_ARC_TEMPLATE[1]), name: "Cold Shower" }))).toBe(
      "ok",
    );
    expect((await a.getHabitSettings()).habits.at(-1)).toMatchObject({
      name: "Cold Shower",
      order: 10,
    });
    await a.setDemoNow(new Date("2026-10-26T04:30:00Z").toISOString());
    expect(await code(a.removeHabit(must(habits[0]).id))).toBe("locked");
    expect(await code(a.addHabit(must(WINTER_ARC_TEMPLATE[1])))).toBe("locked");
  });

  it("keeps at least 3 habits", async () => {
    const a = api();
    await a.loadScenario("no-arc");
    await a.createArc(input({ habits: WINTER_ARC_TEMPLATE.slice(0, 3) }));
    const first = must((await a.getHabitSettings()).habits[0]);
    expect(await code(a.removeHabit(first.id))).toBe("invalid_input");
    expect(await code(a.removeHabit("nope"))).toBe("unknown_habit");
    expect(await code(a.updateHabit("nope", must(WINTER_ARC_TEMPLATE[0])))).toBe("unknown_habit");
  });

  it("reorder sets the display order", async () => {
    const a = await freshArc();
    const ids = (await a.getHabitSettings()).habits.map((h) => h.id);
    await a.reorderHabits([...ids].reverse());
    expect((await a.getHabitSettings()).habits[0]?.name).toBe("No P");
    expect(await code(a.reorderHabits(ids.slice(1)))).toBe("invalid_input");
  });

  it("saves a body check for today", async () => {
    const a = await freshArc();
    expect(
      await code(a.saveBodyCheck({ weightKg: 77, waistCm: null, pushupsMax: 32, energy: 7 })),
    ).toBe("ok");
    expect(
      await code(a.saveBodyCheck({ weightKg: null, waistCm: null, pushupsMax: null, energy: 11 })),
    ).toBe("invalid_input");
  });
});
