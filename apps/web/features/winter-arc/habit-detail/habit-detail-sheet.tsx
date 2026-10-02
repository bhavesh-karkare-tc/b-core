"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@b-core/ui/components/sheet";
import { useState } from "react";
import { ChapterPills } from "../tracker/chapter-pills";
import { CATEGORY_LABEL, describeHabit, describeSchedule } from "../habits/drafts";
import { useMediaQuery } from "../lib/use-media-query";
import { CountChart } from "./count-chart";
import { HabitCalendar } from "./habit-calendar";
import { TimeChart } from "./time-chart";
import { useHabitDetail } from "./use-habit-detail";
import { WeekCompletion } from "./week-completion";

type Props = { habitId: string | null; onClose: () => void };

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-xl font-semibold">{value}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  );
}

/** Habit Detail (screen #15): bottom sheet on mobile, right drawer on web. */
export function HabitDetailSheet({ habitId, onClose }: Props) {
  const wide = useMediaQuery("(min-width: 64rem)");
  const [chapter, setChapter] = useState<{ habitId: string; index: number } | null>(null);
  const state = useHabitDetail(
    habitId,
    chapter && chapter.habitId === habitId ? chapter.index : undefined,
  );
  const view = state.status === "ready" && state.view.habit.id === habitId ? state.view : null;
  const h = view?.habit;

  return (
    <Sheet open={habitId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={wide ? "right" : "bottom"}
        className={wide ? "max-w-lg" : "mx-auto max-h-[92dvh] w-full max-w-xl"}
      >
        <SheetHeader>
          <SheetTitle>{h?.name ?? "Habit"}</SheetTitle>
          <SheetDescription>
            {h
              ? `${describeHabit(h)} · ${describeSchedule(h.schedule)} · ${CATEGORY_LABEL[h.category]}`
              : ""}
          </SheetDescription>
        </SheetHeader>
        {view && h ? (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-4 gap-2 rounded-row border border-line bg-surface-2 p-3">
              <Stat
                label="complete"
                value={view.completion === null ? "—" : `${Math.round(view.completion * 100)}%`}
              />
              <Stat label="streak" value={String(view.currentStreak)} />
              <Stat label="best" value={String(view.bestStreak)} />
              <Stat label="minimum" value={String(view.minimumCount)} />
            </div>
            <section className="flex flex-col gap-2.5">
              <ChapterPills
                chapters={view.chapters}
                current={view.chapter.index}
                onSelect={(index) => setChapter({ habitId: h.id, index })}
              />
              <HabitCalendar cells={view.calendar} />
            </section>
            {h.type === "count" && view.values ? (
              <section className="flex flex-col gap-2">
                <h3 className="font-semibold">
                  Daily {h.unit} · {view.chapter.label}
                </h3>
                <CountChart
                  values={view.values}
                  target={h.target}
                  minimum={h.minimum}
                  unit={h.unit}
                />
              </section>
            ) : null}
            {h.type === "time" && view.times ? (
              <section className="flex flex-col gap-2">
                <h3 className="font-semibold">Logged time · {view.chapter.label}</h3>
                <TimeChart times={view.times} target={h.target} minimum={h.minimum} />
              </section>
            ) : null}
            <section className="flex flex-col gap-2">
              <h3 className="font-semibold">Completion by week</h3>
              <WeekCompletion weeks={view.weeks} />
            </section>
          </div>
        ) : state.status === "missing" ? (
          <p className="text-sm text-text-muted">This habit isn&apos;t in your current arc.</p>
        ) : (
          <div className="h-64 animate-pulse rounded-row bg-surface-2" aria-busy="true" />
        )}
      </SheetContent>
    </Sheet>
  );
}
