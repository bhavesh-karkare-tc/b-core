import { habitsFromTemplate, WINTER_ARC_TEMPLATE } from "../templates";
import type { Habit, HabitEntry, ISODate, ManualStatus } from "../types";

/** The 10 default habits with stable ids h1…h10. */
export const defaultHabits: Habit[] = habitsFromTemplate(
  "arc-1",
  WINTER_ARC_TEMPLATE,
  (_, i) => `h${i + 1}`,
);

export function habit(name: string): Habit {
  const found = defaultHabits.find((h) => h.name === name);
  if (!found) throw new Error(`No default habit named ${name}`);
  return found;
}

export function entry(
  habitId: string,
  date: ISODate,
  patch: Partial<Omit<HabitEntry, "habitId" | "date">> & { status?: ManualStatus } = {},
): HabitEntry {
  return {
    habitId,
    date,
    status: "unlogged",
    value: null,
    loggedTime: null,
    durationMin: null,
    updatedAt: `${date}T12:00:00.000Z`,
    source: "manual",
    ...patch,
  };
}
