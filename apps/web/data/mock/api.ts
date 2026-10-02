import {
  arcEndDate,
  canAddHabit,
  canChangeHabitList,
  canUseSickDay,
  editWindow,
  FIELDS_AFTER_LOCK,
  HABIT_FIELDS,
  habitOn,
  isArcLocked,
  isHabitFieldEditable,
  isScheduled,
  isValidDuration,
  isValidStartDate,
  isValidThreshold,
  localDate,
  localTime,
  lockDate,
  MIN_HABITS,
  startDateOptions,
  validateHabitDraft,
  validateHabitList,
  validateMyWhy,
  WINTER_ARC_TEMPLATE,
  type Habit,
  type HabitDraft,
  type HabitField,
  type ISODate,
  type ManualStatus,
} from "@b-core/arc-engine";
import {
  bodyCheckInputSchema,
  checklistItemPatchSchema,
  closeDayInputSchema,
  commitNameSchema,
  habitValuePatchSchema,
} from "../schemas";
import {
  DataError,
  type ArcSummary,
  type BodyCheckInput,
  type CloseDayInput,
  type CloseDaySummary,
  type CreateArcInput,
  type DashboardFilter,
  type DashboardView,
  type DayDetailView,
  type DayView,
  type HabitSettingsView,
  type HabitValuePatch,
  type SetupContext,
  type SetupDraft,
  type StoredArc,
  type StoredEntry,
  type TodayView,
  type TrackerView,
} from "../types";
import {
  arcSummary,
  buildCloseDaySummary,
  buildDayView,
  buildDayDetail,
  buildTodayView,
  buildTrackerView,
  checklistItems,
  currentHabits,
} from "../view-models";
import { buildDashboardView } from "../dashboard";
import { DEFAULT_SCENARIO, SCENARIOS, type Scenario, type ScenarioId } from "./scenarios";
import { seedScenario, type MockState } from "./seed";
import type { KeyValueStore } from "./store";

export const STORAGE_KEY = "b-core:winter-arc:mock:v2";

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
  /** Id generator (deterministic in tests). */
  makeId?: (prefix: string) => string;
};

function defaultMakeId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

/** Fields that differ between two versions of a habit (type change counts as "type"). */
function changedFields(prev: Habit, next: HabitDraft): HabitField[] {
  const a = prev as Record<string, unknown>;
  const b = next as Record<string, unknown>;
  const differ = (key: string) => JSON.stringify(a[key] ?? null) !== JSON.stringify(b[key] ?? null);
  const fields = HABIT_FIELDS.filter((f) => differ(f));
  if (differ("hasMinimum") && !fields.includes("minimum")) fields.push("minimum");
  return fields;
}

/**
 * Phase 1 data layer: arcs in a key-value store, a pinned demo clock, and the engine
 * for every rule. All functions are async to match the Phase 2 (Supabase) signatures.
 */
