/**
 * Dashboard view model (MASTER_DOC §10). Pure: stored arc + engine → DashboardView.
 * Section A reflects the current state; Section B follows the arc / chapter filter (TC45).
 */
import {
  arcPoints,
  chapterFor,
  chapterTotals,
  computeHabitStreak,
  dayNumber,
  dayOfWeekPattern,
  diffDays,
  eachDay,
  evaluateArc,
  generateChapters,
  habitCompletion,
  hasArcStarted,
  heatLevel,
  INSIGHTS_UNLOCK_DAY,
  insightsUnlocked,
  localDate,
  minimumOveruse,
  movingAverage,
  nextRank,
  rankFor,
  streakAtRisk,
  weakestHabit,
  weekStart,
  addDays,
  arcEndDate,
  habitsNeededForStrong,
  type EntryStatus,
  type EvaluatedDay,
  type Habit,
} from "@b-core/arc-engine";
import type {
  DashboardFilter,
  DashboardView,
  HabitStatsView,
  Insight,
  StoredArc,
  TrackerChapter,
} from "./types";
import { arcSummary, currentHabits, streakView } from "./view-models";

const WEEKDAY_LONG = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const monthLong = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });
const CATEGORIES: Habit["category"][] = ["body", "mind", "discipline"];

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

function statusesFor(days: readonly EvaluatedDay[], habitId: string): EntryStatus[] {
  return days.flatMap((d) => d.entries.filter((e) => e.habitId === habitId).map((e) => e.status));
}

