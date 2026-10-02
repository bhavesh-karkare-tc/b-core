"use client";

import { Button } from "@b-core/ui/components/button";
import { Flag, Trophy, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { HabitRowView } from "@/data";
import { EmptyPage } from "@/components/shell/empty-page";
import { ChapterProgress } from "./chapter-progress";
import { Countdown } from "./countdown";
import { HabitList } from "./habit-list";
import { ScoreCard } from "./score-card";
import { TodayHeader } from "./today-header";
import { TodaySkeleton } from "./today-skeleton";
import { HabitSheet } from "./sheets/habit-sheet";
import { useQuickAction } from "./use-quick-action";
import { useToday } from "./use-today";

export function TodayScreen() {
  const { state, refresh, run, actionError, clearActionError } = useToday();
  const [openRow, setOpenRow] = useState<{ habitId: string; date: string } | null>(null);
  const quickAction = useQuickAction(run, (row, date) =>
    setOpenRow({ habitId: row.habit.id, date }),
  );

  if (state.status === "loading") return <TodaySkeleton />;

  if (state.status === "error") {
    return (
      <div role="alert">
        <EmptyPage icon={TriangleAlert} title="Today could not load" description={state.message}>
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

  return (
    <div className="flex flex-col gap-[18px]">
      <TodayHeader
        date={view.day.date}
        dayNumber={view.day.dayNumber}
        durationDays={view.arc.durationDays}
        streak={view.streak}
      />
      <ChapterProgress chapters={view.chapters} current={view.currentChapter} />
      <ScoreCard
        day={view.day}
        threshold={view.arc.strongThreshold}
        streak={view.streak}
        rank={view.rank.name}
      />
      {actionError ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-row border border-ember-line bg-ember-surface px-4 py-3 text-sm text-ember-soft"
        >
          {actionError}
          <Button variant="ghost" onClick={clearActionError} className="text-ember-soft">
            Dismiss
          </Button>
        </div>
      ) : null}
      <HabitList
        rows={view.day.habits}
        onOpen={(row) => setOpenRow({ habitId: row.habit.id, date: view.day.date })}
        onQuickAction={(row) => quickAction(row, view.day.date)}
      />
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
