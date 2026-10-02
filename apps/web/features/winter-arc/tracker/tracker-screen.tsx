"use client";

import { Button } from "@b-core/ui/components/button";
import { Flag, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { EmptyPage } from "@/components/shell/empty-page";
import { shortDate } from "../lib/format";
import { ChapterPills } from "./chapter-pills";
import { MonthGrid } from "./month-grid";
import { TrackerHeader } from "./tracker-header";
import { TrackerLegend } from "./tracker-legend";
import { TrackerSkeleton } from "./tracker-skeleton";
import { useTracker } from "./use-tracker";

export function TrackerScreen() {
  const [chapter, setChapter] = useState<number | undefined>(undefined);
  const { state, reload } = useTracker(chapter);

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

  return (
    <div className="flex flex-col gap-3.5">
      <TrackerHeader view={view} />
      <ChapterPills chapters={view.chapters} current={view.chapter.index} onSelect={setChapter} />
      <TrackerLegend />
      {!view.chapter.started ? (
        <p
          role="status"
          className="rounded-row border border-line bg-surface px-4 py-3 text-sm text-text-muted"
        >
          {view.chapter.label} starts {shortDate(view.chapter.startDate)}. Scheduled rest days are
          already marked.
        </p>
      ) : null}
      <MonthGrid columns={view.columns} rows={view.rows} threshold={view.arc.strongThreshold} />
    </div>
  );
}
