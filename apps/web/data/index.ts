/**
 * Data access for the UI. Components import only from here (CLAUDE.md rule 1).
 * Phase 1 re-exports the mock implementation; Phase 2 swaps in Supabase with the same signatures.
 */
import { createMockApi } from "./mock/api";
import { browserStore } from "./mock/store";

export type * from "./types";
export { DataError } from "./types";
export { formatClock } from "./view-models";
export { bodyCheckInputSchema, closeDayInputSchema, commitNameSchema } from "./schemas";
export type { DemoState } from "./mock/api";
export type { ScenarioId } from "./mock/scenarios";

const api = createMockApi({
  store: browserStore(),
  timeZone: () => Intl.DateTimeFormat().resolvedOptions().timeZone,
});

export const getActiveArc = api.getActiveArc;
export const getToday = api.getToday;
export const getDay = api.getDay;
export const getTracker = api.getTracker;
export const getDashboard = api.getDashboard;
export const getHabitDetail = api.getHabitDetail;
export const getDayDetail = api.getDayDetail;
export const getCloseDaySummary = api.getCloseDaySummary;
export const logHabit = api.logHabit;
export const setHabitValue = api.setHabitValue;
export const logTimeNow = api.logTimeNow;
export const setChecklistItem = api.setChecklistItem;
export const closeDay = api.closeDay;
export const markSickDay = api.markSickDay;

export const getSetupContext = api.getSetupContext;
export const saveSetupDraft = api.saveSetupDraft;
export const clearSetupDraft = api.clearSetupDraft;
export const createArc = api.createArc;
export const abandonArc = api.abandonArc;
export const saveBodyCheck = api.saveBodyCheck;

export const getHabitSettings = api.getHabitSettings;
export const updateHabit = api.updateHabit;
export const addHabit = api.addHabit;
export const removeHabit = api.removeHabit;
export const reorderHabits = api.reorderHabits;

/** Demo controls — mock implementation only. */
export const demo = {
  getState: api.getDemoState,
  loadScenario: api.loadScenario,
  setNow: api.setDemoNow,
  reset: api.resetDemo,
  getToday: api.getDemoToday,
};
