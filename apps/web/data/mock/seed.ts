import {
  addDays,
  ARC_DEFAULT_DAYS,
  DEFAULT_THRESHOLD,
  habitsFromTemplate,
  instantAt,
  isScheduled,
  WINTER_ARC_TEMPLATE,
  type Arc,
  type Habit,
} from "@b-core/arc-engine";
import type {
  NotificationSettings,
  SetupDraft,
  StoredArc,
  StoredDayLog,
  StoredEntry,
} from "../types";
import { scenario, type ScenarioId, type TodayPreset } from "./scenarios";

export type MockState = {
  version: 2;
  scenario: ScenarioId;
  /** Pinned demo clock, ISO instant. */
  now: string;
  /** The one active (or upcoming) arc; null when none. */
  activeArcId: string | null;
  /** Active arc plus past (completed / abandoned) arcs. */
  arcs: StoredArc[];
  setupDraft: SetupDraft | null;
  /** Notification settings (UI only in Phase 1); defaults when absent. */
  notificationSettings?: NotificationSettings;
};

const ARC_ID = "arc-winter-2026";
const TASKS = ["Ship the weekly report", "Pack gym bag", "Call home"];
const JOURNAL = [
  "Hard sparring, felt sharp.",
  "Low energy, still showed up.",
  "Clean eating all day.",
  null,
  "Read before bed instead of scrolling.",
];

function entryFor(habit: Habit, date: string, done: boolean, dayIndex: number): StoredEntry | null {
  if (!done) return null;
  const base = {
    habitId: habit.id,
    date,
    status: "unlogged" as const,
    value: null,
    loggedTime: null,
    durationMin: null,
    updatedAt: `${date}T16:00:00.000Z`,
    source: "manual" as const,
  };
  switch (habit.type) {
    case "count":
      return { ...base, value: habit.target + (dayIndex % 3) * habit.step };
    case "checklist":
      return {
        ...base,
        value: habit.items,
        checklist: TASKS.slice(0, habit.items).map((text) => ({ text, done: true })),
      };
    case "time":
      return { ...base, loggedTime: ["23:15", "23:40", "23:55"][dayIndex % 3] ?? "23:30" };
    case "session":
      return { ...base, status: "done", durationMin: 60 };
    case "yesno":
      return { ...base, status: "done" };
  }
}

/** Habits (by index) left missed on a day, never MMA (index 3) so Sunday Rest stays fixed. */
function missedIndices(code: string, dayIndex: number): number[] {
  const pool = [0, 1, 2, 4, 5, 6, 7, 8, 9];
  const pick = (n: number) =>
    Array.from({ length: n }, (_, k) => pool[(dayIndex * 3 + k * 2) % pool.length] ?? 0);
  if (code === "S") return pick(1);
  if (code === "W") return pick(4);
  if (code === "Y") return pick(2);
  return [];
}

function historyDay(habits: Habit[], date: string, code: string, dayIndex: number, arcId: string) {
  const entries: StoredEntry[] = [];
  const logs: StoredDayLog[] = [];
  if (code === "K") {
    logs.push({ arcId, date, isSick: true, journal: null, mood: null, closedAt: null });
    return { entries, logs };
  }
  if (code === "E") return { entries, logs };

  const missed = new Set(missedIndices(code, dayIndex));
  habits.forEach((habit, i) => {
    if (!isScheduled(habit, date)) return;
    const e = entryFor(habit, date, !missed.has(i), dayIndex);
    if (e) entries.push(e);
  });
  if (code !== "Y") {
    logs.push({
      arcId,
      date,
      isSick: false,
      journal: JOURNAL[dayIndex % JOURNAL.length] ?? null,
      mood: code === "W" ? 2 : 4,
      closedAt: `${date}T16:30:00.000Z`,
    });
  }
  return { entries, logs };
}

