/** Habit Detail view model (MASTER_DOC §10). Pure: stored arc + engine → HabitDetailView. */
import {
  addDays,
  chapterFor,
  computeHabitStreak,
  eachDay,
  evaluateArc,
  generateChapters,
  habitCompletion,
  habitOn,
  isScheduled,
  localDate,
  weekStart,
  type EntryStatus,
} from "@b-core/arc-engine";
import type { ArcData, HabitDetailView, TrackerCellState, TrackerChapter } from "./types";
import { currentHabits } from "./view-models";

const monthLong = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });

export function buildHabitDetail(
  data: ArcData,
  habitId: string,
  now: Date,
  chapterIndex?: number,
): HabitDetailView | null {
  const habit = currentHabits(data).find((h) => h.id === habitId);
  if (!habit) return null;
  const { arc } = data;
  const today = localDate(now, arc.timeZone);
  const days = evaluateArc({ ...data, now });
  const byDate = new Map(days.map((d) => [d.date, d]));
  const statusOn = (date: string): EntryStatus | undefined =>
    byDate.get(date)?.entries.find((e) => e.habitId === habitId)?.status;
  const finalStatuses = days
    .filter((d) => d.final)
    .flatMap((d) => {
      const s = statusOn(d.date);
      return s ? [s] : [];
    });
  const allStatuses = days.flatMap((d) => {
    const s = statusOn(d.date);
    return s ? [s] : [];
  });

  const chapters = generateChapters(arc.startDate, arc.durationDays);
  const chapterViews: TrackerChapter[] = chapters.map((c) => ({
    index: c.index,
    label: monthLong.format(new Date(`${c.startDate}T00:00:00Z`)),
    startDate: c.startDate,
    endDate: c.endDate,
    days: c.days,
    started: today >= c.startDate,
  }));
  const selected =
    chapters.find((c) => c.index === chapterIndex) ??
    chapterFor(chapters, today) ??
    chapters.at(-1) ??
    chapters[0];
  if (!selected) return null;
  const versions = data.habitVersions.filter((v) => v.habitId === habitId);

  const calendar = eachDay(selected.startDate, selected.endDate).map((date) => {
    const status = statusOn(date);
    let state: TrackerCellState;
    if (status) state = status;
    else {
      const version = habitOn(versions, date);
      state = !version ? "none" : !isScheduled(version, date) ? "rest" : "future";
    }
    return { date, state, isToday: date === today };
  });

  // Completion per week across the arc so far (finalised days).
  const weeks: HabitDetailView["weeks"] = [];
  for (let start = weekStart(arc.startDate); start <= today; start = addDays(start, 7)) {
    const statuses = days
      .filter((d) => d.final && d.date >= start && d.date < addDays(start, 7))
      .flatMap((d) => {
        const s = statusOn(d.date);
        return s ? [s] : [];
      });
    const c = habitCompletion(statuses);
    weeks.push({ weekStart: start, completion: c.ratio, counted: c.counted });
  }

  const reached = calendar.filter((c) => byDate.has(c.date)).map((c) => c.date);
  const entryOn = (date: string) =>
    data.entries.find((e) => e.habitId === habitId && e.date === date);
  const completion = habitCompletion(finalStatuses);
  const streak = computeHabitStreak(allStatuses);

  return {
    habit,
    chapters: chapterViews,
    chapter:
      chapterViews.find((c) => c.index === selected.index) ?? (chapterViews[0] as TrackerChapter),
    completion: completion.ratio,
    currentStreak: streak.current,
    bestStreak: streak.best,
    minimumCount: completion.minimum,
    calendar,
    weeks,
    values:
      habit.type === "count"
        ? reached.map((date) => ({ date, value: entryOn(date)?.value ?? null }))
        : null,
    times:
      habit.type === "time"
        ? reached.map((date) => ({ date, loggedTime: entryOn(date)?.loggedTime ?? null }))
        : null,
  };
}
