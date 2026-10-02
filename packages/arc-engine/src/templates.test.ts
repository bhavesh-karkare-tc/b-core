import { describe, expect, it } from "vitest";
import { habitsFromTemplate, WINTER_ARC_TEMPLATE } from "./templates";

describe("WINTER_ARC_TEMPLATE", () => {
  it("TC01: has the 10 default habits in tracker-sheet order", () => {
    expect(WINTER_ARC_TEMPLATE.map((h) => h.name)).toEqual([
      "3L Water",
      "No Junk",
      "Phone Off by 12 AM",
      "MMA Training",
      "10k Steps Outside",
      "Read 10 Pages",
      "No Phone at Meals",
      "Top 3 Tasks Done",
      "Skin Care",
      "No P",
    ]);
    expect(WINTER_ARC_TEMPLATE.map((h) => h.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it("No P has no minimum; MMA rests on Sunday", () => {
    const noP = WINTER_ARC_TEMPLATE[9];
    expect(noP?.type === "yesno" && noP.hasMinimum).toBe(false);
    expect(WINTER_ARC_TEMPLATE[3]?.schedule).toEqual({
      kind: "weekdays",
      days: [1, 2, 3, 4, 5, 6],
    });
  });

  it("habitsFromTemplate assigns ids and arc id", () => {
    const habits = habitsFromTemplate("arc-9", WINTER_ARC_TEMPLATE.slice(0, 2), (_, i) => `x${i}`);
    expect(habits.map((h) => [h.id, h.arcId, h.name])).toEqual([
      ["x0", "arc-9", "3L Water"],
      ["x1", "arc-9", "No Junk"],
    ]);
  });
});
