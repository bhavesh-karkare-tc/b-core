import {
  chapterTotals,
  evaluateArc,
  generateChapters,
  WINTER_ARC_TEMPLATE,
  type Habit,
} from "@b-core/arc-engine";
import { describe, expect, it } from "vitest";
import { SCENARIOS } from "../mock/scenarios";
import { seedScenario } from "../mock/seed";
import { buildDayDetail, buildTrackerView } from "../view-models";
import { arcData, at, TZ } from "./build";

function scenarioData(id: (typeof SCENARIOS)[number]["id"]) {
  const state = seedScenario(id, TZ);
  const data = state.arcs.find((a) => a.arc.id === state.activeArcId) ?? null;
  return { data, now: new Date(state.now) };
}

function tracker(id: (typeof SCENARIOS)[number]["id"], chapter?: number) {
  const { data, now } = scenarioData(id);
  const view = buildTrackerView(data, now, chapter);
  if (view.kind !== "tracker") throw new Error(view.kind);
  return view;
}

describe("Sprint 4 done-when: tracker numbers match the engine for every seeded day", () => {
  for (const s of SCENARIOS) {
    it(`${s.id}: every row, cell and chapter total equals engine output`, () => {
      const { data, now } = scenarioData(s.id);
      if (!data) {
        expect(buildTrackerView(data, now).kind).toBe("no_arc");
        return;
      }
      const evaluated = evaluateArc({ ...data, now });
      const byDate = new Map(evaluated.map((d) => [d.date, d]));
      for (const chapter of generateChapters(data.arc.startDate, data.arc.durationDays)) {
        const view = buildTrackerView(data, now, chapter.index);
        if (view.kind !== "tracker") throw new Error(view.kind);
        expect(view.rows).toHaveLength(chapter.days);
        for (const row of view.rows) {
          const ev = byDate.get(row.date);
          expect(row.score).toBe(ev ? ev.score : null);
          for (const cell of row.cells) {
            const entry = ev?.entries.find((e) => e.habitId === cell.habitId);
            if (entry) expect([cell.state, cell.points]).toEqual([entry.status, entry.points]);
            else expect(["future", "rest", "none"]).toContain(cell.state);
          }
        }
        const [engine] = chapterTotals(evaluated, [chapter]);
        expect(view.totals.total).toBe(engine?.total);
        expect(view.totals.total).toBe(view.rows.reduce((sum, r) => sum + (r.score ?? 0), 0));
        expect(view.totals.max).toBe(chapter.days * 100);
      }
    });
  }
});

describe("tracker view", () => {
  it("Day 23 mockup: October, 31 rows, 10 columns, so far out of 2,300", () => {
    const view = tracker("day23");
    expect(view.chapter).toMatchObject({ index: 1, label: "October", started: true });
    expect(view.chapters.map((c) => [c.label, c.started])).toEqual([
      ["October", true],
      ["November", false],
      ["December", false],
    ]);
    expect(view.columns.map((c) => c.number)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
    ]);
    expect(view.rows).toHaveLength(31);
    expect(view.totals.maxSoFar).toBe(2300);
    expect(view.rows[22]).toMatchObject({
      date: "2026-10-23",
      isToday: true,
      editable: true,
      final: false,
      weekday: "Fr",
    });
  });

  it("yesterday is final at 15:00 (past noon); older days locked", () => {
    const rows = tracker("day23").rows;
    expect(rows[21]).toMatchObject({ date: "2026-10-22", final: true, editable: false });
  });

  it("yesterday stays editable before noon", () => {
    const rows = tracker("yesterday-unlogged").rows;
    expect(rows[21]).toMatchObject({ date: "2026-10-22", final: false, editable: true });
    expect(rows[21]?.cells.filter((c) => c.state === "unlogged")).toHaveLength(2);
  });

  it("future days: dashed, with scheduled Rest still shown (Sun 25 Oct MMA)", () => {
    const sunday = tracker("day23").rows[24];
    expect(sunday).toMatchObject({ date: "2026-10-25", future: true, score: null });
    expect(sunday?.cells[3]?.state).toBe("rest");
    expect(sunday?.cells[0]?.state).toBe("future");
  });

  it("a sick day row", () => {
    const row = tracker("day23").rows[8];
    expect(row).toMatchObject({ date: "2026-10-09", isSick: true, score: null });
    expect(row?.cells.every((c) => c.state === "sick")).toBe(true);
  });

  it("future chapter: nothing reached yet", () => {
    const view = tracker("day23", 2);
    expect(view.chapter.label).toBe("November");
    expect(view.totals).toMatchObject({ total: 0, maxSoFar: 0, max: 3000 });
    expect(view.rows.every((r) => r.future)).toBe(true);
  });

  it("countdown arc shows its first chapter, all future", () => {
    const view = tracker("countdown");
    expect(view.chapter.label).toBe("November");
    expect(view.rows.every((r) => r.future)).toBe(true);
  });

  it("an unknown chapter index falls back to the current chapter", () => {
    expect(tracker("day23", 9).chapter.index).toBe(1);
  });

  it("after the arc ends it shows the last chapter", () => {
    const data = arcData();
    const view = buildTrackerView(data, at("2027-01-05", "10:00"));
    expect(view.kind === "tracker" && view.chapter.label).toBe("December");
  });

  it("a habit added later shows as 'none' before it existed", () => {
    const data = arcData();
    const extra: Habit = {
      ...(WINTER_ARC_TEMPLATE[1] as Habit),
      id: "late",
      arcId: "arc-1",
      order: 11,
      name: "Cold Shower",
    };
    data.habitVersions.push({ habitId: "late", validFrom: "2026-10-10", habit: extra });
    const view = buildTrackerView(data, at("2026-10-23", "15:00"));
    if (view.kind !== "tracker") throw new Error(view.kind);
    expect(view.columns.at(-1)?.name).toBe("Cold Shower");
    expect(view.rows[0]?.cells.at(-1)?.state).toBe("none");
    expect(view.rows[9]?.cells.at(-1)?.state).toBe("missed");
  });

  it("journal and mood come through for closed days", () => {
    const row = tracker("day23").rows[0];
    expect(row?.journal).toBeTruthy();
    expect(row?.mood).toBe(4);
  });
});

describe("day detail", () => {
  it("strong day grows the streak", () => {
    const { data, now } = scenarioData("day23");
    if (!data) throw new Error("data");
    expect(buildDayDetail(data, "2026-10-22", now)).toMatchObject({
      chapterIndex: 1,
      streakEffect: "grows",
      streakAfter: { current: 9, state: "safe" },
      day: { date: "2026-10-22", final: true, editWindow: { editable: false, reason: "closed" } },
    });
  });

  it("second weak day breaks; sick day freezes; first weak is at risk", () => {
    const { data, now } = scenarioData("day23");
    if (!data) throw new Error("data");
    expect(buildDayDetail(data, "2026-10-07", now)?.streakEffect).toBe("at_risk");
    expect(buildDayDetail(data, "2026-10-09", now)?.streakEffect).toBe("frozen");
    expect(buildDayDetail(data, "2026-10-12", now)?.streakEffect).toBe("broken");
    expect(buildDayDetail(data, "2026-10-13", now)?.streakEffect).toBe("holds");
  });

  it("is null for days not reached", () => {
    const { data, now } = scenarioData("day23");
    if (!data) throw new Error("data");
    expect(buildDayDetail(data, "2026-10-24", now)).toBeNull();
    expect(buildDayDetail(data, "2026-09-30", now)).toBeNull();
  });
});
