"use client";

import { Button } from "@b-core/ui/components/button";
import { Input } from "@b-core/ui/components/input";
import { useState } from "react";
import { logHabit, setHabitValue, type ManualStatus } from "@/data";
import { StatusOption } from "./status-option";
import type { SheetBodyProps } from "./types";

const DURATIONS = [15, 30, 45, 60, 90];

/** Yes/No and Session: Done / Minimum / Missed (TC19: no Minimum for no-minimum habits). */
export function StatusSheetBody({ row, date, run, close }: SheetBodyProps) {
  const habit = row.habit;
  const hasMinimum = (habit.type === "yesno" || habit.type === "session") && habit.hasMinimum;
  const [duration, setDuration] = useState(row.durationMin?.toString() ?? "");

  async function choose(status: ManualStatus) {
    await run(() => logHabit(date, habit.id, row.status === status ? "unlogged" : status));
    close();
  }

  async function saveDuration(minutes: number | null) {
    setDuration(minutes?.toString() ?? "");
    await run(() => setHabitValue(date, habit.id, { durationMin: minutes }));
  }

  return (
    <div className="flex flex-col gap-2">
      <StatusOption
        status="done"
        label="Done"
        selected={row.status === "done"}
        onSelect={() => void choose("done")}
      />
      {hasMinimum ? (
        <StatusOption
          status="minimum"
          label="Minimum"
          hint={habit.minimumText}
          selected={row.status === "minimum"}
          onSelect={() => void choose("minimum")}
        />
      ) : null}
      <StatusOption
        status="missed"
        label="Missed"
        selected={row.status === "missed"}
        onSelect={() => void choose("missed")}
      />
      {habit.type === "session" ? (
        <div className="mt-3 flex flex-col gap-2">
          <label
            htmlFor="session-duration"
            className="font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase"
          >
            Duration (minutes)
          </label>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((m) => (
              <Button
                key={m}
                variant={row.durationMin === m ? "primary" : "secondary"}
                className="min-w-14"
                onClick={() => void saveDuration(m)}
              >
                {m}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              id="session-duration"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 60"
            />
            <Button
              variant="secondary"
              onClick={() => void saveDuration(duration ? Number(duration) : null)}
            >
              Save
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
