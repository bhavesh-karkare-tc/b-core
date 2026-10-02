"use client";

import { Button } from "@b-core/ui/components/button";
import { Input } from "@b-core/ui/components/input";
import { useState } from "react";
import { formatClock, logHabit, logTimeNow, setHabitValue } from "@/data";
import type { SheetBodyProps } from "./types";

/** Time habit: log now, pick a time, or mark Missed. Done at/before target (night clock). */
export function TimeSheetBody({ row, date, run, close }: SheetBodyProps) {
  const habit = row.habit;
  const [time, setTime] = useState(row.loggedTime ?? "");
  if (habit.type !== "time") return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-text-muted">
        Done by {formatClock(habit.target)}
        {habit.minimum ? `, minimum by ${formatClock(habit.minimum)}` : ""}.
      </p>
      <Button
        block
        size="lg"
        onClick={() => void run(() => logTimeNow(date, habit.id)).then(close)}
      >
        Log now
      </Button>
      <div className="flex gap-2">
        <label className="flex-1">
          <span className="sr-only">Logged time</span>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <Button
          variant="secondary"
          disabled={!time}
          onClick={() =>
            void run(() => setHabitValue(date, habit.id, { loggedTime: time })).then(close)
          }
        >
          Save
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="ember"
          onClick={() =>
            void run(() =>
              logHabit(date, habit.id, row.status === "missed" ? "unlogged" : "missed"),
            ).then(close)
          }
        >
          {row.status === "missed" ? "Undo missed" : "Mark missed"}
        </Button>
        <Button
          variant="ghost"
          disabled={!row.loggedTime}
          onClick={() =>
            void run(() => setHabitValue(date, habit.id, { loggedTime: null })).then(close)
          }
        >
          Clear
        </Button>
      </div>
    </div>
  );
}
