import { arcEndDate } from "./chapters";
import {
  HABIT_NAME_MAX,
  LOCK_AFTER_DAY,
  MAX_HABITS,
  MIN_HABITS,
  THRESHOLD_MAX,
  THRESHOLD_MIN,
} from "./constants";
import { addDays, monthEnd } from "./dates";
import { isArcLocked } from "./cutoff";
import { localDate, nightMinutes } from "./timezone";
import type { HabitDraft } from "./templates";
import type { Arc, ISODate } from "./types";

/** Arc lengths offered at setup (MASTER_DOC §6). */
export const ARC_DURATIONS = [30, 60, 92] as const;
export const MY_WHY_MIN = 10;
export const MY_WHY_MAX_LINES = 3;
export const MY_WHY_MAX = 240;
export const UNIT_MAX = 12;

export type HabitField =
  | "name"
  | "reminderTime"
  | "minimumText"
  | "type"
  | "category"
  | "target"
  | "minimum"
  | "unit"
  | "step"
  | "items"
  | "schedule";

/** Every editable habit field, in editor order. */
export const HABIT_FIELDS: readonly HabitField[] = [
  "name",
  "reminderTime",
  "minimumText",
  "type",
  "category",
  "target",
  "minimum",
  "unit",
  "step",
  "items",
  "schedule",
];

export type HabitIssue = { field: HabitField; message: string };

/** Habit name as typed: input stops at 30 characters (TC04). */
export function clampHabitName(name: string): string {
  return [...name].slice(0, HABIT_NAME_MAX).join("");
}

/** Field-level problems with one habit draft; empty when valid. */
export function validateHabitDraft(d: HabitDraft): HabitIssue[] {
  const issues: HabitIssue[] = [];
  const name = d.name.trim();
  if (name.length === 0) issues.push({ field: "name", message: "Give the habit a name" });
  if ([...name].length > HABIT_NAME_MAX) {
    issues.push({ field: "name", message: `Keep the name to ${HABIT_NAME_MAX} characters` });
  }

  switch (d.schedule.kind) {
    case "weekdays":
      if (d.schedule.days.length === 0)
        issues.push({ field: "schedule", message: "Pick at least one day" });
      break;
    case "perWeek":
      if (!Number.isInteger(d.schedule.times) || d.schedule.times < 1 || d.schedule.times > 6) {
        issues.push({ field: "schedule", message: "Choose 1 to 6 days per week" });
      }
      break;
    case "daily":
      break;
  }

  switch (d.type) {
    case "yesno":
    case "session":
      if (d.hasMinimum && !d.minimumText?.trim()) {
        issues.push({ field: "minimumText", message: "Describe the minimum version" });
      }
      break;
    case "count":
      if (!Number.isInteger(d.target) || d.target < 1) {
        issues.push({ field: "target", message: "Target must be a whole number above 0" });
      }
      if (
        d.minimum !== null &&
        (!Number.isInteger(d.minimum) || d.minimum < 1 || d.minimum >= d.target)
      ) {
        issues.push({ field: "minimum", message: "Minimum must be above 0 and below the target" });
      }
      if (!Number.isInteger(d.step) || d.step < 1 || d.step > d.target) {
        issues.push({ field: "step", message: "Quick-add step must be between 1 and the target" });
      }
      if (!d.unit.trim() || d.unit.length > UNIT_MAX) {
        issues.push({ field: "unit", message: `Add a unit (up to ${UNIT_MAX} characters)` });
      }
      break;
    case "checklist":
      if (!Number.isInteger(d.items) || d.items < 1 || d.items > MAX_HABITS) {
        issues.push({ field: "items", message: `Use 1 to ${MAX_HABITS} items` });
      }
      if (
        d.minimum !== null &&
        (!Number.isInteger(d.minimum) || d.minimum < 1 || d.minimum >= d.items)
      ) {
        issues.push({
          field: "minimum",
          message: "Minimum must be at least 1 and below the item count",
        });
      }
      break;
    case "time":
      if (d.minimum !== null && nightMinutes(d.minimum) <= nightMinutes(d.target)) {
        issues.push({ field: "minimum", message: "Minimum time must be later than the target" });
      }
      break;
  }
  return issues;
}

export type HabitListIssue = { kind: "too_few" | "too_many"; message: string };

/** List-level rules: 3 to 10 habits (TC02, TC03). */
export function validateHabitList(count: number): HabitListIssue | null {
  if (count < MIN_HABITS) return { kind: "too_few", message: `Add at least ${MIN_HABITS} habits` };
  if (count > MAX_HABITS) return { kind: "too_many", message: `Keep it to ${MAX_HABITS} habits` };
  return null;
}

/** The Add button hides at 10 habits (TC03). */
export function canAddHabit(count: number): boolean {
  return count < MAX_HABITS;
}

/** My Why: required, at least 10 characters, up to 3 lines (MASTER_DOC §6, TC05). */
export function validateMyWhy(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length < MY_WHY_MIN) return `Write at least ${MY_WHY_MIN} characters`;
  if (trimmed.split("\n").length > MY_WHY_MAX_LINES) return `Keep it to ${MY_WHY_MAX_LINES} lines`;
  if (trimmed.length > MY_WHY_MAX) return `Keep it under ${MY_WHY_MAX} characters`;
  return null;
}

export function isValidDuration(days: number): boolean {
  return (ARC_DURATIONS as readonly number[]).includes(days);
}

export function isValidThreshold(threshold: number): boolean {
  return Number.isInteger(threshold) && threshold >= THRESHOLD_MIN && threshold <= THRESHOLD_MAX;
}

/**
 * Start date choices (MASTER_DOC §6): today, or the next 1st of the month.
 * On the 1st itself both are today.
 */
export function startDateOptions(
  now: Date,
  timeZone: string,
): { today: ISODate; nextMonthStart: ISODate } {
  const today = localDate(now, timeZone);
  const nextMonthStart = today.endsWith("-01") ? today : addDays(monthEnd(today), 1);
  return { today, nextMonthStart };
}

/** A start date can be today or later, never in the past (no backfilling). */
export function isValidStartDate(startDate: ISODate, now: Date, timeZone: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(startDate) && startDate >= localDate(now, timeZone);
}

/** Fields that stay editable after the Day 3 lock (TC08, E7). */
export const FIELDS_AFTER_LOCK: readonly HabitField[] = ["name", "reminderTime"];

/** Whether a habit field can be edited now: everything before lock, rename + reminder after. */
export function isHabitFieldEditable(
  field: HabitField,
  arc: Pick<Arc, "startDate" | "durationDays" | "timeZone">,
  now: Date,
): boolean {
  return !isArcLocked(arc, now) || FIELDS_AFTER_LOCK.includes(field);
}

/** Habits can be added or removed only before lock (E6). */
export function canChangeHabitList(
  arc: Pick<Arc, "startDate" | "durationDays" | "timeZone">,
  now: Date,
): boolean {
  return !isArcLocked(arc, now);
}

/** Last day of the lock-free window, e.g. "editable until end of Day 3". */
export function lockDate(startDate: ISODate): ISODate {
  return addDays(startDate, LOCK_AFTER_DAY - 1);
}

/** End date shown at setup for a chosen start and length. */
export function plannedEndDate(startDate: ISODate, durationDays: number): ISODate {
  return arcEndDate(startDate, durationDays);
}
