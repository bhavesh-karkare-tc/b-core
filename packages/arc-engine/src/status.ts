import { POINTS } from "./constants";
import { nightMinutes } from "./timezone";
import type { EntryStatus, Habit, HabitEntry, ResolvedEntry } from "./types";

export type ResolveInput = {
  habit: Habit;
  entry: HabitEntry | undefined;
  /** True once the day passed its cutoff: pending statuses become final. */
  final: boolean;
  /** Sick day: every habit is Sick and not counted. */
  isSick: boolean;
  /** Unscheduled day (weekday schedule) — always Rest, cannot be changed. */
  restDay: boolean;
  /** Per-week habit whose quota is still reachable without today (rule R4). */
  perWeekRest?: boolean;
};

/**
 * Resolve one habit on one day to a status and points (MASTER_DOC §7, §8, E12–E14).
 * Before cutoff, unlogged stays pending and value-based Minimum is provisional (R3);
 * at cutoff (`final`), pending becomes Missed.
 */
export function resolveEntry(input: ResolveInput): ResolvedEntry {
  const { habit, entry, final } = input;
  const make = (status: EntryStatus, provisional = false, paused = false): ResolvedEntry => ({
    habitId: habit.id,
    status,
    points: POINTS[status],
    provisional: provisional && !final,
    paused,
  });

  if (input.isSick) return make("sick");
  if (habit.status === "paused") return make("rest", false, true);
  if (input.restDay) return make("rest");
  if (entry?.status === "missed") return make("missed");

  const logged = loggedStatus(habit, entry);
  if (logged.status !== "unlogged") return make(logged.status, logged.provisional);

  if (input.perWeekRest) return make("rest", true);
  return final ? make("missed") : make("unlogged", true);
}

type Logged = { status: EntryStatus; provisional: boolean };

const UNLOGGED: Logged = { status: "unlogged", provisional: true };

/** Status from what the user logged, ignoring rest/sick/cutoff. */
function loggedStatus(habit: Habit, entry: HabitEntry | undefined): Logged {
  if (!entry) return UNLOGGED;

  switch (habit.type) {
    case "yesno":
    case "session":
      if (entry.status === "done") return { status: "done", provisional: false };
      if (entry.status === "minimum") {
        // A "No minimum" habit can only be Done or Missed (TC19).
        return { status: habit.hasMinimum ? "minimum" : "missed", provisional: false };
      }
      return UNLOGGED;

    case "count":
      return byValue(entry.value, habit.target, habit.minimum);

    case "checklist":
      return byValue(entry.value, habit.items, habit.minimum);

    case "time": {
      if (entry.loggedTime === null) return UNLOGGED; // E13: Missed at cutoff
      const logged = nightMinutes(entry.loggedTime);
      if (logged <= nightMinutes(habit.target)) return { status: "done", provisional: false };
      if (habit.minimum !== null && logged <= nightMinutes(habit.minimum)) {
        return { status: "minimum", provisional: false };
      }
      return { status: "missed", provisional: false };
    }
  }
}

/** Count/checklist: target → Done (E12), minimum → provisional Minimum (R3), below → pending. */
function byValue(value: number | null, target: number, minimum: number | null): Logged {
  const v = value ?? 0;
  if (v >= target) return { status: "done", provisional: false };
  if (minimum !== null && v > 0 && v >= minimum) return { status: "minimum", provisional: true };
  return UNLOGGED;
}
