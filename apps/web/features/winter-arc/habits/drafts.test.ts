import { WINTER_ARC_TEMPLATE, validateHabitDraft } from "@b-core/arc-engine";
import { describe, expect, it } from "vitest";
import { describeHabit, describeSchedule, draftForType, newHabitDraft } from "./drafts";

describe("habit drafts (UI helpers)", () => {
  it("describeSchedule", () => {
    expect(describeSchedule({ kind: "daily" })).toBe("Daily");
    expect(describeSchedule({ kind: "weekdays", days: [1, 2, 3, 4, 5, 6] })).toBe("Mon–Sat");
    expect(describeSchedule({ kind: "weekdays", days: [5, 1, 3] })).toBe("Mon, Wed, Fri");
    expect(describeSchedule({ kind: "weekdays", days: [0, 1, 2, 3, 4, 5, 6] })).toBe("Daily");
    expect(describeSchedule({ kind: "weekdays", days: [6, 0] })).toBe("Sat, Sun");
    expect(describeSchedule({ kind: "perWeek", times: 4 })).toBe("4× per week");
  });

  it("describeHabit", () => {
    expect(WINTER_ARC_TEMPLATE.map(describeHabit)).toEqual([
      "Count · 3,000 ml",
      "Yes / no",
      "Time · by 00:00",
      "Session",
      "Count · 10,000 steps",
      "Count · 10 pages",
      "Yes / no",
      "Checklist · 3 items",
      "Yes / no",
      "Yes / no",
    ]);
  });

  it("type switches keep shared fields and produce valid defaults", () => {
    const base = { ...newHabitDraft(4), name: "Stretch", minimumText: "5 min" };
    for (const type of ["yesno", "count", "time", "session", "checklist"] as const) {
      const d = draftForType(type, base);
      expect(d).toMatchObject({ type, name: "Stretch", order: 4, schedule: { kind: "daily" } });
      expect(validateHabitDraft(d)).toEqual([]);
    }
  });

  it("a new draft needs a name", () => {
    expect(validateHabitDraft(newHabitDraft(1)).map((i) => i.field)).toEqual([
      "name",
      "minimumText",
    ]);
  });
});
