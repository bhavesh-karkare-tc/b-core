"use client";

import { Button } from "@b-core/ui/components/button";
import { CloudOff, Flag, Trophy, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyPage } from "@/components/shell/empty-page";
import type { HabitRowView } from "@/data";
import { useOnline } from "../lib/use-online";
import { ChapterProgress } from "./chapter-progress";
import { CloseDaySheet } from "./close-day-sheet";
import { Countdown } from "./countdown";
import { HabitList } from "./habit-list";
import { ScoreCard } from "./score-card";
import { SickDayButton } from "./sick-day-button";
import { HabitSheet } from "./sheets/habit-sheet";
import { TodayBanners } from "./today-banners";
import { TodayHeader } from "./today-header";
import { TodaySkeleton } from "./today-skeleton";
import { useDay } from "./use-day";
import { useQuickAction } from "./use-quick-action";
import { useToday } from "./use-today";
import { YesterdayView } from "./yesterday-view";

export function TodayScreen() {
  const { state, refresh, run, actionError, clearActionError } = useToday();
  const [openRow, setOpenRow] = useState<{ habitId: string; date: string } | null>(null);
  const [yesterdayDate, setYesterdayDate] = useState<string | null>(null);
  const yesterday = useDay(yesterdayDate);
  const online = useOnline();
  const quickAction = useQuickAction(run, (row, date) =>
    setOpenRow({ habitId: row.habit.id, date }),
  );

  /** Mutations on yesterday refresh both views. */
  const runAndReload = async (mutation: () => Promise<unknown>) => {
    await run(mutation);
    await yesterday.reload();
  };

  if (state.status === "loading") return <TodaySkeleton />;

  if (state.status === "error") {
    return (
      <div role="alert">
        <EmptyPage
          level={1}
          icon={TriangleAlert}
          title="Today could not load"
          description={state.message}
        >
          <Button variant="secondary" onClick={() => void refresh()}>
            Try again
          </Button>
        </EmptyPage>
      </div>
    );
  }

  const { view } = state;

  if (view.kind === "no_arc") {
    return (
      <EmptyPage
        level={1}
        icon={Flag}
        title="Start your Winter Arc"
        description="92 days. 10 habits. Never miss two."
      >
        <Button asChild>
          <Link href="/winter-arc/setup">Start my arc</Link>
        </Button>
      </EmptyPage>
    );
  }

  if (view.kind === "countdown") {
    return <Countdown arc={view.arc} daysUntilStart={view.daysUntilStart} myWhy={view.myWhy} />;
  }

  if (view.kind === "completed") {
    return (
      <EmptyPage
        level={1}
        icon={Trophy}
        title="Arc complete"
        description={`All ${view.arc.durationDays} days are in. Your final report is on the way.`}
      >
        <Button asChild variant="secondary">
          <Link href="/winter-arc/reports">View reports</Link>
        </Button>
      </EmptyPage>
    );
  }

  const errorAlert = actionError ? (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-row border border-ember-line bg-ember-surface px-4 py-3 text-sm text-ember-soft"
    >
      {actionError}
      <Button variant="ghost" onClick={clearActionError} className="text-ember-soft">
        Dismiss
      </Button>
    </div>
  ) : null;

  if (yesterdayDate && yesterday.day) {
    return (
      <div className="flex flex-col gap-3">
        {errorAlert}
        <YesterdayView
          day={yesterday.day}
          run={runAndReload}
          onBack={() => setYesterdayDate(null)}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[18px]">
      {!online ? (
        <p className="flex items-center gap-2 self-start rounded-full border border-line bg-surface-2 px-3 py-1.5 font-mono text-[11px] tracking-wider text-text-muted uppercase">
          <CloudOff className="size-3.5" aria-hidden="true" />
          Offline · saved on this device
        </p>
      ) : null}
      <TodayHeader
        date={view.day.date}
        dayNumber={view.day.dayNumber}
        durationDays={view.arc.durationDays}
        streak={view.streak}
      />
      <ChapterProgress chapters={view.chapters} current={view.currentChapter} />
      <TodayBanners
        banners={view.banners}
        date={view.day.date}
        threshold={view.arc.strongThreshold}
        nowMs={new Date(view.now).getTime()}
        onOpenYesterday={setYesterdayDate}
      />
      <ScoreCard
        day={view.day}
        threshold={view.arc.strongThreshold}
        streak={view.streak}
        rank={view.rank.name}
      />
      {errorAlert}
      <HabitList
        rows={view.day.habits}
        onOpen={(row) => setOpenRow({ habitId: row.habit.id, date: view.day.date })}
        onQuickAction={(row) => quickAction(row, view.day.date)}
      />
      <SickDayButton day={view.day} sickDaysLeft={view.sickDaysLeft} run={run} />
      <CloseDaySheet day={view.day} run={run} />
      <HabitSheet
        row={findRow(view.day.habits, openRow, view.day.date)}
        date={view.day.date}
        run={run}
        onClose={() => setOpenRow(null)}
      />
    </div>
  );
}

/** The open sheet follows fresh data after each mutation. Only editable rows open a sheet. */
function findRow(
  rows: HabitRowView[],
  open: { habitId: string; date: string } | null,
  date: string,
): HabitRowView | null {
  if (!open || open.date !== date) return null;
  const row = rows.find((r) => r.habit.id === open.habitId);
  return row?.quickAction ? row : null;
}
