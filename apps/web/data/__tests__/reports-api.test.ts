import { describe, expect, it } from "vitest";
import { createMockApi, STORAGE_KEY } from "../mock/api";
import { memoryStore } from "../mock/store";
import { DEFAULT_NOTIFICATIONS } from "../notifications";
import { at, TZ } from "./build";

function setup(
  scenario: Parameters<ReturnType<typeof createMockApi>["loadScenario"]>[0] = "day23",
) {
  const store = memoryStore();
  const api = createMockApi({ store, timeZone: () => TZ });
  return { store, api, load: async () => api.loadScenario(scenario) };
}

async function code(p: Promise<unknown>) {
  try {
    await p;
    return "ok";
  } catch (e) {
    return (e as { code?: string }).code ?? "other";
  }
}

describe("reports list and timing", () => {
  it("Day 23: weeks 1–3, newest first, short first week labelled, reflections pending after 24 h", async () => {
    const { api, load } = setup();
    await load();
    const view = await api.getReports();
    expect(view.current?.reports.map((r) => [r.title, r.reflection])).toEqual([
      ["Week 3", "pending"],
      ["Week 2", "pending"],
      ["Week 1 · 4 days", "pending"],
    ]);
    expect(view.current?.nextDue).toBe(at("2026-10-26", "12:00").toISOString());
    expect(view.past).toEqual([]);
  });

  it("TC46: Week 4 is generated at Monday 12:00, not before", async () => {
    const { api, load } = setup();
    await load();
    await api.setDemoNow(at("2026-10-26", "11:59").toISOString());
    expect((await api.getReports()).current?.reports).toHaveLength(3);
    await api.setDemoNow(at("2026-10-26", "12:00").toISOString());
    const reports = (await api.getReports()).current?.reports ?? [];
    expect(reports[0]).toMatchObject({ title: "Week 4", reflection: "empty" });
  });

  it("weekly numbers equal the tracker for that week", async () => {
    const { api, load } = setup();
    await load();
    const report = await api.getReport("arc-winter-2026-weekly-2");
    const tracker = await api.getTracker(1);
    if (tracker.kind !== "tracker" || report?.report.type !== "weekly") throw new Error("view");
    const week = tracker.rows.filter((r) => r.date >= "2026-10-05" && r.date <= "2026-10-11");
    expect(report.report.snapshot.total).toBe(week.reduce((s, r) => s + (r.score ?? 0), 0));
    expect(report.report.snapshot.strongDays).toBe(week.filter((r) => r.isStrong).length);
    expect(report.title).toBe("Week 2");
  });

  it("TC47: a generated report is a snapshot — later data changes don't alter it", async () => {
    const { api, load, store } = setup();
    await load();
    const before = await api.getReport("arc-winter-2026-weekly-2");
    const raw = JSON.parse(store.get(STORAGE_KEY) ?? "{}");
    raw.arcs[0].entries = raw.arcs[0].entries.filter(
      (e: { date: string }) => e.date !== "2026-10-06",
    );
    store.set(STORAGE_KEY, JSON.stringify(raw));
    const after = await api.getReport("arc-winter-2026-weekly-2");
    expect(after?.report.snapshot).toEqual(before?.report.snapshot);
  });

  it("monthly review on 1 Nov noon; end-of-chapter body check (TC48)", async () => {
    const { api, load } = setup();
    await load();
    await api.setDemoNow(at("2026-11-01", "12:00").toISOString());
    const list = (await api.getReports()).current?.reports ?? [];
    expect(list[0]).toMatchObject({ title: "October review", type: "monthly" });
    const id = list[0]?.id ?? "";
    expect((await api.getReport(id))?.bodyCheck).toEqual({ start: null, end: null });
    await api.saveReportBodyCheck(id, { weightKg: 77.2, waistCm: null, pushupsMax: 35, energy: 7 });
    expect((await api.getReport(id))?.bodyCheck?.end).toMatchObject({
      date: "2026-10-31",
      weightKg: 77.2,
    });
    expect(
      await code(
        api.saveReportBodyCheck("arc-winter-2026-weekly-1", {
          weightKg: 70,
          waistCm: null,
          pushupsMax: null,
          energy: null,
        }),
      ),
    ).toBe("invalid_input");
  });
});

