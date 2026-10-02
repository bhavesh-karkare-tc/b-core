import type { EntryStatus, RankName } from "./types";

/** Default arc length in days (MASTER_DOC §4). */
export const ARC_DEFAULT_DAYS = 92;

/** Points per status (MASTER_DOC §8). Sick is not counted (null). */
export const POINTS: Record<EntryStatus, number | null> = {
  done: 10,
  minimum: 5,
  rest: 10,
  missed: 0,
  unlogged: 0,
  sick: null,
};

export const MAX_POINTS_PER_HABIT = 10;

export const DEFAULT_THRESHOLD = 80;
export const THRESHOLD_MIN = 60;
export const THRESHOLD_MAX = 100;

/** One shield per this many consecutive strong days. */
export const SHIELD_EVERY = 7;
export const MAX_SHIELDS = 2;

/** A day stays editable until this hour (arc timezone) on the next day. */
export const CUTOFF_HOUR = 12;

/** Habit type, target and schedule lock after the end of this arc day. */
export const LOCK_AFTER_DAY = 3;

/** One sick day per this many arc days (92 → 3). */
export const DAYS_PER_SICK_DAY = 30;

export const MIN_HABITS = 3;
export const MAX_HABITS = 10;
export const HABIT_NAME_MAX = 30;
export const JOURNAL_MAX = 140;

/** Rank thresholds for a 92-day arc (MASTER_DOC §9). Ascending. */
export const RANKS: readonly { name: RankName; points: number }[] = [
  { name: "Recruit", points: 0 },
  { name: "Fighter", points: 1000 },
  { name: "Contender", points: 2500 },
  { name: "Warrior", points: 4500 },
  { name: "Champion", points: 6500 },
  { name: "Legend", points: 8000 },
];
