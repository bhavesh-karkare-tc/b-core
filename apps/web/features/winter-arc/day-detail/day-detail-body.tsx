"use client";

import { Button } from "@b-core/ui/components/button";
import { cn } from "@b-core/ui/lib/cn";
import { Lock, PencilLine, Thermometer } from "lucide-react";
import { useState } from "react";
import type { DayDetailView } from "@/data";
import { STREAK_STATE_LABEL } from "../lib/format";
import { streakEffectCopy } from "../lib/streak-copy";
import { HabitList } from "../today/habit-list";
import { HabitSheet } from "../today/sheets/habit-sheet";
import { useQuickAction } from "../today/use-quick-action";

type Props = {
  view: DayDetailView;
  threshold: number;
  run: (mutation: () => Promise<unknown>) => Promise<void>;
  error: string | null;
  onDismissError: () => void;
};

const MOOD = ["", "Drained", "Low", "Okay", "Good", "Great"] as const;

/** Day Detail content (MASTER_DOC §10, §13 #13): editable, locked or sick. */
export function DayDetailBody({ view, threshold, run, error, onDismissError }: Props) {
  const { day } = view;
  const [openId, setOpenId] = useState<string | null>(null);
  const quickAction = useQuickAction(run, (row) => setOpenId(row.habit.id));
  const open = day.habits.find((r) => r.habit.id === openId && r.quickAction) ?? null;
  const closes = day.editWindow.editable
    ? day.editWindow.closesAt.toLocaleString("en-US", {
        weekday: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 rounded-row border border-line bg-surface-2 p-3 text-center">
        <div>
          <p className="font-mono text-2xl font-semibold">{day.score ?? "—"}</p>
          <p className="text-xs text-text-muted">score</p>
        </div>
        <div>
          <p
            className={cn(
              "font-mono text-2xl font-semibold",
              day.isSick ? "text-text-muted" : day.isStrong ? "text-accent" : "text-ember",
            )}
          >
            {day.isSick ? "Sick" : day.isStrong ? "Strong" : "Weak"}
          </p>
          <p className="text-xs text-text-muted">at {threshold}</p>
        </div>
        <div>
          <p className="font-mono text-2xl font-semibold">{view.streakAfter.current}</p>
          <p className="text-xs text-text-muted">
            streak · {STREAK_STATE_LABEL[view.streakAfter.state]}
          </p>
        </div>
        <p className="col-span-3 text-sm font-semibold">
          {streakEffectCopy(view.streakEffect, view.streakAfter.current)}
        </p>
      </div>

      {day.isSick ? (
        <p role="status" className="flex items-center gap-2 text-sm text-text-muted">
          <Thermometer className="size-4" aria-hidden="true" />
          Sick day. Score not counted, streak frozen.
        </p>
      ) : closes ? (
        <p role="status" className="flex items-center gap-2 text-sm text-accent">
          <PencilLine className="size-4" aria-hidden="true" />
          Editable until {closes}.
        </p>
      ) : (
        <p role="status" className="flex items-center gap-2 text-sm text-text-muted">
          <Lock className="size-4" aria-hidden="true" />
          Locked. Logs close at noon the next day.
        </p>
      )}

      {error ? (
        <div
          role="alert"
          className="flex items-center justify-between gap-3 rounded-row border border-ember-line bg-ember-surface px-4 py-3 text-sm text-ember-soft"
        >
          {error}
          <Button variant="ghost" onClick={onDismissError} className="text-ember-soft">
            Dismiss
          </Button>
        </div>
      ) : null}

      <HabitList
        title="Habits"
        showEdit={false}
        rows={day.habits}
        onOpen={(row) => setOpenId(row.habit.id)}
        onQuickAction={(row) => quickAction(row, day.date)}
      />

      {day.journal || day.mood ? (
        <section className="flex flex-col gap-1 rounded-row border border-line bg-surface p-3">
          <h3 className="font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase">
            Journal
          </h3>
          {day.journal ? <p className="text-sm">{day.journal}</p> : null}
          {day.mood ? (
            <p className="text-xs text-text-muted">
              Mood {day.mood}/5 · {MOOD[day.mood]}
            </p>
          ) : null}
        </section>
      ) : null}

      <HabitSheet row={open} date={day.date} run={run} onClose={() => setOpenId(null)} />
    </div>
  );
}
