/**
 * Pure builders: stored arc data + engine → view models. No storage, no clock reads.
 * Shared by every data implementation so the UI sees identical shapes.
 */
import {
  arcEndDate,
  arcPoints,
  canUseSickDay,
  chapterFor,
  chapterTotals,
  computeArcStreak,
  dayNumber,
  diffDays,
  editWindow,
  eachDay,
  evaluateArc,
  generateChapters,
  habitOn,
  habitsNeededForStrong,
  hasArcStarted,
  isArcComplete,
  isScheduled,
  localDate,
  nextRank,
  rankFor,
  sickDaysRemaining,
  weekday,
  type EvaluatedDay,
  type Habit,
  type HabitVersion,
  type ISODate,
  type ResolvedEntry,
} from "@b-core/arc-engine";
import type {
  ArcData,
  ArcSummary,
  Banner,
  ChapterView,
  CloseDaySummary,
  DayDetailView,
  DayView,
  HabitRowView,
  QuickAction,
  StoredEntry,
  StreakEffect,
  StreakView,
  TodayView,
  TrackerCell,
  TrackerChapter,
  TrackerRow,
  TrackerView,
} from "./types";

const STATUS_LABEL: Record<ResolvedEntry["status"], string> = {
  done: "Done",
  minimum: "Minimum",
  missed: "Missed",
  rest: "Rest",
  sick: "Sick",
  unlogged: "Not logged",
};

const numberFormat = new Intl.NumberFormat("en-US");

