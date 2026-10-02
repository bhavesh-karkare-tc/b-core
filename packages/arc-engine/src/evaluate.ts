import { arcEndDate } from "./chapters";
import { isFinal } from "./cutoff";
import { eachDay, minDate, weekStart } from "./dates";
import { habitOn, isScheduled, perWeekRestEligible } from "./schedule";
import { dayResult } from "./scoring";
import { resolveEntry } from "./status";
import { localDate } from "./timezone";
import type {
  Arc,
  DayLog,
  DayResult,
  HabitEntry,
  HabitVersion,
  ISODate,
  ResolvedEntry,
} from "./types";

export type EvaluateInput = {
  arc: Pick<Arc, "startDate" | "durationDays" | "timeZone" | "strongThreshold">;
  /** Every version of every habit in the arc. */
  habitVersions: readonly HabitVersion[];
  entries: readonly HabitEntry[];
  dayLogs: readonly DayLog[];
  now: Date;
};

export type EvaluatedDay = DayResult & { final: boolean };

/**
 * Resolve every arc day from the start up to today (arc timezone) into scored days.
 * Days past cutoff are final; today and an open yesterday are provisional.
 * Habits use the version valid on each date; per-week rest is decided day by day (R4).
 */
export function evaluateArc(input: EvaluateInput): EvaluatedDay[] {
  const { arc, now } = input;
  const today = localDate(now, arc.timeZone);
  const last = minDate(today, arcEndDate(arc.startDate, arc.durationDays));

  const versionsByHabit = groupBy(input.habitVersions, (v) => v.habitId);
  const entryByKey = new Map(input.entries.map((e) => [`${e.habitId}|${e.date}`, e]));
  const sickDates = new Set(input.dayLogs.filter((l) => l.isSick).map((l) => l.date));
  /** Done/Minimum count per habit per week, for R4. */
  const achieved = new Map<string, number>();

  return eachDay(arc.startDate, last).map((date) => {
    const final = isFinal(date, now, arc.timeZone);
    const isSick = sickDates.has(date);
    const week = weekStart(date);

    const habits = [...versionsByHabit.values()]
      .map((versions) => habitOn(versions, date))
      .filter((h) => h !== undefined)
      .sort((a, b) => a.order - b.order);

    const entries: ResolvedEntry[] = habits.map((habit) => {
      const key = `${habit.id}|${week}`;
      const achievedBefore = achieved.get(key) ?? 0;
      const resolved = resolveEntry({
        habit,
        entry: entryByKey.get(`${habit.id}|${date}`),
        final,
        isSick,
        restDay: !isScheduled(habit, date),
        perWeekRest:
          habit.schedule.kind === "perWeek" &&
          perWeekRestEligible(habit.schedule.times, date, achievedBefore, arc),
      });
      if (resolved.status === "done" || resolved.status === "minimum") {
        achieved.set(key, achievedBefore + 1);
      }
      return resolved;
    });

    return { ...dayResult(date, entries, arc.strongThreshold), final };
  });
}

/**
 * Entries to store when a day is finalised: every habit still pending becomes
 * Missed with source "cutoff" (TC22). Values (count/time/checklist) stay as logged.
 */
export function cutoffWrites(
  date: ISODate,
  finalEntries: readonly ResolvedEntry[],
  entries: readonly HabitEntry[],
  now: Date,
): HabitEntry[] {
  return finalEntries
    .filter((r) => r.status === "missed")
    .filter((r) => {
      const e = entries.find((x) => x.habitId === r.habitId && x.date === date);
      return !e || e.status === "unlogged";
    })
    .map((r) => {
      const existing = entries.find((x) => x.habitId === r.habitId && x.date === date);
      return {
        habitId: r.habitId,
        date,
        value: existing?.value ?? null,
        loggedTime: existing?.loggedTime ?? null,
        durationMin: existing?.durationMin ?? null,
        status: "missed",
        source: "cutoff",
        updatedAt: now.toISOString(),
      };
    });
}

function groupBy<T>(items: readonly T[], key: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) map.set(key(item), [...(map.get(key(item)) ?? []), item]);
  return map;
}
