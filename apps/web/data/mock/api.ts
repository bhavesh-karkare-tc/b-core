import {
  canUseSickDay,
  editWindow,
  habitOn,
  isScheduled,
  localDate,
  localTime,
  type Habit,
  type ISODate,
  type ManualStatus,
} from "@b-core/arc-engine";
import { checklistItemPatchSchema, closeDayInputSchema, habitValuePatchSchema } from "../schemas";
import {
  DataError,
  type ArcData,
  type ArcSummary,
  type CloseDayInput,
  type CloseDaySummary,
  type DayView,
  type HabitValuePatch,
  type StoredEntry,
  type TodayView,
} from "../types";
import {
  arcSummary,
  buildCloseDaySummary,
  buildDayView,
  buildTodayView,
  checklistItems,
} from "../view-models";
import { DEFAULT_SCENARIO, SCENARIOS, type Scenario, type ScenarioId } from "./scenarios";
import { seedScenario, type MockState } from "./seed";
import type { KeyValueStore } from "./store";

export const STORAGE_KEY = "b-core:winter-arc:mock:v1";

export type DemoState = {
  scenario: ScenarioId;
  now: string;
  timeZone: string;
  scenarios: readonly Pick<Scenario, "id" | "label" | "description">[];
};

type Options = {
  store: KeyValueStore;
  /** Resolved lazily so the browser timezone is read in the browser, not on the server. */
  timeZone: () => string;
};

/**
 * Phase 1 data layer: arc data in a key-value store, a pinned demo clock, and the engine
 * for every rule. All functions are async to match the Phase 2 (Supabase) signatures.
 */
