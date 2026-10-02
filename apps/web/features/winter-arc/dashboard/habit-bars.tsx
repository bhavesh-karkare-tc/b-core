"use client";

import { cn } from "@b-core/ui/lib/cn";
import type { HabitStatsView } from "@/data";

type Props = {
  habits: HabitStatsView[];
  /** Show only the first N (mobile); null = all. */
  limit?: number | null;
  onOpenHabit?: (habitId: string) => void;
};

const pct = (r: number | null) => (r === null ? "—" : `${Math.round(r * 100)}%`);

/** Habit completion, weakest first: one-hue thin bars, value at the tip in text colour. */
export function HabitBars({ habits, limit = null, onOpenHabit }: Props) {
  const shown = limit ? habits.slice(0, limit) : habits;
  return (
    <ol className="flex flex-col gap-1">
      {shown.map((h) => (
        <li key={h.habitId}>
          <button
            type="button"
            disabled={!onOpenHabit}
            onClick={() => onOpenHabit?.(h.habitId)}
            aria-label={`${h.name}: ${pct(h.completion)} complete, streak ${h.currentStreak}, best ${h.bestStreak}`}
            className={cn(
              "flex min-h-tap w-full flex-col justify-center gap-1.5 rounded-control px-2 text-left transition-colors",
              "hover:bg-surface-2 disabled:cursor-default disabled:hover:bg-transparent",
            )}
          >
            <span className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate">{h.name}</span>
              <span className="font-mono text-text-soft">{pct(h.completion)}</span>
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span
                className="block h-full rounded-r-[4px] bg-accent"
                style={{ width: `${(h.completion ?? 0) * 100}%` }}
              />
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
