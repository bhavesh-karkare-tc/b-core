import {
  DEFAULT_THRESHOLD,
  validateHabitDraft,
  validateHabitList,
  validateMyWhy,
} from "@b-core/arc-engine";
import type { HabitDraft, SetupContext, SetupDraft, TemplateId } from "@/data";

export const STEPS = [
  "Intro",
  "Template",
  "Habits",
  "Dates",
  "My Why",
  "Body check",
  "Commit",
] as const;
export const STEP_COUNT = STEPS.length;

export function initialDraft(): SetupDraft {
  return {
    step: 1,
    template: null,
    habits: [],
    startDate: null,
    durationDays: 92,
    strongThreshold: DEFAULT_THRESHOLD,
    myWhy: "",
    chapterTarget: "",
    bodyCheck: null,
    bodyCheckSkipped: false,
    commitName: "",
  };
}

/** Habits for a template choice (copies, so edits never touch the template). */
export function templateHabits(ctx: SetupContext, template: TemplateId): HabitDraft[] {
  if (template === "default") return ctx.templates.default.map((h) => ({ ...h }));
  if (template === "previous") return (ctx.templates.previous ?? []).map((h) => ({ ...h }));
  return [];
}

/** Keep `order` equal to list position (display order on Today). */
export function renumber(habits: HabitDraft[]): HabitDraft[] {
  return habits.map((h, i) => ({ ...h, order: i + 1 }));
}

/** Why the user can't continue from the habits step, or null. */
export function habitsStepIssue(habits: HabitDraft[]): string | null {
  const list = validateHabitList(habits.length);
  if (list) return list.message;
  const broken = habits.find((h) => validateHabitDraft(h).length > 0);
  return broken ? `Fix "${broken.name || "Untitled"}" before continuing` : null;
}

export function whyStepIssue(myWhy: string): string | null {
  return validateMyWhy(myWhy);
}
