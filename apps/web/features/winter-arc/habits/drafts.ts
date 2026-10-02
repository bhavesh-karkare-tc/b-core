import type { HabitDraft, HabitSchedule, HabitType } from "@/data";

type Common = Pick<
  HabitDraft,
  "name" | "category" | "schedule" | "minimumText" | "reminderTime" | "order" | "status"
>;

/** Re-shape a draft for another type, keeping the shared fields (name, category, schedule…). */
export function draftForType(type: HabitType, from: HabitDraft): HabitDraft {
  const common: Common = {
    name: from.name,
    category: from.category,
    schedule: from.schedule,
    minimumText: from.minimumText,
    reminderTime: from.reminderTime,
    order: from.order,
    status: from.status,
  };
  switch (type) {
    case "yesno":
      return { ...common, type, hasMinimum: true };
    case "session":
      return { ...common, type, hasMinimum: true };
    case "count":
      return { ...common, type, target: 10, minimum: 5, unit: "reps", step: 1 };
    case "time":
      return { ...common, type, target: "22:00", minimum: "22:30" };
    case "checklist":
      return { ...common, type, items: 3, minimum: 1 };
  }
}

/** A new blank habit for the editor. */
export function newHabitDraft(order: number): HabitDraft {
  return {
    order,
    name: "",
    type: "yesno",
    category: "body",
    hasMinimum: true,
    minimumText: "",
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  };
}

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/** "Daily", "Mon–Sat", "Mon, Wed, Fri", "4× per week". */
export function describeSchedule(schedule: HabitSchedule): string {
  switch (schedule.kind) {
    case "daily":
      return "Daily";
    case "perWeek":
      return `${schedule.times}× per week`;
    case "weekdays": {
      const days = [...schedule.days].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
      if (days.length === 7) return "Daily";
      const monFirst = days.map((d) => (d + 6) % 7);
      const consecutive = monFirst.every((d, i) => i === 0 || d === (monFirst[i - 1] ?? -2) + 1);
      if (consecutive && days.length > 2) {
        return `${DAY_SHORT[days[0] ?? 0]}–${DAY_SHORT[days.at(-1) ?? 0]}`;
      }
      return days.map((d) => DAY_SHORT[d]).join(", ");
    }
  }
}

const fmt = new Intl.NumberFormat("en-US");

/** One-line summary: "Count · 3,000 ml", "Time · by 00:00", "Checklist · 3 items". */
export function describeHabit(d: HabitDraft): string {
  switch (d.type) {
    case "yesno":
      return "Yes / no";
    case "session":
      return "Session";
    case "count":
      return `Count · ${fmt.format(d.target)} ${d.unit}`;
    case "time":
      return `Time · by ${d.target}`;
    case "checklist":
      return `Checklist · ${d.items} items`;
  }
}

export const TYPE_LABEL: Record<HabitType, string> = {
  yesno: "Yes / no",
  count: "Count",
  time: "Time",
  session: "Session",
  checklist: "Checklist",
};

export const CATEGORY_LABEL = { body: "Body", mind: "Mind", discipline: "Discipline" } as const;

export { DAY_SHORT };