export function createMockApi({ store, timeZone, makeId = defaultMakeId }: Options) {
  function load(): MockState {
    const raw = store.get(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as MockState;
        if (parsed.version === 2) return parsed;
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

  function activeArc(state: MockState): StoredArc | null {
    return state.arcs.find((a) => a.arc.id === state.activeArcId) ?? null;
  }

  function current(): { state: MockState; data: StoredArc; now: Date } {
    const state = load();
    const data = activeArc(state);
    if (!data) throw new DataError("no_arc", "No active arc.");
    return { state, data, now: new Date(state.now) };
  }

  function saveArc(state: MockState, data: StoredArc): void {
    save({ ...state, arcs: state.arcs.map((a) => (a.arc.id === data.arc.id ? data : a)) });
  }

  /** Resolve the habit on `date` and check the day can take a log for it. */
  function editableHabit(data: StoredArc, now: Date, date: ISODate, habitId: string): Habit {
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
    data: StoredArc,
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
    saveArc(state, { ...data, entries });
  }

  function assertValidDraft(draft: HabitDraft): void {
    const issue = validateHabitDraft(draft)[0];
    if (issue) throw new DataError("invalid_input", `${draft.name || "Habit"}: ${issue.message}`);
  }

  function parseBodyCheck(input: BodyCheckInput): BodyCheckInput {
    const parsed = bodyCheckInputSchema.safeParse(input);
    if (!parsed.success)
      throw new DataError(
        "invalid_input",
        parsed.error.issues[0]?.message ?? "Invalid body check.",
      );
    return parsed.data;
  }

  return {
    async getActiveArc(): Promise<ArcSummary | null> {
      const data = activeArc(load());
      return data ? arcSummary(data) : null;
    },

    async getToday(): Promise<TodayView> {
      const state = load();
      return buildTodayView(activeArc(state), new Date(state.now));
    },

    /** Month tracker for a chapter (defaults to the chapter containing today). */
    async getTracker(chapterIndex?: number): Promise<TrackerView> {
      const state = load();
      return buildTrackerView(activeArc(state), new Date(state.now), chapterIndex);
    },

    /** Dashboard (MASTER_DOC §10); filter by arc or chapter (TC45). */
    async getDashboard(filter: DashboardFilter = { kind: "arc" }): Promise<DashboardView> {
      const state = load();
      return buildDashboardView(activeArc(state), new Date(state.now), filter);
    },

    async getDayDetail(date: ISODate): Promise<DayDetailView | null> {
      const { data, now } = current();
      return buildDayDetail(data, date, now);
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
      if (!parsed.success) {
        throw new DataError("invalid_input", parsed.error.issues[0]?.message ?? "Invalid value.");
      }
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
      if (habit.type !== "time") {
        throw new DataError("invalid_input", `${habit.name} is not a time habit.`);
      }
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
      if (!parsed.success) {
        throw new DataError("invalid_input", parsed.error.issues[0]?.message ?? "Invalid item.");
      }
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
      if (!parsed.success) {
        throw new DataError("invalid_input", parsed.error.issues[0]?.message ?? "Invalid input.");
      }
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
      const next = { ...data, dayLogs: [...data.dayLogs.filter((l) => l.date !== date), log] };
      saveArc(state, next);
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
      saveArc(state, {
        ...data,
        arc: { ...data.arc, sickDaysUsed: data.arc.sickDaysUsed + 1 },
        dayLogs: [...data.dayLogs.filter((l) => l.date !== date), log],
      });
    },

    /* ---- Setup (MASTER_DOC §6) ---- */

    async getSetupContext(): Promise<SetupContext> {
      const state = load();
      const now = new Date(state.now);
      const tz = activeArc(state)?.arc.timeZone ?? timeZone();
      const past = state.arcs
        .filter((a) => a.arc.id !== state.activeArcId)
        .sort((a, b) => b.arc.startDate.localeCompare(a.arc.startDate));
      const latest = past[0];
      const active = activeArc(state);
      return {
        now: state.now,
        timeZone: tz,
        activeArc: active ? arcSummary(active) : null,
        pastArcs: past.map((a) => ({
          id: a.arc.id,
          startDate: a.arc.startDate,
          endDate: arcEndDate(a.arc.startDate, a.arc.durationDays),
          status: a.arc.status,
          habitCount: currentHabits(a).length,
        })),
        templates: {
          default: [...WINTER_ARC_TEMPLATE],
          previous: latest
            ? currentHabits(latest).map((h) => {
                const { id: _id, arcId: _arcId, ...draft } = h;
                return { ...draft, status: "active" } as HabitDraft;
              })
            : null,
        },
        startOptions: startDateOptions(now, tz),
        draft: state.setupDraft,
      };
    },

    async saveSetupDraft(draft: SetupDraft): Promise<void> {
      save({ ...load(), setupDraft: draft });
    },

    async clearSetupDraft(): Promise<void> {
      save({ ...load(), setupDraft: null });
    },

    /** Create the arc (TC01). Only one active arc at a time (TC09). */
    async createArc(input: CreateArcInput): Promise<ArcSummary> {
      const state = load();
      if (activeArc(state))
        throw new DataError("arc_active", "Finish or abandon your current arc first.");
      const now = new Date(state.now);
      const tz = timeZone();

      const listIssue = validateHabitList(input.habits.length);
      if (listIssue) throw new DataError("invalid_input", listIssue.message);
      input.habits.forEach(assertValidDraft);
      const whyIssue = validateMyWhy(input.myWhy);
      if (whyIssue) throw new DataError("invalid_input", whyIssue);
      if (!isValidDuration(input.durationDays))
        throw new DataError("invalid_input", "Pick 30, 60 or 92 days.");
      if (!isValidThreshold(input.strongThreshold))
        throw new DataError("invalid_input", "Threshold must be 60–100.");
      if (!isValidStartDate(input.startDate, now, tz)) {
        throw new DataError("invalid_input", "Start today or later.");
      }
      const name = commitNameSchema.safeParse(input.commitName);
      if (!name.success)
        throw new DataError("invalid_input", name.error.issues[0]?.message ?? "Sign to commit.");
      const bodyCheck = input.bodyCheck ? parseBodyCheck(input.bodyCheck) : null;

      const arcId = makeId("arc");
      const habits: Habit[] = input.habits.map(
        (d, i) =>
          ({
            ...d,
            name: d.name.trim(),
            order: i + 1,
            status: "active",
            id: makeId("habit"),
            arcId,
          }) as Habit,
      );
      const today = localDate(now, tz);
      const stored: StoredArc = {
        arc: {
          id: arcId,
          startDate: input.startDate,
          durationDays: input.durationDays,
          timeZone: tz,
          strongThreshold: input.strongThreshold,
          myWhy: input.myWhy.trim(),
          status: input.startDate > today ? "upcoming" : "active",
          sickDaysUsed: 0,
        },
        habitVersions: habits.map((h) => ({ habitId: h.id, validFrom: input.startDate, habit: h })),
        entries: [],
        dayLogs: [],
        bodyChecks: bodyCheck
          ? [{ id: makeId("body"), arcId, date: input.startDate, photoUrl: null, ...bodyCheck }]
          : [],
        chapterTargets: input.chapterTarget?.trim() ? { 1: input.chapterTarget.trim() } : {},
        commitment: { name: name.data, committedAt: now.toISOString() },
      };
      save({ ...state, arcs: [...state.arcs, stored], activeArcId: arcId, setupDraft: null });
      return arcSummary(stored);
    },

    /** Abandon the active arc: kept read-only as a past arc (E15). */
    async abandonArc(): Promise<void> {
      const { state, data } = current();
      save({
        ...state,
        activeArcId: null,
        arcs: state.arcs.map((a) =>
          a.arc.id === data.arc.id ? { ...a, arc: { ...a.arc, status: "abandoned" } } : a,
        ),
      });
    },

    async saveBodyCheck(input: BodyCheckInput): Promise<void> {
      const { state, data, now } = current();
      const parsed = parseBodyCheck(input);
      const date = localDate(now, data.arc.timeZone);
      saveArc(state, {
        ...data,
        bodyChecks: [
          ...data.bodyChecks.filter((b) => b.date !== date),
          { id: makeId("body"), arcId: data.arc.id, date, photoUrl: null, ...parsed },
        ],
      });
    },

    /* ---- Habit settings with the Day 3 lock (TC08, R7) ---- */

    async getHabitSettings(): Promise<HabitSettingsView> {
      const { data, now } = current();
      const locked = isArcLocked(data.arc, now);
      return {
        arc: arcSummary(data),
        habits: currentHabits(data),
        locked,
        lockDate: lockDate(data.arc.startDate),
        editableFields: locked ? [...FIELDS_AFTER_LOCK] : [...HABIT_FIELDS],
        canChangeList: canChangeHabitList(data.arc, now),
      };
    },

    /**
     * Save an edited habit. Before lock the change is retroactive (R7: one version from the
     * start). After lock only name and reminder may change; they apply to every version.
     */
    async updateHabit(habitId: string, draft: HabitDraft): Promise<void> {
      const { state, data, now } = current();
      const prev = currentHabits(data).find((h) => h.id === habitId);
      if (!prev) throw new DataError("unknown_habit", "No such habit.");
      const next = { ...draft, order: prev.order, status: prev.status, name: draft.name.trim() };
      assertValidDraft(next);
      const blocked = changedFields(prev, next).filter(
        (f) => !isHabitFieldEditable(f, data.arc, now),
      );
      if (blocked.length > 0) {
        throw new DataError(
          "locked",
          "Locked after Day 3. You can rename it or change the reminder.",
        );
      }
      const habit = { ...next, id: habitId, arcId: data.arc.id } as Habit;
      const others = data.habitVersions.filter((v) => v.habitId !== habitId);
      const mine = data.habitVersions.filter((v) => v.habitId === habitId);
      const versions = isArcLocked(data.arc, now)
        ? mine.map((v) => ({
            ...v,
            habit: { ...v.habit, name: habit.name, reminderTime: habit.reminderTime },
          }))
        : [{ habitId, validFrom: data.arc.startDate, habit }];
      saveArc(state, { ...data, habitVersions: [...others, ...versions] });
    },

    async addHabit(draft: HabitDraft): Promise<void> {
      const { state, data, now } = current();
      if (!canChangeHabitList(data.arc, now))
        throw new DataError("locked", "Habits can't be added after Day 3.");
      const habits = currentHabits(data);
      if (!canAddHabit(habits.length))
        throw new DataError("invalid_input", "Keep it to 10 habits.");
      assertValidDraft(draft);
      const habit = {
        ...draft,
        name: draft.name.trim(),
        order: habits.length + 1,
        status: "active",
        id: makeId("habit"),
        arcId: data.arc.id,
      } as Habit;
      saveArc(state, {
        ...data,
        habitVersions: [
          ...data.habitVersions,
          { habitId: habit.id, validFrom: data.arc.startDate, habit },
        ],
      });
    },

    async removeHabit(habitId: string): Promise<void> {
      const { state, data, now } = current();
      if (!canChangeHabitList(data.arc, now)) {
        throw new DataError(
          "locked",
          "Habits can't be removed after Day 3. You can pause one instead.",
        );
      }
      const habits = currentHabits(data);
      if (!habits.some((h) => h.id === habitId))
        throw new DataError("unknown_habit", "No such habit.");
      if (habits.length <= MIN_HABITS)
        throw new DataError("invalid_input", `Keep at least ${MIN_HABITS} habits.`);
      const remaining = habits.filter((h) => h.id !== habitId);
      saveArc(state, {
        ...data,
        habitVersions: data.habitVersions
          .filter((v) => v.habitId !== habitId)
          .map((v) => ({
            ...v,
            habit: { ...v.habit, order: remaining.findIndex((h) => h.id === v.habitId) + 1 },
          })),
        entries: data.entries.filter((e) => e.habitId !== habitId),
      });
    },

    /** Display order on Today and in reports; allowed any time. */
    async reorderHabits(habitIds: string[]): Promise<void> {
      const { state, data } = current();
      const ids = currentHabits(data).map((h) => h.id);
      if (habitIds.length !== ids.length || !ids.every((id) => habitIds.includes(id))) {
        throw new DataError("invalid_input", "Reorder must include every habit once.");
      }
      saveArc(state, {
        ...data,
        habitVersions: data.habitVersions.map((v) => ({
          ...v,
          habit: { ...v.habit, order: habitIds.indexOf(v.habitId) + 1 },
        })),
      });
    },

    /* ---- Demo controls (mock only) ---- */

    async getDemoState(): Promise<DemoState> {
      const state = load();
      return {
        scenario: state.scenario,
        now: state.now,
        timeZone: activeArc(state)?.arc.timeZone ?? timeZone(),
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
      return localDate(new Date(state.now), activeArc(state)?.arc.timeZone ?? timeZone());
    },
  };
}

export type MockApi = ReturnType<typeof createMockApi>;
