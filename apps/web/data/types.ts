/**
 * Data-layer contract: what the UI receives from `data/index.ts`.
 * Shapes are identical for the mock (Phase 1) and Supabase (Phase 2) implementations.
 */
import type {
  Arc,
  BodyCheck,
  ClockTime,
  DayLog,
  EditWindow,
  EntryStatus,
  Habit,
  HabitDraft,
  HabitEntry,
  HabitField,
  HabitVersion,
  ISODate,
  RankName,
  SickDayCheck,
  StreakStateName,
} from "@b-core/arc-engine";

export type {
  Arc,
  BodyCheck,
  ClockTime,
  EntryStatus,
  Habit,
  HabitDraft,
  HabitField,
  ISODate,
  ManualStatus,
  RankName,
  StreakStateName,
} from "@b-core/arc-engine";

export type ChecklistItem = { text: string; done: boolean };

/** Stored habit entry: engine entry plus UI detail (checklist item texts, session note). */
export type StoredEntry = HabitEntry & {
  checklist?: ChecklistItem[];
  note?: string | null;
};

/** Stored day log: engine day log plus close-the-day time. */
export type StoredDayLog = DayLog & { closedAt: string | null };

/** Everything stored for one arc. */
export type ArcData = {
  arc: Arc;
  habitVersions: HabitVersion[];
  entries: StoredEntry[];
  dayLogs: StoredDayLog[];
};

/** One arc as stored: scoring data plus setup extras. */
export type StoredArc = ArcData & {
  bodyChecks: BodyCheck[];
  /** Optional free-text target per chapter index. */
  chapterTargets: Record<number, string>;
  commitment: { name: string; committedAt: string } | null;
};

export type BodyCheckInput = {
  weightKg: number | null;
  waistCm: number | null;
  pushupsMax: number | null;
  /** 1–10. */
  energy: number | null;
};

export type TemplateId = "default" | "blank" | "previous";

/** Setup flow in progress, saved on every step so nothing is lost (MASTER_DOC §6). */
export type SetupDraft = {
  step: number;
  template: TemplateId | null;
  habits: HabitDraft[];
  startDate: ISODate | null;
  durationDays: number;
  strongThreshold: number;
  myWhy: string;
  chapterTarget: string;
  bodyCheck: BodyCheckInput | null;
  bodyCheckSkipped: boolean;
  commitName: string;
};

export type CreateArcInput = {
  habits: HabitDraft[];
  startDate: ISODate;
  durationDays: number;
  strongThreshold: number;
  myWhy: string;
  chapterTarget: string | null;
  bodyCheck: BodyCheckInput | null;
  commitName: string;
};

export type PastArcView = {
  id: string;
  startDate: ISODate;
  endDate: ISODate;
  status: Arc["status"];
  habitCount: number;
};

export type SetupContext = {
  /** Server (demo) time, ISO. */
  now: string;
  timeZone: string;
  activeArc: ArcSummary | null;
  pastArcs: PastArcView[];
  templates: { default: HabitDraft[]; previous: HabitDraft[] | null };
  startOptions: { today: ISODate; nextMonthStart: ISODate };
  draft: SetupDraft | null;
};

export type HabitSettingsView = {
  arc: ArcSummary;
  habits: Habit[];
  /** True after the end of Day 3: type, target and schedule are locked (TC08). */
  locked: boolean;
  /** Last day habits can be changed freely. */
  lockDate: ISODate;
  /** Fields still editable now. */
  editableFields: HabitField[];
  canChangeList: boolean;
};

export type QuickAction = "toggle" | "increment" | "log-time" | "session-done" | "open-checklist";

