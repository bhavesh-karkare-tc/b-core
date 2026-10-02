"use client";

import { Button } from "@b-core/ui/components/button";
import { cn } from "@b-core/ui/lib/cn";
import { Minus, Plus } from "lucide-react";
import type { HabitSchedule, Weekday } from "@/data";
import { DAY_SHORT } from "./drafts";
import { Field } from "./field";
import { Segmented } from "./segmented";

type Props = {
  schedule: HabitSchedule;
  onChange: (schedule: HabitSchedule) => void;
  error?: string;
  locked?: boolean;
};

const KINDS = [
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Some days" },
  { value: "perWeek", label: "× per week" },
] as const;

const MON_FIRST: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

/** Schedule: every day, specific weekdays, or X days per week. Unscheduled days are Rest. */
export function HabitScheduleField({ schedule, onChange, error, locked }: Props) {
  return (
    <Field
      label="Schedule"
      error={error}
      locked={locked}
      hint="Days off show as Rest and still count 10 points."
    >
      <div className="flex flex-col gap-2">
        <Segmented
          label="Schedule type"
          options={KINDS}
          value={schedule.kind}
          disabled={locked}
          onChange={(kind) =>
            onChange(
              kind === "daily"
                ? { kind }
                : kind === "weekdays"
                  ? { kind, days: [1, 2, 3, 4, 5, 6] }
                  : { kind, times: 4 },
            )
          }
        />
        {schedule.kind === "weekdays" ? (
          <div className="grid grid-cols-7 gap-1" role="group" aria-label="Days">
            {MON_FIRST.map((d) => {
              const on = schedule.days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  disabled={locked}
                  onClick={() =>
                    onChange({
                      kind: "weekdays",
                      days: on ? schedule.days.filter((x) => x !== d) : [...schedule.days, d],
                    })
                  }
                  className={cn(
                    "min-h-tap rounded-control border text-xs font-semibold disabled:opacity-50",
                    on
                      ? "border-accent bg-accent-surface text-accent"
                      : "border-line-strong text-text-muted",
                  )}
                >
                  {DAY_SHORT[d]}
                </button>
              );
            })}
          </div>
        ) : null}
        {schedule.kind === "perWeek" ? (
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="icon"
              aria-label="Fewer days"
              disabled={locked || schedule.times <= 1}
              onClick={() => onChange({ kind: "perWeek", times: schedule.times - 1 })}
            >
              <Minus />
            </Button>
            <span className="font-mono text-lg" aria-live="polite">
              {schedule.times}× per week
            </span>
            <Button
              variant="secondary"
              size="icon"
              aria-label="More days"
              disabled={locked || schedule.times >= 6}
              onClick={() => onChange({ kind: "perWeek", times: schedule.times + 1 })}
            >
              <Plus />
            </Button>
          </div>
        ) : null}
      </div>
    </Field>
  );
}
