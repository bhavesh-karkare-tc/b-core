import { WINTER_ARC_TEMPLATE } from "@b-core/arc-engine";
import { describe, expect, it } from "vitest";
import type { SetupContext } from "@/data";
import { habitsStepIssue, initialDraft, renumber, templateHabits } from "./setup-draft";

const ctx = {
  templates: { default: [...WINTER_ARC_TEMPLATE], previous: WINTER_ARC_TEMPLATE.slice(0, 4) },
} as unknown as SetupContext;

describe("setup draft helpers", () => {
  it("starts at step 1 with 92 days and threshold 80", () => {
    expect(initialDraft()).toMatchObject({
      step: 1,
      durationDays: 92,
      strongThreshold: 80,
      habits: [],
    });
  });

  it("templates: default, blank, previous (copied)", () => {
    expect(templateHabits(ctx, "default")).toHaveLength(10);
    expect(templateHabits(ctx, "blank")).toEqual([]);
    expect(templateHabits(ctx, "previous")).toHaveLength(4);
    expect(templateHabits(ctx, "default")[0]).not.toBe(WINTER_ARC_TEMPLATE[0]);
  });

  it("renumber keeps order = position", () => {
    expect(renumber(WINTER_ARC_TEMPLATE.slice(3, 6)).map((h) => h.order)).toEqual([1, 2, 3]);
  });

  it("TC02: fewer than 3 habits blocks the step", () => {
    expect(habitsStepIssue(WINTER_ARC_TEMPLATE.slice(0, 2))).toBe("Add at least 3 habits");
    expect(habitsStepIssue([...WINTER_ARC_TEMPLATE])).toBeNull();
    const broken = [...WINTER_ARC_TEMPLATE.slice(0, 3), { ...WINTER_ARC_TEMPLATE[1], name: "" }];
    expect(habitsStepIssue(broken as never)).toBe('Fix "Untitled" before continuing');
  });
});