export type HabitRowView = {
  habit: Habit;
  /** "01" … "10". */
  number: string;
  status: EntryStatus;
  /** Screen-reader / visible status label, e.g. "Done", "Not logged". */
  statusLabel: string;
  points: number | null;
  provisional: boolean;
  paused: boolean;
  /** Secondary line, e.g. "2,250 / 3,000 ml", "Target 12:00 AM", "1 / 3 tasks". */
  meta: string;
  /** 0–1 progress for count/checklist habits that are not yet Done; null otherwise. */
  progress: number | null;
  value: number | null;
  loggedTime: ClockTime | null;
  durationMin: number | null;
  checklist: ChecklistItem[] | null;
  /** One-tap action on the row, or null when the habit can't be changed (rest, sick, locked). */
  quickAction: QuickAction | null;
};

export type DayView = {
  date: ISODate;
  dayNumber: number;
  /** 0–100, null on a sick day. */
  score: number | null;
  provisional: boolean;
  final: boolean;
  isStrong: boolean;
  isWeak: boolean;
  isSick: boolean;
  recoveryDay: boolean;
  editWindow: EditWindow;
  habits: HabitRowView[];
  /** Habits logged Done. */
  doneCount: number;
  /** Habits that need doing today (counted habits minus Rest). */
  totalCount: number;
  /** More habits to log to reach the threshold; 0 when strong, null when out of reach. */
  habitsNeeded: number | null;
  journal: string | null;
  mood: number | null;
  closedAt: string | null;
  sickDay: SickDayCheck;
};

export type StreakView = {
  current: number;
  best: number;
  state: StreakStateName;
  shieldsHeld: number;
};

export type ChapterView = {
  index: number;
  /** "OCT". */
  label: string;
  days: number;
  /** Days of this chapter up to and including today. */
  elapsed: number;
};

export type Banner =
  | { kind: "sick_day" }
  | { kind: "yesterday_unlogged"; date: ISODate; unlogged: number; closesAt: string }
  | { kind: "broken"; best: number }
  | { kind: "shielded"; shieldsHeld: number }
  | { kind: "at_risk"; habitsNeeded: number | null }
  | { kind: "recovery_day" }
  | { kind: "all_done" };

export type ArcSummary = {
  id: string;
  name: string;
  startDate: ISODate;
  endDate: ISODate;
  durationDays: number;
  strongThreshold: number;
  timeZone: string;
};

export type TodayView =
  | { kind: "no_arc" }
  | {
      kind: "countdown";
      arc: ArcSummary;
      daysUntilStart: number;
      myWhy: string;
    }
  | { kind: "completed"; arc: ArcSummary }
  | {
      kind: "active";
      arc: ArcSummary;
      /** Server (demo) time the view was built at, ISO. The client shows this, not its own clock (E3). */
      now: string;
      day: DayView;
      chapters: ChapterView[];
      currentChapter: number;
      /** Arc streak through yesterday. */
      streak: StreakView;
      rank: { name: RankName; points: number; next: { name: RankName; remaining: number } | null };
      sickDaysLeft: number;
      banners: Banner[];
    };

export type StreakEffect = "grows" | "holds" | "at_risk" | "shielded" | "broken" | "frozen";

export type CloseDaySummary = {
  date: ISODate;
  score: number | null;
  isStrong: boolean;
  doneCount: number;
  totalCount: number;
  /** Streak if the day stays as it is now. */
  streak: StreakView;
  effect: StreakEffect;
};

export type CloseDayInput = { journal: string | null; mood: number | null };

export type HabitValuePatch = {
  value?: number | null;
  loggedTime?: ClockTime | null;
  durationMin?: number | null;
  note?: string | null;
};

export type DataErrorCode =
  | "no_arc"
  | "unknown_habit"
  | "not_editable"
  | "rest_day"
  | "sick_day"
  | "invalid_input"
  | "sick_not_allowed"
  | "arc_active"
  | "locked";

export class DataError extends Error {
  readonly code: DataErrorCode;

  constructor(code: DataErrorCode, message: string) {
    super(message);
    this.name = "DataError";
    this.code = code;
  }
}