export function buildDashboardView(
  data: StoredArc | null,
  now: Date,
  filter: DashboardFilter = { kind: "arc" },
): DashboardView {
  if (!data) return { kind: "no_arc" };
  const { arc } = data;
  const summary = arcSummary(data);
  const today = localDate(now, arc.timeZone);
  if (!hasArcStarted(arc, now)) {
    return { kind: "countdown", arc: summary, daysUntilStart: diffDays(arc.startDate, today) };
  }

  const days = evaluateArc({ ...data, now });
  const finalDays = days.filter((d) => d.final);
  const todayEval = days.at(-1);
  const arcEnd = arcEndDate(arc.startDate, arc.durationDays);
  const lastDate = todayEval?.date ?? arc.startDate;
  const dayNo = Math.min(dayNumber(arc.startDate, lastDate), arc.durationDays);

  // Chapters and the filter range.
  const chapters = generateChapters(arc.startDate, arc.durationDays);
  const chapterViews: TrackerChapter[] = chapters.map((c) => ({
    index: c.index,
    label: monthLong.format(new Date(`${c.startDate}T00:00:00Z`)),
    startDate: c.startDate,
    endDate: c.endDate,
    days: c.days,
    started: today >= c.startDate,
  }));
  const currentChapter = chapterFor(chapters, lastDate) ?? chapters[0];
  const wanted =
    filter.kind === "current"
      ? currentChapter?.index
      : filter.kind === "chapter"
        ? filter.index
        : undefined;
  const filtered = wanted === undefined ? undefined : chapters.find((c) => c.index === wanted);
  const effectiveFilter: Exclude<DashboardFilter, { kind: "current" }> = filtered
    ? { kind: "chapter", index: filtered.index }
    : { kind: "arc" };
  const range = filtered
    ? { start: filtered.startDate, end: filtered.endDate }
    : { start: arc.startDate, end: arcEnd };
  const inRange = (d: { date: string }) => d.date >= range.start && d.date <= range.end;
  const rangeFinal = finalDays.filter(inRange);

  // Section A tiles.
  const [chapterTotal] = currentChapter ? chapterTotals(days, [currentChapter]) : [];
  const reachedInChapter = currentChapter
    ? days.filter((d) => d.date >= currentChapter.startDate && d.date <= currentChapter.endDate)
        .length
    : 0;
  const thisWeek = weekStart(lastDate);
  const lastWeek = addDays(thisWeek, -7);
  const weekScores = (start: string) =>
    days
      .filter((d) => d.date >= start && d.date < addDays(start, 7))
      .flatMap((d) => (d.score === null ? [] : [d.score]));
  const weekAvg = mean(weekScores(thisWeek));
  const lastWeekAvg = mean(weekScores(lastWeek));
  const arcScores = days.flatMap((d) => (d.score === null ? [] : [d.score]));
  const points = arcPoints(days);
  const next = nextRank(points, arc.durationDays);
  const streak = streakView(days.slice(0, -1));

  // Section B: heatmap and trend.
  const byDate = new Map(days.map((d) => [d.date, d]));
  const heatmap = eachDay(range.start, range.end).map((date) => {
    const ev = byDate.get(date);
    return {
      date,
      dayNumber: dayNumber(arc.startDate, date),
      level: ev ? heatLevel(ev.score) : ("future" as const),
      score: ev?.score ?? null,
      isToday: date === today,
    };
  });
  const averages = movingAverage(days.map((d) => d.score));
  const trend = days
    .map((d, i) => ({ date: d.date, score: d.score, average7: averages[i] ?? null }))
    .filter(inRange);

  // Habit completion (finalised days in range) and streaks (whole arc).
  const habits = currentHabits(data);
  const habitStats: HabitStatsView[] = habits.map((h) => {
    const c = habitCompletion(statusesFor(rangeFinal, h.id));
    const s = computeHabitStreak(statusesFor(days, h.id));
    return {
      habitId: h.id,
      number: String(h.order).padStart(2, "0"),
      name: h.name,
      category: h.category,
      type: h.type,
      completion: c.ratio,
      done: c.done,
      minimum: c.minimum,
      missed: c.missed,
      rest: c.rest,
      counted: c.counted,
      currentStreak: s.current,
      bestStreak: s.best,
    };
  });
  habitStats.sort((a, b) => (a.completion ?? 2) - (b.completion ?? 2));
  const categories = CATEGORIES.map((category) => {
    const ids = habits.filter((h) => h.category === category).map((h) => h.id);
    const c = habitCompletion(ids.flatMap((id) => statusesFor(rangeFinal, id)));
    return { category, completion: c.ratio, counted: c.counted };
  }).filter((c) => habits.some((h) => h.category === c.category));

  // Section C: insights (finalised days, except streak risk which uses today).
  const items: Insight[] = [];
  if (todayEval && streakAtRisk(streak.state, todayEval.isStrong)) {
    items.push({
      kind: "streak_risk",
      threshold: arc.strongThreshold,
      habitsNeeded: habitsNeededForStrong(todayEval.entries, arc.strongThreshold),
    });
  }
  const weekOf = (start: string) =>
    finalDays.filter((d) => d.date >= start && d.date < addDays(start, 7));
  const weakest = weakestHabit(
    habits.map((h) => ({
      habitId: h.id,
      thisWeek: statusesFor(weekOf(thisWeek), h.id),
      lastWeek: statusesFor(weekOf(lastWeek), h.id),
    })),
  );
  if (weakest) {
    const name = habits.find((h) => h.id === weakest.habitId)?.name ?? "";
    items.push({
      kind: "weakest_habit",
      habitId: weakest.habitId,
      name,
      ratio: weakest.ratio,
      change: weakest.change,
    });
  }
  const pattern = dayOfWeekPattern(finalDays);
  if (pattern) {
    items.push({
      kind: "day_of_week",
      weekday: WEEKDAY_LONG[pattern.weekday],
      average: Math.round(pattern.average),
      othersAverage: Math.round(pattern.othersAverage),
      gap: Math.round(pattern.gap),
    });
  }
  for (const h of habits) {
    const overuse = minimumOveruse(statusesFor(finalDays, h.id));
    if (overuse) items.push({ kind: "minimum_overuse", habitId: h.id, name: h.name, ...overuse });
  }

  return {
    kind: "dashboard",
    arc: summary,
    dayNumber: dayNo,
    progress: dayNo / arc.durationDays,
    filter: effectiveFilter,
    chapters: chapterViews,
    tiles: {
      today: { score: todayEval?.score ?? null, provisional: todayEval?.provisional ?? false },
      week: {
        average: weekAvg,
        change: weekAvg !== null && lastWeekAvg !== null ? weekAvg - lastWeekAvg : null,
      },
      chapter: {
        index: currentChapter?.index ?? 1,
        label: chapterViews.find((c) => c.index === currentChapter?.index)?.label ?? "",
        average: chapterTotal?.average ?? null,
        total: chapterTotal?.total ?? 0,
        maxSoFar: reachedInChapter * 100,
      },
      arc: { average: mean(arcScores), total: points },
      strongDays: {
        count: finalDays.filter((d) => d.isStrong).length,
        finalised: finalDays.length,
      },
    },
    streak,
    rank: {
      name: rankFor(points, arc.durationDays),
      points,
      next: next ? { name: next.name, remaining: next.remaining } : null,
    },
    heatmap,
    trend,
    habits: habitStats,
    categories,
    bodyChecks: [...data.bodyChecks].sort((a, b) => a.date.localeCompare(b.date)),
    insights: {
      unlocked: insightsUnlocked(dayNo),
      unlockDay: INSIGHTS_UNLOCK_DAY,
      items: insightsUnlocked(dayNo) ? items : [],
    },
  };
}
