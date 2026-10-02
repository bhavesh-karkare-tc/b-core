/**
 * Winter Arc domain types (MASTER_DOC §4, §14).
 * Engine-facing shapes: the data layer maps database rows to these.
 */

/** Calendar day in the arc's timezone, `YYYY-MM-DD`. */
export type ISODate = string;

/** Wall-clock time, `HH:mm` (24h). */
export type ClockTime = string;

/** 0 = Sunday … 6 = Saturday (same as `Date#getDay`). */
export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HabitType = "yesno" | "count" | "time" | "session" | "checklist";

export type Category = "body" | "mind" | "discipline";

export type EntryStatus = "done" | "minimum" | "missed" | "rest" | "sick" | "unlogged";

/** Statuses a user can set by hand (status sheet). Rest and Sick are never set per habit. */
export type ManualStatus = "done" | "minimum" | "missed" | "unlogged";

export type EntrySource = "manual" | "auto" | "cutoff";

export type HabitSchedule =
  | { kind: "daily" }
  | { kind: "weekdays"; days: Weekday[] }
  /** X days per week, "rest while you still can" (rule R4). */
  | { kind: "perWeek"; times: number };

type HabitBase = {
  id: string;
  arcId: string;
  /** Display order on Today and in reports. */
  order: number;
  name: string;
  category: Category;
  schedule: HabitSchedule;
  /** Free-text description of the minimum version, e.g. "Face wash only". */
  minimumText: string | null;
  reminderTime: ClockTime | null;
  status: "active" | "paused";
};

export type YesNoHabit = HabitBase & {
  type: "yesno";
  /** false = "No minimum": only Done or Missed (e.g. No P). */
  hasMinimum: boolean;
};

export type SessionHabit = HabitBase & {
  type: "session";
  hasMinimum: boolean;
};

export type CountHabit = HabitBase & {
  type: "count";
  target: number;
  /** null = no minimum: below target is Missed. */
  minimum: number | null;
  unit: string;
  /** Quick-add step, e.g. 250 ml. */
  step: number;
};

export type TimeHabit = HabitBase & {
  type: "time";
  /** Done if logged at or before this time (night clock, see `nightMinutes`). */
  target: ClockTime;
  /** Minimum if logged at or before this time; null = no minimum. */
  minimum: ClockTime | null;
};

export type ChecklistHabit = HabitBase & {
  type: "checklist";
  /** Number of sub-items; Done when all are ticked. */
  items: number;
  /** Ticked count that earns Minimum; null = no minimum. */
  minimum: number | null;
};

export type Habit = YesNoHabit | SessionHabit | CountHabit | TimeHabit | ChecklistHabit;

/** Full habit snapshot valid from a date (edits after lock start a new version, E7). */
export type HabitVersion = {
  habitId: string;
  validFrom: ISODate;
  habit: Habit;
};

export type ArcStatus = "upcoming" | "active" | "completed" | "abandoned";

export type Arc = {
  id: string;
  startDate: ISODate;
  durationDays: number;
  /** IANA timezone fixed at setup; decides day boundaries and cutoff (E2). */
  timeZone: string;
  /** Strong-day threshold, 60–100 (default 80). */
  strongThreshold: number;
  myWhy: string;
  status: ArcStatus;
  sickDaysUsed: number;
};

export type Chapter = {
  /** 1-based chapter number. */
  index: number;
  /** `YYYY-MM`. */
  month: string;
  startDate: ISODate;
  endDate: ISODate;
  days: number;
};

/** What the user recorded for one habit on one day. */
export type HabitEntry = {
  habitId: string;
  date: ISODate;
  /**
   * Status set by hand. For yesno/session this is the status. For count/time/checklist
   * the status is derived from the value, except an explicit "missed".
   */
  status: ManualStatus;
  /** Count value, or ticked checklist items. */
  value: number | null;
  /** Logged clock time for time habits. */
  loggedTime: ClockTime | null;
  durationMin: number | null;
  /** ISO instant of the last change. */
  updatedAt: string;
  source: EntrySource;
};

export type DayLog = {
  arcId: string;
  date: ISODate;
  isSick: boolean;
  journal: string | null;
  /** 1–5. */
  mood: number | null;
};

/** Entry after applying schedule, sick day and type rules. */
export type ResolvedEntry = {
  habitId: string;
  status: EntryStatus;
  /** null when not counted (sick). */
  points: number | null;
  /** True while the status can still change before cutoff (rule R3). */
  provisional: boolean;
  /** Rest because the habit is paused (labelled "Paused" in reports). */
  paused: boolean;
};

export type StreakStateName = "safe" | "at_risk" | "shielded" | "broken";

export type StreakState = {
  current: number;
  best: number;
  state: StreakStateName;
  shieldsHeld: number;
  lastStrongDate: ISODate | null;
};

export type BodyCheck = {
  id: string;
  arcId: string;
  date: ISODate;
  weightKg: number | null;
  waistCm: number | null;
  pushupsMax: number | null;
  /** 1–10. */
  energy: number | null;
  photoUrl: string | null;
};

export type RankName = "Recruit" | "Fighter" | "Contender" | "Warrior" | "Champion" | "Legend";

/** One evaluated day: resolved entries + score. */
export type DayResult = {
  date: ISODate;
  entries: ResolvedEntry[];
  /** 0–100, or null when nothing is counted (sick day). */
  score: number | null;
  isSick: boolean;
  isStrong: boolean;
  /** Counted and below the threshold. Sick days are neither strong nor weak. */
  isWeak: boolean;
  /** Every counted habit was Rest (E8). */
  recoveryDay: boolean;
  /** Some entry may still change before cutoff. */
  provisional: boolean;
};

export type HeatLevel = 0 | 1 | 2 | 3 | 4 | "sick";
