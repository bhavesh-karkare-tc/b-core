"use client";

import { Button } from "@b-core/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import type { DayView, HabitRowView } from "@/data";
import { dayLabel } from "../lib/format";
import { HabitList } from "./habit-list";
import { HabitSheet } from "./sheets/habit-sheet";
import { useQuickAction } from "./use-quick-action";

type YesterdayViewProps = {
  day: DayView;
  run: (mutation: () => Promise<unknown>) => Promise<void>;
  onBack: () => void;
};

/** Log yesterday before its noon cutoff (MASTER_DOC §7 edit window, TC20). */
export function YesterdayView({ day, run, onBack }: YesterdayViewProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const quickAction = useQuickAction(run, (row) => setOpenId(row.habit.id));
  const open = day.habits.find((r) => r.habit.id === openId && r.quickAction) ?? null;
  const closes = day.editWindow.editable
    ? day.editWindow.closesAt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
    : null;

  return (
    <div className="flex flex-col gap-[18px]">
      <Button variant="ghost" className="self-start" onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
        Back to today
      </Button>
      <header className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-xs tracking-[0.16em] text-accent">
            YESTERDAY · {dayLabel(day.date)}
          </p>
          <h1 className="text-[32px] leading-none font-extrabold tracking-tight">
            Day {day.dayNumber}
          </h1>
        </div>
        <p className="font-mono text-2xl font-semibold">
          {day.score ?? "—"}
          <span className="text-sm text-text-muted"> /100</span>
        </p>
      </header>
      <p className="text-sm text-text-muted">
        {closes ? `Editable until ${closes} today.` : "Locked. Logs close at noon the next day."}
      </p>
      <HabitList
        title="Yesterday's habits"
        showEdit={false}
        rows={day.habits}
        onOpen={(row: HabitRowView) => setOpenId(row.habit.id)}
        onQuickAction={(row) => quickAction(row, day.date)}
      />
      <HabitSheet row={open} date={day.date} run={run} onClose={() => setOpenId(null)} />
    </div>
  );
}
