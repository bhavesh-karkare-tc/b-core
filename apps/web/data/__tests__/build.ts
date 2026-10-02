import {
  habitsFromTemplate,
  instantAt,
  WINTER_ARC_TEMPLATE,
  type Arc,
  type ManualStatus,
} from "@b-core/arc-engine";
import type { ArcData, StoredDayLog, StoredEntry } from "../types";

export const TZ = "Asia/Kolkata";

export function arcData(overrides: Partial<Arc> = {}): ArcData {
  const arc: Arc = {
    id: "arc-1",
    startDate: "2026-10-01",
    durationDays: 92,
    timeZone: TZ,
    strongThreshold: 80,
    myWhy: "Become someone who keeps promises.",
    status: "active",
    sickDaysUsed: 0,
    ...overrides,
  };
  const habits = habitsFromTemplate(arc.id, WINTER_ARC_TEMPLATE, (_, i) => `h${i + 1}`);
  return {
    arc,
    habitVersions: habits.map((h) => ({ habitId: h.id, validFrom: arc.startDate, habit: h })),
    entries: [],
    dayLogs: [],
  };
}

export function entry(
  habitId: string,
  date: string,
  patch: Partial<StoredEntry> & { status?: ManualStatus } = {},
): StoredEntry {
  return {
    habitId,
    date,
    status: "unlogged",
    value: null,
    loggedTime: null,
    durationMin: null,
    updatedAt: `${date}T10:00:00.000Z`,
    source: "manual",
    ...patch,
  };
}

/** Every habit Done on `date` (count/checklist at target, time on target). */
export function allDone(data: ArcData, date: string): StoredEntry[] {
  return data.habitVersions.map(({ habit: h }) => {
    if (h.type === "count") return entry(h.id, date, { value: h.target });
    if (h.type === "checklist") return entry(h.id, date, { value: h.items });
    if (h.type === "time") return entry(h.id, date, { loggedTime: "23:30" });
    return entry(h.id, date, { status: "done" });
  });
}

/** Only the first `n` habits Done (by order); the rest left unlogged. */
export function firstDone(data: ArcData, date: string, n: number): StoredEntry[] {
  return allDone(data, date).slice(0, n);
}

export function sickLog(date: string): StoredDayLog {
  return { arcId: "arc-1", date, isSick: true, journal: null, mood: null, closedAt: null };
}

export const at = (date: string, time: string) => instantAt(date, time, TZ);
