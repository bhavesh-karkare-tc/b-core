"use client";

import { Button } from "@b-core/ui/components/button";
import { Flag, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyPage } from "@/components/shell/empty-page";
import { Segmented } from "../habits/segmented";
import { shortDate } from "../lib/format";
import { useMediaQuery } from "../lib/use-media-query";
import { ChapterPills } from "./chapter-pills";
import { MonthGrid } from "./month-grid";
import { TrackerHeader } from "./tracker-header";
import { TrackerLegend } from "./tracker-legend";
import { TrackerSkeleton } from "./tracker-skeleton";
import { useTracker } from "./use-tracker";
import { WeekGrid } from "./week-grid";
import { chapterWeeks, defaultWeekIndex } from "./weeks";

type Mode = "month" | "week";
const MODES = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
] as const;

export function TrackerScreen() {
  const [chapter, setChapter] = useState<number | undefined>(undefined);
  const { state, reload } = useTracker(chapter);
  const [mode, setMode] = useState<Mode>("month");
  const [week, setWeek] = useState<{ chapter: number; index: number } | null>(null);
  const wide = useMediaQuery("(min-width: 64rem)");

  if (state.status === "loading") return <TrackerSkeleton />;
  if (state.status === "error") {
    return (
      <div role="alert">
        <EmptyPage icon={TriangleAlert} title="Tracker could not load" description={state.message}>
          <Button variant="secondary" onClick={() => void reload()}>
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
        title="No arc yet"
        description="Your month grid fills in as you log each day."
      >
        <Button asChild>
          <Link href="/winter-arc/setup">Start my arc</Link>
        </Button>
      </EmptyPage>
    );
  }

  const weeks = chapterWeeks(view.rows);
  const weekIndex =
    week && week.chapter === view.chapter.index
      ? Math.min(week.index, weeks.length - 1)
      : defaultWeekIndex(weeks);
  const currentWeek = weeks[weekIndex];

  return (
    <div className="flex flex-col gap-3.5">
      <TrackerHeader view={view} />
      <ChapterPills chapters={view.chapters} current={view.chapter.index} onSelect={setChapter} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TrackerLegend />
        <div className="w-44">
          <Segmented label="View" options={MODES} value={mode} onChange={setMode} />
        </div>
      </div>
      {!view.chapter.started ? (
        <p
          role="status"
          className="rounded-row border border-line bg-surface px-4 py-3 text-sm text-text-muted"
        >
          {view.chapter.label} starts {shortDate(view.chapter.startDate)}. Scheduled rest days are
          already marked.
        </p>
      ) : null}
      {mode === "month" ? (
        <MonthGrid
          columns={view.columns}
          rows={view.rows}
          threshold={view.arc.strongThreshold}
          wide={wide}
        />
      ) : currentWeek ? (
        <WeekGrid
          columns={view.columns}
          week={currentWeek}
          index={weekIndex}
          count={weeks.length}
          threshold={view.arc.strongThreshold}
          onWeek={(i) => setWeek({ chapter: view.chapter.index, index: i })}
        />
      ) : null}
    </div>
  );
}