/** Today's entries: the Day 23 mockup rows, everything done, or nothing. */
function todayEntries(
  habits: Habit[],
  date: string,
  preset: TodayPreset,
  dayIndex: number,
): StoredEntry[] {
  if (preset === "empty") return [];
  if (preset === "all-done") {
    return habits.flatMap((h) => {
      if (!isScheduled(h, date)) return [];
      const e = entryFor(h, date, true, dayIndex);
      return e ? [e] : [];
    });
  }
  const by = (name: string) => {
    const h = habits.find((x) => x.name === name);
    if (!h) throw new Error(`Missing habit ${name}`);
    return h;
  };
  const make = (name: string, patch: Partial<StoredEntry>): StoredEntry => ({
    habitId: by(name).id,
    date,
    status: "unlogged",
    value: null,
    loggedTime: null,
    durationMin: null,
    updatedAt: `${date}T08:00:00.000Z`,
    source: "manual",
    ...patch,
  });
  const rows: StoredEntry[] = [
    make("3L Water", { value: 2250 }),
    make("No Junk", { status: "done" }),
    make("10k Steps Outside", { value: 6200 }),
    make("Read 10 Pages", { value: 4 }),
    make("No Phone at Meals", { status: "done" }),
    make("Top 3 Tasks Done", {
      value: 1,
      checklist: [
        { text: TASKS[0] ?? "", done: true },
        { text: TASKS[1] ?? "", done: false },
        { text: TASKS[2] ?? "", done: false },
      ],
    }),
    make("Skin Care", { status: "done" }),
    make("No P", { status: "done" }),
  ];
  if (preset === "mockup") rows.push(make("MMA Training", { status: "done", durationMin: 60 }));
  return rows;
}

function storedArc(
  id: string,
  startDate: string,
  history: string,
  timeZone: string,
  status: Arc["status"],
  habits: Habit[],
  today?: { date: string; preset: TodayPreset; sick?: boolean },
): StoredArc {
  const entries: StoredEntry[] = [];
  const dayLogs: StoredDayLog[] = [];
  [...history].forEach((code, i) => {
    const day = historyDay(habits, addDays(startDate, i), code, i, id);
    entries.push(...day.entries);
    dayLogs.push(...day.logs);
  });
  if (today && today.date >= startDate) {
    entries.push(...todayEntries(habits, today.date, today.preset, history.length));
    if (today.sick) {
      dayLogs.push({
        arcId: id,
        date: today.date,
        isSick: true,
        journal: null,
        mood: null,
        closedAt: null,
      });
    }
  }
  return {
    arc: {
      id,
      startDate,
      durationDays: ARC_DEFAULT_DAYS,
      timeZone,
      strongThreshold: DEFAULT_THRESHOLD,
      myWhy: "Finish the year stronger than I started it. Never miss two.",
      status,
      sickDaysUsed: dayLogs.filter((l) => l.isSick).length,
    },
    habitVersions: habits.map((h) => ({ habitId: h.id, validFrom: startDate, habit: h })),
    entries,
    dayLogs,
    bodyChecks: [],
    chapterTargets: {},
    commitment: { name: "Demo user", committedAt: `${startDate}T03:00:00.000Z` },
  };
}

/** Last winter's arc for the returning-user scenario: 8 habits, one swapped in. */
function pastArc(timeZone: string): StoredArc {
  const id = "arc-winter-2025";
  const drafts = WINTER_ARC_TEMPLATE.filter((h) => h.name !== "Skin Care" && h.name !== "No P");
  const habits = habitsFromTemplate(id, drafts, (_, i) => `past-habit-${i + 1}`);
  habits.push({
    id: "past-habit-cold",
    arcId: id,
    order: habits.length + 1,
    name: "Cold Shower",
    type: "yesno",
    category: "discipline",
    hasMinimum: true,
    minimumText: "30 seconds cold at the end",
    schedule: { kind: "daily" },
    reminderTime: null,
    status: "active",
  });
  const codes =
    "SSSSSSWSSSSSSSSWWSSSSSSSSSSSSKSSSSSSSWSSSSSSSSSSSSSSSWWSSSSSSSSSSSSSSSSSSSSSSKSSSSSSSSSSSSSS";
  return storedArc(
    id,
    "2025-10-01",
    codes.slice(0, ARC_DEFAULT_DAYS),
    timeZone,
    "completed",
    habits,
  );
}

/** Build a scenario's arcs and pinned clock in the given timezone. */
export function seedScenario(id: ScenarioId, timeZone: string): MockState {
  const s = scenario(id);
  const now = instantAt(s.nowDate, s.nowTime, timeZone).toISOString();
  const base = { version: 2 as const, scenario: id, now, setupDraft: null };

  if (s.arc === "none") return { ...base, activeArcId: null, arcs: [] };
  if (s.arc === "returning") return { ...base, activeArcId: null, arcs: [pastArc(timeZone)] };

  const habits = habitsFromTemplate(ARC_ID, WINTER_ARC_TEMPLATE, (_, i) => `habit-${i + 1}`);
  const arc = storedArc(
    ARC_ID,
    s.startDate,
    s.history,
    timeZone,
    s.nowDate < s.startDate ? "upcoming" : "active",
    habits,
    { date: s.nowDate, preset: s.today, sick: s.todaySick },
  );
  return { ...base, activeArcId: ARC_ID, arcs: [arc] };
}
