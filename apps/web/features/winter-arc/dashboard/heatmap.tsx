"use client";

import { weekday } from "@b-core/arc-engine";
import { cn } from "@b-core/ui/lib/cn";
import { useState } from "react";
import type { HeatCell } from "@/data";
import { shortDate } from "../lib/format";

type Props = {
  cells: HeatCell[];
  /** "calendar": 7 columns Mon–Sun (one chapter); "weeks": 7 rows, a column per week (whole arc). */
  layout: "calendar" | "weeks";
  onOpenDay?: (date: string) => void;
};

const LEVEL_CLASS: Record<HeatCell["level"], string> = {
  0: "bg-heat-0",
  1: "bg-heat-1",
  2: "bg-heat-2",
  3: "bg-heat-3 text-on-accent",
  4: "bg-heat-4 text-on-accent",
  sick: "bg-surface-2 text-text-muted",
  future: "border border-dashed border-line-strong",
};

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function describe(c: HeatCell): string {
  const when = `${shortDate(c.date)} · Day ${c.dayNumber}`;
  if (c.level === "future") return `${when} · upcoming`;
  if (c.level === "sick") return `${when} · sick day`;
  return `${when} · score ${c.score ?? 0}${c.isToday ? " so far" : ""}`;
}

/**
 * Score heatmap (TC42): one hue, light → dark by level; sick shown as "S", upcoming dashed.
 * Each cell is a focusable target with a readout line (hover/focus), opening Day Detail.
 */
export function Heatmap({ cells, layout, onOpenDay }: Props) {
  const [active, setActive] = useState<HeatCell | null>(null);
  const first = cells[0];
  // Pad to Monday so columns (calendar) or rows (weeks) line up with weekdays.
  const pad = first ? (weekday(first.date) + 6) % 7 : 0;
  const slots: (HeatCell | null)[] = [...Array.from({ length: pad }, () => null), ...cells];

  return (
    <div className="flex flex-col gap-2">
      <div className={cn(layout === "weeks" && "overflow-x-auto pb-1")}>
        <div
          className={cn("grid gap-1", layout === "weeks" && "w-max grid-flow-col")}
          style={
            layout === "calendar"
              ? { gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }
              : // Whole arc: fixed cells, scrolls sideways on narrow screens.
                { gridTemplateRows: "repeat(7, 1.375rem)", gridAutoColumns: "1.375rem" }
          }
        >
          {layout === "calendar"
            ? DAYS.map((d, i) => (
                <span
                  key={i}
                  className="text-center font-mono text-[10px] text-text-faint"
                  aria-hidden="true"
                >
                  {d}
                </span>
              ))
            : null}
          {slots.map((c, i) =>
            c ? (
              <button
                key={c.date}
                type="button"
                disabled={c.level === "future" || !onOpenDay}
                onClick={() => onOpenDay?.(c.date)}
                onPointerEnter={() => setActive(c)}
                onFocus={() => setActive(c)}
                onPointerLeave={() => setActive(null)}
                onBlur={() => setActive(null)}
                aria-label={describe(c)}
                aria-current={c.isToday ? "date" : undefined}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-cell font-mono text-[10px] transition-[filter] hover:brightness-125 disabled:cursor-default disabled:hover:brightness-100",
                  LEVEL_CLASS[c.level],
                  c.isToday && "ring-2 ring-text ring-offset-1 ring-offset-surface",
                )}
              >
                {c.level === "sick" ? "S" : layout === "calendar" ? Number(c.date.slice(8)) : ""}
              </button>
            ) : (
              <span key={`pad-${i}`} aria-hidden="true" />
            ),
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-text-muted">
        <p aria-live="polite" className="min-h-4 font-mono">
          {active ? describe(active) : "Tap a day for details"}
        </p>
        <span className="flex items-center gap-1" aria-label="Score levels from under 40 to 100">
          Less
          {([0, 1, 2, 3, 4] as const).map((l) => (
            <span
              key={l}
              className={cn("size-3 rounded-[3px]", LEVEL_CLASS[l])}
              aria-hidden="true"
            />
          ))}
          More · S sick · dashed upcoming
        </span>
      </div>
    </div>
  );
}