/** "00:30" → "12:30 AM". */
export function formatClock(time: string): string {
  const [h = 0, m = 0] = time.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function arcSummary(data: ArcData): ArcSummary {
  const { arc } = data;
  return {
    id: arc.id,
    name: "Winter Arc",
    startDate: arc.startDate,
    endDate: arcEndDate(arc.startDate, arc.durationDays),
    durationDays: arc.durationDays,
    strongThreshold: arc.strongThreshold,
    timeZone: arc.timeZone,
  };
}

function habitsOn(versions: readonly HabitVersion[], date: ISODate): Map<string, Habit> {
  const byHabit = new Map<string, HabitVersion[]>();
  for (const v of versions) byHabit.set(v.habitId, [...(byHabit.get(v.habitId) ?? []), v]);
  const result = new Map<string, Habit>();
  for (const [id, list] of byHabit) {
    const habit = habitOn(list, date);
    if (habit) result.set(id, habit);
  }
  return result;
}

function meta(habit: Habit, r: ResolvedEntry, e: StoredEntry | undefined): string {
  if (r.paused) return "Paused";
  if (r.status === "rest") return "Rest day";
  if (r.status === "sick") return "Sick day";
  switch (habit.type) {
    case "count":
      return `${numberFormat.format(e?.value ?? 0)} / ${numberFormat.format(habit.target)} ${habit.unit}`;
    case "checklist":
      return `${e?.value ?? 0} / ${habit.items} tasks`;
    case "time":
      return e?.loggedTime
        ? `Logged ${formatClock(e.loggedTime)}`
        : `Target ${formatClock(habit.target)}`;
    case "session":
      if (r.status === "done" || r.status === "minimum") {
        return e?.durationMin ? `Session · ${e.durationMin} min` : "Session logged";
      }
      return habit.minimumText ? `Min: ${habit.minimumText}` : "Session";
    case "yesno":
      if (r.status === "minimum" && habit.minimumText) return `Minimum · ${habit.minimumText}`;
      if (!habit.hasMinimum) return "Done or missed";
      return habit.minimumText ? `Min: ${habit.minimumText}` : "Yes / no";
  }
}

function progress(habit: Habit, r: ResolvedEntry, e: StoredEntry | undefined): number | null {
  if (r.status === "done" || r.status === "rest" || r.status === "sick") return null;
  if (habit.type === "count") return Math.min(1, (e?.value ?? 0) / habit.target);
  if (habit.type === "checklist") return Math.min(1, (e?.value ?? 0) / habit.items);
  return null;
}

const QUICK_ACTION: Record<Habit["type"], QuickAction> = {
  yesno: "toggle",
  count: "increment",
  time: "log-time",
  session: "session-done",
  checklist: "open-checklist",
};

function habitRows(
  evaluated: EvaluatedDay,
  habits: Map<string, Habit>,
  entries: readonly StoredEntry[],
  editable: boolean,
): HabitRowView[] {
  return evaluated.entries.flatMap((r) => {
    const habit = habits.get(r.habitId);
    if (!habit) return [];
    const e = entries.find((x) => x.habitId === r.habitId && x.date === evaluated.date);
    const locked = !editable || r.status === "rest" || r.status === "sick" || r.paused;
    return [
      {
        habit,
        number: String(habit.order).padStart(2, "0"),
        status: r.status,
        statusLabel:
          r.provisional && r.status === "minimum" ? "Minimum so far" : STATUS_LABEL[r.status],
        points: r.points,
        provisional: r.provisional,
        paused: r.paused,
        meta: meta(habit, r, e),
        progress: progress(habit, r, e),
        value: e?.value ?? null,
        loggedTime: e?.loggedTime ?? null,
        durationMin: e?.durationMin ?? null,
        checklist: habit.type === "checklist" ? checklistItems(habit.items, e) : null,
        quickAction: locked ? null : QUICK_ACTION[habit.type],
      },
    ];
  });
}

/** Checklist items for a day; blank "Task n" slots when nothing stored. */
export function checklistItems(count: number, e: StoredEntry | undefined) {
  return Array.from({ length: count }, (_, i) => e?.checklist?.[i] ?? { text: "", done: false });
}

function dayView(data: ArcData, evaluated: EvaluatedDay, now: Date): DayView {
  const { arc } = data;
  const window = editWindow(evaluated.date, now, arc);
  const log = data.dayLogs.find((l) => l.date === evaluated.date);
  const habits = habitRows(
    evaluated,
    habitsOn(data.habitVersions, evaluated.date),
    data.entries,
    window.editable,
  );
  const counted = evaluated.entries.filter((e) => e.points !== null);
  return {
    date: evaluated.date,
    dayNumber: dayNumber(arc.startDate, evaluated.date),
    score: evaluated.score,
    provisional: evaluated.provisional,
    final: evaluated.final,
    isStrong: evaluated.isStrong,
    isWeak: evaluated.isWeak,
    isSick: evaluated.isSick,
    recoveryDay: evaluated.recoveryDay,
    editWindow: window,
    habits,
    doneCount: counted.filter((e) => e.status === "done").length,
    totalCount: counted.filter((e) => e.status !== "rest").length,
    habitsNeeded: habitsNeededForStrong(evaluated.entries, arc.strongThreshold),
    journal: log?.journal ?? null,
    mood: log?.mood ?? null,
    closedAt: log?.closedAt ?? null,
    sickDay: canUseSickDay(arc, evaluated.date, now, evaluated.isSick),
  };
}

function streakView(days: readonly EvaluatedDay[]): StreakView {
  const { state } = computeArcStreak(days);
  return {
    current: state.current,
    best: state.best,
    state: state.state,
    shieldsHeld: state.shieldsHeld,
  };
}

function chapterViews(data: ArcData, today: ISODate): ChapterView[] {
  const label = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  return generateChapters(data.arc.startDate, data.arc.durationDays).map((c) => ({
    index: c.index,
    label: label.format(new Date(`${c.startDate}T00:00:00Z`)).toUpperCase(),
    days: c.days,
    elapsed: Math.min(c.days, Math.max(0, diffDays(today, c.startDate) + 1)),
  }));
}

function banners(
  data: ArcData,
  day: DayView,
  yesterday: DayView | undefined,
  streak: StreakView,
): Banner[] {
  const list: Banner[] = [];
  if (day.isSick) return [{ kind: "sick_day" }];

  if (yesterday?.editWindow.editable) {
    const unlogged = yesterday.habits.filter((h) => h.status === "unlogged").length;
    if (unlogged > 0) {
      list.push({
        kind: "yesterday_unlogged",
        date: yesterday.date,
        unlogged,
        closesAt: yesterday.editWindow.closesAt.toISOString(),
      });
    }
  }

  if (streak.state === "broken") list.push({ kind: "broken", best: streak.best });
  if (streak.state === "shielded") list.push({ kind: "shielded", shieldsHeld: streak.shieldsHeld });
  if (streak.state === "at_risk" && !day.isStrong) {
    list.push({ kind: "at_risk", habitsNeeded: day.habitsNeeded });
  }
  if (day.recoveryDay) list.push({ kind: "recovery_day" });
  else if (
    day.habits.length > 0 &&
    day.habits.every((h) => h.status === "done" || h.status === "rest")
  ) {
    list.push({ kind: "all_done" });
  }
  return list;
}

/** Today screen: countdown, active day, or completed arc (MASTER_DOC §7). */
export function buildTodayView(data: ArcData | null, now: Date): TodayView {
  if (!data) return { kind: "no_arc" };
  const { arc } = data;
  const summary = arcSummary(data);

  if (!hasArcStarted(arc, now)) {
    return {
      kind: "countdown",
      arc: summary,
      daysUntilStart: diffDays(arc.startDate, localDate(now, arc.timeZone)),
      myWhy: arc.myWhy,
    };
  }
  if (isArcComplete(arc, now)) return { kind: "completed", arc: summary };

  const days = evaluateArc({ ...data, now });
  const todayEval = days.at(-1);
  // Started and not complete: there is always a last evaluated day.
  if (!todayEval) return { kind: "completed", arc: summary };

  const day = dayView(data, todayEval, now);
  const yesterdayEval = days.at(-2);
  const yesterday = yesterdayEval ? dayView(data, yesterdayEval, now) : undefined;
  const streak = streakView(days.slice(0, -1));
  const chapters = chapterViews(data, todayEval.date);
  const points = arcPoints(days);
  const next = nextRank(points, arc.durationDays);

  return {
    kind: "active",
    arc: summary,
    now: now.toISOString(),
    day,
    chapters,
    currentChapter:
      chapterFor(generateChapters(arc.startDate, arc.durationDays), todayEval.date)?.index ?? 1,
    streak,
    rank: {
      name: rankFor(points, arc.durationDays),
      points,
      next: next ? { name: next.name, remaining: next.remaining } : null,
    },
    sickDaysLeft: sickDaysRemaining(arc.durationDays, arc.sickDaysUsed),
    banners: banners(data, day, yesterday, streak),
  };
}

/** Any arc day up to today (e.g. yesterday from the banner). Null outside the evaluated range. */
export function buildDayView(data: ArcData, date: ISODate, now: Date): DayView | null {
  const evaluated = evaluateArc({ ...data, now }).find((d) => d.date === date);
  return evaluated ? dayView(data, evaluated, now) : null;
}

/** What closing `date` would mean for the streak right now (Close the day sheet). */
export function buildCloseDaySummary(
  data: ArcData,
  date: ISODate,
  now: Date,
): CloseDaySummary | null {
  const days = evaluateArc({ ...data, now }).filter((d) => d.date <= date);
  const evaluated = days.at(-1);
  if (!evaluated || evaluated.date !== date) return null;

  const before = streakView(days.slice(0, -1));
  const after = streakView(days);
  const view = dayView(data, evaluated, now);
  return {
    date,
    score: evaluated.score,
    isStrong: evaluated.isStrong,
    doneCount: view.doneCount,
    totalCount: view.totalCount,
    streak: after,
    effect: streakEffect(evaluated, before, after),
  };
}

function streakEffect(day: EvaluatedDay, before: StreakView, after: StreakView): StreakEffect {
  if (day.isSick) return "frozen";
  if (day.isStrong) return "grows";
  if (after.state === "broken" && before.state !== "broken") return "broken";
  if (after.state === "shielded") return "shielded";
  if (after.state === "at_risk") return "at_risk";
  return "holds";
}

/** Current habits (latest version each), in display order. */
export function currentHabits(data: ArcData): Habit[] {
  const byHabit = new Map<string, HabitVersion[]>();
  for (const v of data.habitVersions)
    byHabit.set(v.habitId, [...(byHabit.get(v.habitId) ?? []), v]);
  return [...byHabit.values()]
    .map((versions) => versions.reduce((a, b) => (b.validFrom >= a.validFrom ? b : a)).habit)
    .sort((a, b) => a.order - b.order);
}

const WEEKDAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const monthLong = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });

