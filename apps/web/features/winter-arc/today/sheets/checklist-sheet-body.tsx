"use client";

import { Button } from "@b-core/ui/components/button";
import { Input } from "@b-core/ui/components/input";
import { cn } from "@b-core/ui/lib/cn";
import { Check } from "lucide-react";
import { logHabit, setChecklistItem } from "@/data";
import type { SheetBodyProps } from "./types";

/** Checklist: tick sub-items (Done when all ticked, Minimum at the minimum count) and name them. */
export function ChecklistSheetBody({ row, date, run, close }: SheetBodyProps) {
  const habit = row.habit;
  if (habit.type !== "checklist" || !row.checklist) return null;

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {row.checklist.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <button
              type="button"
              role="checkbox"
              aria-checked={item.done}
              aria-label={`Task ${i + 1}${item.text ? `: ${item.text}` : ""}`}
              onClick={() =>
                void run(() => setChecklistItem(date, habit.id, i, { done: !item.done }))
              }
              className={cn(
                "flex size-tap shrink-0 items-center justify-center rounded-control border-[1.5px]",
                item.done
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line-strong text-transparent",
              )}
            >
              <Check className="size-5" aria-hidden="true" />
            </button>
            <label className="flex-1">
              <span className="sr-only">Task {i + 1} name</span>
              <Input
                defaultValue={item.text}
                placeholder={`Task ${i + 1}`}
                maxLength={60}
                onBlur={(e) => {
                  if (e.target.value !== item.text) {
                    void run(() => setChecklistItem(date, habit.id, i, { text: e.target.value }));
                  }
                }}
              />
            </label>
          </li>
        ))}
      </ul>
      {habit.minimum !== null ? (
        <p className="text-xs text-text-muted">
          Minimum: {habit.minimum} of {habit.items}
        </p>
      ) : null}
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
        <Button variant="secondary" onClick={close}>
          Done
        </Button>
      </div>
    </div>
  );
}