export function createMockApi({ store, timeZone }: Options) {
  function load(): MockState {
    const raw = store.get(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as MockState;
        if (parsed.version === 1) return parsed;
      } catch {
        // fall through to a fresh seed
      }
    }
    const seeded = seedScenario(DEFAULT_SCENARIO, timeZone());
    save(seeded);
    return seeded;
  }

  function save(state: MockState): void {
    store.set(STORAGE_KEY, JSON.stringify(state));
  }

  function current(): { state: MockState; data: ArcData; now: Date } {
    const state = load();
    if (!state.data) throw new DataError("no_arc", "No active arc.");
    return { state, data: state.data, now: new Date(state.now) };
  }

  /** Resolve the habit on `date` and check the day can take a log for it. */
  function editableHabit(data: ArcData, now: Date, date: ISODate, habitId: string): Habit {
    if (!editWindow(date, now, data.arc).editable) {
      throw new DataError("not_editable", "Locked. Logs close at noon the next day.");
    }
    const versions = data.habitVersions.filter((v) => v.habitId === habitId);
    const habit = habitOn(versions, date);
    if (!habit) throw new DataError("unknown_habit", `No habit ${habitId} on ${date}.`);
    if (data.dayLogs.some((l) => l.date === date && l.isSick)) {
      throw new DataError("sick_day", "This is a sick day.");
    }
    if (!isScheduled(habit, date) || habit.status === "paused") {
      throw new DataError("rest_day", `${habit.name} is resting today.`);
    }
    return habit;
  }

  function upsertEntry(
    state: MockState,
    data: ArcData,
    now: Date,
    date: ISODate,
    habitId: string,
    patch: (prev: StoredEntry) => StoredEntry,
  ): void {
    const index = data.entries.findIndex((e) => e.habitId === habitId && e.date === date);
    const prev: StoredEntry = data.entries[index] ?? {
      habitId,
      date,
      status: "unlogged",
      value: null,
      loggedTime: null,
      durationMin: null,
      updatedAt: now.toISOString(),
      source: "manual",
    };
    const next = { ...patch(prev), source: "manual" as const, updatedAt: now.toISOString() };
    const entries = [...data.entries];
    if (index >= 0) entries[index] = next;
    else entries.push(next);
    save({ ...state, data: { ...data, entries } });
  }

  return {
    async getActiveArc(): Promise<ArcSummary | null> {
      const state = load();
      return state.data ? arcSummary(state.data) : null;
    },

    async getToday(): Promise<TodayView> {
      const state = load();
      return buildTodayView(state.data, new Date(state.now));
    },

    async getDay(date: ISODate): Promise<DayView | null> {
      const { data, now } = current();
      return buildDayView(data, date, now);
    },

    async getCloseDaySummary(date: ISODate): Promise<CloseDaySummary | null> {
      const { data, now } = current();
      return buildCloseDaySummary(data, date, now);
    },

    /** Set a status by hand: Done/Minimum/Missed/clear for yes-no and session; Missed/clear for the rest. */
    async logHabit(date: ISODate, habitId: string, status: ManualStatus): Promise<void> {
      const { state, data, now } = current();
      const habit = editableHabit(data, now, date, habitId);
      const valueType =
        habit.type === "count" || habit.type === "time" || habit.type === "checklist";
      if (valueType && (status === "done" || status === "minimum")) {
        throw new DataError("invalid_input", `${habit.name} is logged by value.`);
      }
      if (status === "minimum" && "hasMinimum" in habit && !habit.hasMinimum) {
        throw new DataError("invalid_input", `${habit.name} has no minimum.`);
      }
      upsertEntry(state, data, now, date, habitId, (prev) => ({ ...prev, status }));
    },

    /** Log a value: count, logged time, session duration or note. Clears an explicit Missed. */
    async setHabitValue(date: ISODate, habitId: string, patch: HabitValuePatch): Promise<void> {
      const parsed = habitValuePatchSchema.safeParse(patch);
      if (!parsed.success)
        throw new DataError("invalid_input", parsed.error.issues[0]?.message ?? "Invalid value.");
      const { state, data, now } = current();
      const habit = editableHabit(data, now, date, habitId);
      const clearsMissed = parsed.data.value !== undefined || parsed.data.loggedTime !== undefined;
      upsertEntry(state, data, now, date, habitId, (prev) => ({
        ...prev,
        ...parsed.data,
        status:
          clearsMissed && prev.status === "missed" && habit.type !== "session"
            ? "unlogged"
            : prev.status,
      }));
    },

    /** Time habit quick action: log the current time (arc timezone, demo clock). */
    async logTimeNow(date: ISODate, habitId: string): Promise<void> {
      const { state, data, now } = current();
      const habit = editableHabit(data, now, date, habitId);
      if (habit.type !== "time")
        throw new DataError("invalid_input", `${habit.name} is not a time habit.`);
      const loggedTime = localTime(now, data.arc.timeZone);
      upsertEntry(state, data, now, date, habitId, (prev) => ({
        ...prev,
        loggedTime,
        status: prev.status === "missed" ? "unlogged" : prev.status,
      }));
    },

    /** Tick or rename one checklist sub-item; the entry value is the ticked count. */
    async setChecklistItem(
      date: ISODate,
      habitId: string,
      index: number,
      patch: { text?: string; done?: boolean },
    ): Promise<void> {
      const parsed = checklistItemPatchSchema.safeParse(patch);
      if (!parsed.success)
        throw new DataError("invalid_input", parsed.error.issues[0]?.message ?? "Invalid item.");
      const { state, data, now } = current();
      const habit = editableHabit(data, now, date, habitId);
      if (habit.type !== "checklist" || index < 0 || index >= habit.items) {
        throw new DataError("invalid_input", "No such checklist item.");
      }
      upsertEntry(state, data, now, date, habitId, (prev) => {
        const checklist = checklistItems(habit.items, prev).map((item, i) =>
          i === index ? { ...item, ...parsed.data } : item,
        );
        return {
          ...prev,
          checklist,
          value: checklist.filter((i) => i.done).length,
          status: prev.status === "missed" ? "unlogged" : prev.status,
        };
      });
    },

    /** Close the day: journal + mood. Does not lock the day; the cutoff does (MASTER_DOC §7). */
    async closeDay(date: ISODate, input: CloseDayInput): Promise<CloseDaySummary> {
      const parsed = closeDayInputSchema.safeParse(input);
      if (!parsed.success)
        throw new DataError("invalid_input", parsed.error.issues[0]?.message ?? "Invalid input.");
      const { state, data, now } = current();
      if (!editWindow(date, now, data.arc).editable) {
        throw new DataError("not_editable", "Locked. Logs close at noon the next day.");
      }
      const prev = data.dayLogs.find((l) => l.date === date);
      const log = {
        arcId: data.arc.id,
        date,
        isSick: prev?.isSick ?? false,
        journal: parsed.data.journal,
        mood: parsed.data.mood,
        closedAt: now.toISOString(),
      };
      const dayLogs = [...data.dayLogs.filter((l) => l.date !== date), log];
      const next = { ...data, dayLogs };
      save({ ...state, data: next });
      const summary = buildCloseDaySummary(next, date, now);
      if (!summary) throw new DataError("not_editable", "Day is outside the arc.");
      return summary;
    },

    /** Use a sick day: all habits Sick, score excluded, streak frozen (TC23). */
    async markSickDay(date: ISODate): Promise<void> {
      const { state, data, now } = current();
      const alreadySick = data.dayLogs.some((l) => l.date === date && l.isSick);
      const check = canUseSickDay(data.arc, date, now, alreadySick);
      if (!check.allowed) throw new DataError("sick_not_allowed", check.reason);
      const prev = data.dayLogs.find((l) => l.date === date);
      const log = {
        arcId: data.arc.id,
        date,
        journal: null,
        mood: null,
        closedAt: null,
        ...prev,
        isSick: true,
      };
      save({
        ...state,
        data: {
          ...data,
          arc: { ...data.arc, sickDaysUsed: data.arc.sickDaysUsed + 1 },
          dayLogs: [...data.dayLogs.filter((l) => l.date !== date), log],
        },
      });
    },

    /* ---- Demo controls (mock only) ---- */

    async getDemoState(): Promise<DemoState> {
      const state = load();
      return {
        scenario: state.scenario,
        now: state.now,
        timeZone: state.data?.arc.timeZone ?? timeZone(),
        scenarios: SCENARIOS.map(({ id, label, description }) => ({ id, label, description })),
      };
    },

    async loadScenario(id: ScenarioId): Promise<void> {
      save(seedScenario(id, timeZone()));
    },

    /** Move the pinned clock (e.g. past noon to see the cutoff). */
    async setDemoNow(iso: string): Promise<void> {
      const date = new Date(iso);
      if (Number.isNaN(date.getTime())) throw new DataError("invalid_input", "Invalid time.");
      save({ ...load(), now: date.toISOString() });
    },

    async resetDemo(): Promise<void> {
      store.remove(STORAGE_KEY);
    },

    /** Today's date in the arc timezone by the demo clock. */
    async getDemoToday(): Promise<ISODate> {
      const state = load();
      return localDate(new Date(state.now), state.data?.arc.timeZone ?? timeZone());
    },
  };
}

export type MockApi = ReturnType<typeof createMockApi>;
