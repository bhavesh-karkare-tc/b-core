import type { EntryStatus } from "./types";

export type Completion = {
  /** (done + rest + 0.5 × minimum) / counted days, 0–1; null with no counted days. */
  ratio: number | null;
  done: number;
  minimum: number;
  rest: number;
  missed: number;
  /** Days in the denominator: sick and still-pending (unlogged) days are excluded. */
  counted: number;
};

/** Habit completion % over a list of daily statuses (MASTER_DOC §8, assumption A3). */
export function habitCompletion(statuses: readonly EntryStatus[]): Completion {
  const c = { done: 0, minimum: 0, rest: 0, missed: 0 };
  for (const s of statuses) {
    if (s === "sick" || s === "unlogged") continue;
    c[s] += 1;
  }
  const counted = c.done + c.minimum + c.rest + c.missed;
  const ratio = counted ? (c.done + c.rest + 0.5 * c.minimum) / counted : null;
  return { ratio, ...c, counted };
}