/**
 * Month tracker for one chapter (MASTER_DOC §13 #12): a row per day, a cell per habit,
 * and chapter totals. Every number comes from the engine (evaluateArc, chapterTotals).
 */
export function buildTrackerView(
  data: ArcData | null,
  now: Date,
  chapterIndex?: number,
): TrackerView {
  if (!data) return { kind: "no_arc" };
  const { arc } = data;
  const today = localDate(now, arc.timeZone);
  const evaluated = evaluateArc({ ...data, now });
  const byDate = new Map(evaluated.map((d) => [d.date, d]));
  const all = generateChapters(arc.startDate, arc.durationDays);
  const fallback = today < arc.startDate ? all[0] : all.at(-1);
  const selected = all.find((c) => c.index === chapterIndex) ?? chapterFor(all, today) ?? fallback;
  // generateChapters always returns at least one chapter for a valid arc.
  if (!selected) return { kind: "no_arc" };

  const chapters: TrackerChapter[] = all.map((c) => ({
    index: c.index,
    label: monthLong.format(new Date(`${c.startDate}T00:00:00Z`)),
    startDate: c.startDate,
    endDate: c.endDate,
    days: c.days,
    started: today >= c.startDate,
  }));
  const habits = currentHabits(data);
  const versions = new Map<string, HabitVersion[]>();
  for (const v of data.habitVersions)
    versions.set(v.habitId, [...(versions.get(v.habitId) ?? []), v]);

  const rows: TrackerRow[] = eachDay(selected.startDate, selected.endDate).map((date) => {
    const ev = byDate.get(date);
    const cells: TrackerCell[] = habits.map((col) => {
      const habit = habitOn(versions.get(col.id) ?? [], date);
      const none: TrackerCell = {
        habitId: col.id,
        state: "none",
        points: null,
        provisional: false,
      };
      if (!habit) return none;
      if (ev) {
        const r = ev.entries.find((e) => e.habitId === col.id);
        return r
          ? { habitId: col.id, state: r.status, points: r.points, provisional: r.provisional }
          : none;
      }
      const rests = !isScheduled(habit, date) || habit.status === "paused";
      return { habitId: col.id, state: rests ? "rest" : "future", points: null, provisional: true };
    });
    const log = data.dayLogs.find((l) => l.date === date);
    return {
      date,
      dayNumber: dayNumber(arc.startDate, date),
      weekday: WEEKDAY_SHORT[weekday(date)],
      dayOfMonth: Number(date.slice(8)),
      isToday: date === today,
      future: date > today,
      final: ev?.final ?? false,
      editable: editWindow(date, now, arc).editable,
      score: ev?.score ?? null,
      isSick: ev?.isSick ?? false,
      isStrong: ev?.isStrong ?? false,
      recoveryDay: ev?.recoveryDay ?? false,
      cells,
      journal: log?.journal ?? null,
      mood: log?.mood ?? null,
    };
  });

  const [t] = chapterTotals(evaluated, [selected]);
  const reached = rows.filter((r) => !r.future && r.date >= arc.startDate).length;
  return {
    kind: "tracker",
    arc: arcSummary(data),
    chapters,
    chapter: chapters.find((c) => c.index === selected.index) ?? (chapters[0] as TrackerChapter),
    columns: habits.map((h) => ({
      habitId: h.id,
      number: String(h.order).padStart(2, "0"),
      name: h.name,
      category: h.category,
    })),
    rows,
    totals: {
      total: t?.total ?? 0,
      maxSoFar: reached * 100,
      max: t?.max ?? selected.days * 100,
      countedDays: t?.countedDays ?? 0,
      strongDays: t?.strongDays ?? 0,
      average: t?.average ?? null,
    },
  };
}

/** Day Detail: the day, what it did to the streak, and the streak after it (MASTER_DOC §10). */
export function buildDayDetail(data: ArcData, date: ISODate, now: Date): DayDetailView | null {
  const days = evaluateArc({ ...data, now }).filter((d) => d.date <= date);
  const evaluated = days.at(-1);
  if (!evaluated || evaluated.date !== date) return null;
  const before = streakView(days.slice(0, -1));
  const after = streakView(days);
  return {
    day: dayView(data, evaluated, now),
    chapterIndex:
      chapterFor(generateChapters(data.arc.startDate, data.arc.durationDays), date)?.index ?? 1,
    streakEffect: streakEffect(evaluated, before, after),
    streakAfter: after,
  };
}
