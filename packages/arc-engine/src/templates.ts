import type { Habit } from "./types";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** A habit before it belongs to an arc (setup templates, habit editor). */
export type HabitDraft = DistributiveOmit<Habit, "id" | "arcId">;

const MON_TO_SAT = [1, 2, 3, 4, 5, 6] as const;

/** Winter Arc default template: the 10 habits from the tracker sheet (MASTER_DOC §4). */
export const WINTER_ARC_TEMPLATE: readonly HabitDraft[] = [
  {
    order: 1,
    name: "3L Water",
    type: "count",
    category: "body",
    target: 3000,
    minimum: 2000,
    unit: "ml",
    step: 250,
    minimumText: "2L",
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  },
  {
    order: 2,
    name: "No Junk",
    type: "yesno",
    category: "body",
    hasMinimum: true,
    minimumText: "One junk item only",
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  },
  {
    order: 3,
    name: "Phone Off by 12 AM",
    type: "time",
    category: "discipline",
    target: "00:00",
    minimum: "00:30",
    minimumText: "Off by 12:30 AM",
    schedule: { kind: "daily" },
    reminderTime: "23:45",
    status: "active",
  },
  {
    order: 4,
    name: "MMA Training",
    type: "session",
    category: "body",
    hasMinimum: true,
    minimumText: "15 min shadow boxing",
    schedule: { kind: "weekdays", days: [...MON_TO_SAT] },
    reminderTime: null,
    status: "active",
  },
  {
    order: 5,
    name: "10k Steps Outside",
    type: "count",
    category: "body",
    target: 10000,
    minimum: 6000,
    unit: "steps",
    step: 1000,
    minimumText: "6,000 steps",
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  },
  {
    order: 6,
    name: "Read 10 Pages",
    type: "count",
    category: "mind",
    target: 10,
    minimum: 3,
    unit: "pages",
    step: 1,
    minimumText: "3 pages",
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  },
  {
    order: 7,
    name: "No Phone at Meals",
    type: "yesno",
    category: "discipline",
    hasMinimum: true,
    minimumText: "2 of 3 meals",
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  },
  {
    order: 8,
    name: "Top 3 Tasks Done",
    type: "checklist",
    category: "mind",
    items: 3,
    minimum: 1,
    minimumText: "1 of 3",
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  },
  {
    order: 9,
    name: "Skin Care",
    type: "yesno",
    category: "body",
    hasMinimum: true,
    minimumText: "Face wash only",
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  },
  {
    order: 10,
    name: "No P",
    type: "yesno",
    category: "discipline",
    hasMinimum: false,
    minimumText: null,
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  },
];

/** Give template drafts ids and an arc id. */
export function habitsFromTemplate(
  arcId: string,
  drafts: readonly HabitDraft[],
  makeId: (draft: HabitDraft, index: number) => string,
): Habit[] {
  return drafts.map((draft, index) => ({ ...draft, id: makeId(draft, index), arcId }) as Habit);
}
