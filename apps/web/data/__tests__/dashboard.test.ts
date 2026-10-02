import { generateChapters } from "@b-core/arc-engine";
import { describe, expect, it } from "vitest";
import { buildDashboardView } from "../dashboard";
import { SCENARIOS, type ScenarioId } from "../mock/scenarios";
import { seedScenario } from "../mock/seed";
import type { DashboardFilter } from "../types";
import { buildTrackerView } from "../view-models";
import { TZ } from "./build";

function scenario(id: ScenarioId) {
  const state = seedScenario(id, TZ);
  return {
    data: state.arcs.find((a) => a.arc.id === state.activeArcId) ?? null,
    now: new Date(state.now),
  };
}

function dashboard(id: ScenarioId, filter?: DashboardFilter) {
  const { data, now } = scenario(id);
  const view = buildDashboardView(data, now, filter);
  if (view.kind !== "dashboard") throw new Error(view.kind);
  return view;
}

describe("Sprint 5 done-when: every dashboard figure reconciles with the tracker", () => {
  for (const s of SCENARIOS) {
    it(`${s.id}`, () => {
      const { data, now } = scenario(s.id);
      const view = buildDashboardView(data, now);
      if (view.kind !== "dashboard") {
        expect(["no_arc", "countdown"]).toContain(view.kind);
        return;
      }
      if (!data) throw new Error("data");
      const chapters = generateChapters(data.arc.startDate, data.arc.durationDays);
      let arcTotal = 0;
      let strong = 0;
      let finalised = 0;
      const trackerScores = new Map<string, number | null>();
      for (const c of chapters) {
        const t = buildTrackerView(data, now, c.index);
        if (t.kind !== "tracker") throw new Error(t.kind);
        arcTotal += t.totals.total;
        for (const r of t.rows) {
          if (!r.future) trackerScores.set(r.date, r.score);
          if (r.final) {
            finalised += 1;
            if (r.isStrong) strong += 1;
          }
        }
        if (c.index === view.tiles.chapter.index) {
          expect(view.tiles.chapter.total).toBe(t.totals.total);
          expect(view.tiles.chapter.average).toBe(t.totals.average);
          expect(view.tiles.chapter.maxSoFar).toBe(t.totals.maxSoFar);
        }
      }
      expect(view.tiles.arc.total).toBe(arcTotal);
      expect(view.rank.points).toBe(arcTotal);
      expect(view.tiles.strongDays).toEqual({ count: strong, finalised });
      for (const cell of view.heatmap) {
        if (cell.level === "future") expect(trackerScores.has(cell.date)).toBe(false);
        else expect(cell.score).toBe(trackerScores.get(cell.date));
      }
      for (const point of view.trend) expect(point.score).toBe(trackerScores.get(point.date));
    });
  }
});

describe("dashboard view (Day 23)", () => {
  const view = dashboard("day23");

  it("Section A tiles", () => {
    expect(view.dayNumber).toBe(23);
    expect(view.progress).toBeCloseTo(23 / 92);
    expect(view.tiles.today).toEqual({ score: 70, provisional: true });
    expect(view.tiles.week.average).toBe(86); // Mon 19–Thu 22 at 90, today 70
    expect(view.tiles.week.change).toBeCloseTo(86 - 570 / 7);
    expect(view.tiles.chapter).toMatchObject({
      index: 1,
      label: "October",
      total: 1840,
      maxSoFar: 2300,
    });
    expect(view.tiles.strongDays).toEqual({ count: 17, finalised: 22 });
    expect(view.streak).toEqual({ current: 9, best: 9, state: "safe", shieldsHeld: 1 });
    expect(view.rank).toMatchObject({
      name: "Fighter",
      points: 1840,
      next: { name: "Contender", remaining: 660 },
    });
  });

  it("TC42: heatmap levels — 90 → 3, 60 → 2, sick distinct, future dashed", () => {
    const at = (date: string) => view.heatmap.find((c) => c.date === date);
    expect(view.heatmap).toHaveLength(92);
    expect(at("2026-10-01")?.level).toBe(3);
    expect(at("2026-10-07")?.level).toBe(2);
    expect(at("2026-10-09")?.level).toBe("sick");
    expect(at("2026-10-23")).toMatchObject({ isToday: true, level: 2 });
    expect(at("2026-10-24")?.level).toBe("future");
  });

  it("trend: 23 points with a 7-day average", () => {
    expect(view.trend).toHaveLength(23);
    expect(view.trend[6]?.average7).toBeCloseTo((90 * 6 + 60) / 7);
  });

  it("habits sorted weakest first, with streaks; categories", () => {
    const ratios = view.habits.map((h) => h.completion ?? 2);
    expect(ratios).toEqual([...ratios].sort((a, b) => a - b));
    expect(view.habits).toHaveLength(10);
    expect(view.habits.every((h) => h.counted > 0 && h.bestStreak >= h.currentStreak)).toBe(true);
    expect(view.categories.map((c) => c.category)).toEqual(["body", "mind", "discipline"]);
  });

  it("insights unlocked, finalised days only", () => {
    expect(view.insights.unlocked).toBe(true);
    expect(view.insights.items.some((i) => i.kind === "weakest_habit")).toBe(true);
    expect(view.insights.items.some((i) => i.kind === "streak_risk")).toBe(false);
  });
});

describe("filters and states", () => {
  it("TC45: chapter filter shows November only", () => {
    const view = dashboard("day23", { kind: "chapter", index: 2 });
    expect(view.filter).toEqual({ kind: "chapter", index: 2 });
    expect(view.heatmap).toHaveLength(30);
    expect(view.heatmap.every((c) => c.level === "future")).toBe(true);
    expect(view.trend).toEqual([]);
    expect(view.habits.every((h) => h.completion === null)).toBe(true);
    // Section A stays the current state
    expect(view.tiles.today.score).toBe(70);
  });

  it("October filter: 31 cells, completion from finalised October days", () => {
    const view = dashboard("day23", { kind: "chapter", index: 1 });
    expect(view.heatmap).toHaveLength(31);
    expect(view.habits.every((h) => h.counted <= 22)).toBe(true);
  });

  it("an unknown chapter falls back to the whole arc", () => {
    expect(dashboard("day23", { kind: "chapter", index: 9 }).filter).toEqual({ kind: "arc" });
  });

  it("TC43: Day 1 — insights locked", () => {
    const view = dashboard("day-1");
    expect(view.insights).toEqual({ unlocked: false, unlockDay: 7, items: [] });
    expect(view.tiles.strongDays).toEqual({ count: 0, finalised: 0 });
    expect(view.tiles.week.change).toBeNull();
  });

  it("streak risk insight when yesterday was weak", () => {
    const view = dashboard("at-risk");
    expect(view.insights.items[0]).toEqual({ kind: "streak_risk", threshold: 80, habitsNeeded: 1 });
  });

  it("countdown and no arc", () => {
    const c = scenario("countdown");
    expect(buildDashboardView(c.data, c.now)).toMatchObject({
      kind: "countdown",
      daysUntilStart: 9,
    });
    expect(buildDashboardView(null, c.now)).toEqual({ kind: "no_arc" });
  });
});
