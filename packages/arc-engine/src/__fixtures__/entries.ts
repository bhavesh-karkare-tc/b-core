import { POINTS } from "../constants";
import type { EntryStatus, ResolvedEntry } from "../types";

/** Resolved entries from a list of statuses (ids h1…). */
export function resolved(statuses: readonly EntryStatus[], provisional = false): ResolvedEntry[] {
  return statuses.map((status, i) => ({
    habitId: `h${i + 1}`,
    status,
    points: POINTS[status],
    provisional,
    paused: false,
  }));
}

/** `n` copies of a status. */
export function times(n: number, status: EntryStatus): EntryStatus[] {
  return Array.from({ length: n }, () => status);
}
