"use client";

import { useCallback } from "react";
import { logHabit, logTimeNow, setHabitValue, type HabitRowView } from "@/data";

/** One-tap row actions (MASTER_DOC §7 habit row interactions). */
export function useQuickAction(
  run: (mutation: () => Promise<unknown>) => Promise<void>,
  openSheet: (row: HabitRowView, date: string) => void,
) {
  return useCallback(
    (row: HabitRowView, date: string) => {
      const id = row.habit.id;
      switch (row.quickAction) {
        case "toggle":
        case "session-done":
          return run(() => logHabit(date, id, row.status === "done" ? "unlogged" : "done"));
        case "increment": {
          const step = row.habit.type === "count" ? row.habit.step : 1;
          return run(() => setHabitValue(date, id, { value: (row.value ?? 0) + step }));
        }
        case "log-time":
          return run(() => logTimeNow(date, id));
        case "open-checklist":
          return openSheet(row, date);
        case null:
          return;
      }
    },
    [run, openSheet],
  );
}