describe("reflections", () => {
  it("weekly: saves win/fix, marks done; validates one line", async () => {
    const { api, load } = setup();
    await load();
    await api.saveReflection("arc-winter-2026-weekly-3", {
      win: "Nine strong days.",
      fix: "Water before noon.",
    });
    const view = await api.getReports();
    expect(view.current?.reports[0]?.reflection).toBe("done");
    expect((await api.getReport("arc-winter-2026-weekly-3"))?.report.reflection).toEqual({
      win: "Nine strong days.",
      fix: "Water before noon.",
    });
    expect(
      await code(api.saveReflection("arc-winter-2026-weekly-3", { win: "x".repeat(141), fix: "" })),
    ).toBe("invalid_input");
    expect(await code(api.saveReflection("nope", { win: "", fix: "" }))).toBe("invalid_input");
  });

  it("monthly: three reflections", async () => {
    const { api, load } = setup();
    await load();
    await api.setDemoNow(at("2026-11-01", "12:00").toISOString());
    const id = (await api.getReports()).current?.reports[0]?.id ?? "";
    await api.saveReflection(id, {
      biggestWin: "Shield earned.",
      fixThis: "Saturdays.",
      nextTarget: "No missed water.",
    });
    expect((await api.getReport(id))?.report.reflection).toMatchObject({
      nextTarget: "No missed water.",
    });
  });
});

describe("past arcs (R14, E15)", () => {
  it("returning user: last year's 14 weekly + 3 monthly reports, read-only", async () => {
    const { api, load } = setup("returning");
    await load();
    const view = await api.getReports();
    expect(view.current).toBeNull();
    expect(view.past[0]?.status).toBe("completed");
    expect(view.past[0]?.reports.filter((r) => r.type === "weekly")).toHaveLength(14);
    expect(view.past[0]?.reports.filter((r) => r.type === "monthly")).toHaveLength(3);
    const id = view.past[0]?.reports[0]?.id ?? "";
    expect((await api.getReport(id))?.readOnly).toBe(true);
    expect(
      await code(api.saveReflection(id, { biggestWin: "", fixThis: "", nextTarget: "" })),
    ).toBe("not_editable");
  });

  it("E15: an abandoned arc keeps only reports up to the day it stopped", async () => {
    const { api, load } = setup();
    await load();
    await api.abandonArc();
    await api.setDemoNow(at("2026-11-05", "12:00").toISOString());
    const view = await api.getReports();
    expect(view.past[0]?.status).toBe("abandoned");
    expect(view.past[0]?.reports.map((r) => r.title)).toEqual([
      "Week 3",
      "Week 2",
      "Week 1 · 4 days",
    ]);
  });
});

describe("settings", () => {
  it("notification settings: MASTER_DOC defaults, save, validation", async () => {
    const { api, load } = setup();
    await load();
    expect(await api.getNotificationSettings()).toEqual(DEFAULT_NOTIFICATIONS);
    const next = {
      ...DEFAULT_NOTIFICATIONS,
      dailyCap: 3,
      quietHours: { start: "22:30", end: "06:30" },
    };
    await api.saveNotificationSettings(next);
    expect(await api.getNotificationSettings()).toEqual(next);
    expect(await code(api.saveNotificationSettings({ ...next, dailyCap: 0 }))).toBe(
      "invalid_input",
    );
    expect(
      await code(
        api.saveNotificationSettings({ ...next, quietHours: { start: "25:00", end: "06:00" } }),
      ),
    ).toBe("invalid_input");
  });

  it("E18: threshold only before lock; My Why any time", async () => {
    const day23 = setup();
    await day23.load();
    expect(await day23.api.getArcSettings()).toMatchObject({
      locked: true,
      canChangeThreshold: false,
      sickDaysLeft: 2,
      sickDaysTotal: 3,
    });
    expect(await code(day23.api.updateArcSettings({ strongThreshold: 70 }))).toBe("locked");
    expect(await code(day23.api.updateArcSettings({ strongThreshold: 80 }))).toBe("ok"); // unchanged value
    expect(await code(day23.api.updateArcSettings({ myWhy: "Stronger every single day." }))).toBe(
      "ok",
    );
    expect((await day23.api.getArcSettings()).myWhy).toBe("Stronger every single day.");
    expect(await code(day23.api.updateArcSettings({ myWhy: "short" }))).toBe("invalid_input");

    const day1 = setup("day-1");
    await day1.load();
    expect(await code(day1.api.updateArcSettings({ strongThreshold: 70 }))).toBe("ok");
    expect((await day1.api.getArcSettings()).arc.strongThreshold).toBe(70);
    expect(await code(day1.api.updateArcSettings({ strongThreshold: 55 }))).toBe("invalid_input");
  });
});
