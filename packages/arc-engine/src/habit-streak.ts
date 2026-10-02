import type { EntryStatus } from "./types";

export type HabitStreak = {
  current: number;
  best: number;
  /** Last decided day was a single Missed: one more resets the streak. */
  atRisk: boolean;
};

/**
 * Per-habit streak over daily statuses in date order (MASTER_DOC §8, assumption A2):
 * Done/Minimum +1; Rest and Sick hold (skipped); one Missed = at risk;
 * two Missed in a row = reset. Unlogged (still pending) is skipped.
 */
export function computeHabitStreak(statuses: readonly EntryStatus[]): HabitStreak {
  let current = 0;
  let best = 0;
  let missRun = 0;

  for (const status of statuses) {
    switch (status) {
      case "done":
      case "minimum":
        current += 1;
        best = Math.max(best, current);
        missRun = 0;
        break;
      case "missed":
        missRun += 1;
        if (missRun >= 2) current = 0;
        break;
      case "rest":
      case "sick":
      case "unlogged":
        break;
    }
  }

  return { current, best, atRisk: missRun === 1 };
}
