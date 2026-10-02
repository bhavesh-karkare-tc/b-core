"use client";

import { Button } from "@b-core/ui/components/button";
import { Input } from "@b-core/ui/components/input";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { logHabit, setHabitValue } from "@/data";
import type { SheetBodyProps } from "./types";

const fmt = new Intl.NumberFormat("en-US");

/** Count habit keypad: ± step, type a value, jump to minimum/target, or mark Missed. */
export function CountSheetBody({ row, date, run, close }: SheetBodyProps) {
  const habit = row.habit;
  const [value, setValue] = useState(row.value ?? 0);
  if (habit.type !== "count") return null;

  async function save(next: number) {
    await run(() => setHabitValue(date, habit.id, { value: next }));
    close();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="secondary"
          size="icon"
          aria-label={`Minus ${habit.step} ${habit.unit}`}
          onClick={() => setValue((v) => Math.max(0, v - habit.step))}
        >
          <Minus />
        </Button>
        <label className="flex flex-1 flex-col items-center gap-1">
          <span className="sr-only">Value in {habit.unit}</span>
          <Input
            inputMode="numeric"
            value={String(value)}
            onChange={(e) => setValue(Number(e.target.value.replace(/\D/g, "") || 0))}
            className="h-14 text-center font-mono text-3xl font-semibold"
          />
          <span className="font-mono text-xs text-text-muted">
            of {fmt.format(habit.target)} {habit.unit}
          </span>
        </label>
        <Button
          variant="secondary"
          size="icon"
          aria-label={`Plus ${habit.step} ${habit.unit}`}
          onClick={() => setValue((v) => v + habit.step)}
        >
          <Plus />
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {habit.minimum !== null ? (
          <Button variant="secondary" onClick={() => setValue(habit.minimum ?? 0)}>
            Minimum · {fmt.format(habit.minimum)}
          </Button>
        ) : null}
        <Button
          variant="secondary"
          onClick={() => setValue(habit.target)}
          className={habit.minimum === null ? "col-span-2" : ""}
        >
          Target · {fmt.format(habit.target)}
        </Button>
      </div>
      <Button block size="lg" onClick={() => void save(value)}>
        Save {fmt.format(value)} {habit.unit}
      </Button>
      <Button
        variant="ember"
        block
        onClick={() =>
          void run(() =>
            logHabit(date, habit.id, row.status === "missed" ? "unlogged" : "missed"),
          ).then(close)
        }
      >
        {row.status === "missed" ? "Undo missed" : "Mark missed"}
      </Button>
    </div>
  );
}
