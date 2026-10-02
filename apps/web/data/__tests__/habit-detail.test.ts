import { describe, expect, it } from "vitest";
import { buildDashboardView } from "../dashboard";
import { buildHabitDetail } from "../habit-detail";
import { seedScenario } from "../mock/seed";
import { buildTrackerView } from "../view-models";
import { TZ } from "./build";

const state = seedScenario("day23", TZ);
const data = state.arcs[0];
const now = new Date(state.now);
if (!data) throw new Error("seed");

describe("habit detail", () => {
  it("calendar cells equal the tracker column for that habit", () => {
    const tracker = buildTrackerView(data, now);
    if (tracker.kind !== "tracker") throw new Error(tracker.kind);
    for (const [col, column] of tracker.columns.entries()) {
      const detail = buildHabitDetail(data, column.habitId, now);
      expect(detail?.calendar.map((c) => c.state)).toEqual(
        tracker.rows.map((r) => r.cells[col]?.state),
      );
    }
  });

  it("completion and streaks equal the dashboard's habit stats (arc filter)", () => {
    const dash = buildDashboardView(data, now);
    if (dash.kind !== "dashboard") throw new Error(dash.kind);
    for (const h of dash.habits) {
      const detail = buildHabitDetail(data, h.habitId, now);
      expect([
        detail?.completion,
        detail?.currentStreak,
        detail?.bestStreak,
        detail?.minimumCount,
      ]).toEqual([h.completion, h.currentStreak, h.bestStreak, h.minimum]);
    }
  });

  it("count habit: values per reached day; MMA rests on Sundays", () => {
    const water = buildHabitDetail(data, "habit-1", now);
    expect(water?.values).toHaveLength(23);
    expect(water?.values?.at(-1)).toEqual({ date: "2026-10-23", value: 2250 });
    expect(water?.times).toBeNull();
    const mma = buildHabitDetail(data, "habit-4", now);
    expect(mma?.calendar.find((c) => c.date === "2026-10-25")?.state).toBe("rest");
    expect(mma?.values).toBeNull();
  });

  it("time habit: logged times; weeks from the arc's first Monday", () => {
    const phone = buildHabitDetail(data, "habit-3", now);
    expect(phone?.times?.[0]).toEqual({ date: "2026-10-01", loggedTime: "23:15" });
    expect(phone?.weeks.map((w) => w.weekStart)).toEqual([
      "2026-09-28",
      "2026-10-05",
      "2026-10-12",
      "2026-10-19",
    ]);
  });

  it("chapter switch and unknown habit", () => {
    const nov = buildHabitDetail(data, "habit-1", now, 2);
    expect(nov?.chapter.label).toBe("November");
    expect(nov?.calendar.every((c) => c.state === "future")).toBe(true);
    expect(nov?.values).toEqual([]);
    expect(buildHabitDetail(data, "nope", now)).toBeNull();
  });
});
