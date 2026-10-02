import type { HabitDetailView } from "@/data";
import { shortDate } from "../lib/format";

/** Completion % per week: one-hue thin bars, value at the tip. */
export function WeekCompletion({ weeks }: { weeks: HabitDetailView["weeks"] }) {
  return (
    <ol className="flex flex-col gap-2">
      {weeks.map((w) => {
        const pct = w.completion === null ? null : Math.round(w.completion * 100);
        return (
          <li
            key={w.weekStart}
            className="grid grid-cols-[5.5rem_1fr_2.75rem] items-center gap-2 text-sm"
          >
            <span className="font-mono text-xs text-text-muted">
              {shortDate(w.weekStart).slice(4)}
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span
                className="block h-full rounded-r-[4px] bg-accent"
                style={{ width: `${pct ?? 0}%` }}
              />
            </span>
            <span className="text-right font-mono text-text-soft">
              {pct === null ? "—" : `${pct}%`}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
