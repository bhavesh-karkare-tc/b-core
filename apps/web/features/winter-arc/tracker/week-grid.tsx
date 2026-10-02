"use client";

import { Button } from "@b-core/ui/components/button";
import { cn } from "@b-core/ui/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TrackerColumn } from "@/data";
import { shortDate } from "../lib/format";
import { CELL_GLYPH, TrackerCell } from "./tracker-cell";
import type { TrackerWeek } from "./weeks";

type Props = {
  columns: TrackerColumn[];
  week: TrackerWeek;
  index: number;
  count: number;
  threshold: number;
  onWeek: (index: number) => void;
  onOpenDay?: (date: string) => void;
};

/** Week view: habits as rows with full names, one tall button per day (opens Day Detail). */
export function WeekGrid({ columns, week, index, count, threshold, onWeek, onOpenDay }: Props) {
  const first = week.rows[0];
  const last = week.rows.at(-1);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous week"
          disabled={index === 0}
          onClick={() => onWeek(index - 1)}
        >
          <ChevronLeft />
        </Button>
        <p className="font-mono text-sm" aria-live="polite">
          {first ? shortDate(first.date) : ""} – {last ? shortDate(last.date) : ""}
        </p>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next week"
          disabled={index >= count - 1}
          onClick={() => onWeek(index + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="flex gap-1 rounded-card border border-line bg-surface p-2.5">
        <ul className="flex w-24 shrink-0 flex-col pt-14 sm:w-36" aria-hidden="true">
          {columns.map((c) => (
            <li
              key={c.habitId}
              className="flex h-9 items-center pr-1 text-[11px] leading-tight text-text-soft"
              title={c.name}
            >
              <span className="line-clamp-2">{c.name}</span>
            </li>
          ))}
          <li className="flex h-9 items-center font-mono text-[10px] text-text-faint">PTS</li>
        </ul>
        <ol
          className="grid flex-1 gap-1"
          style={{ gridTemplateColumns: `repeat(${week.rows.length}, minmax(0, 1fr))` }}
        >
          {week.rows.map((row) => (
            <li key={row.date}>
              <button
                type="button"
                disabled={row.future || !onOpenDay}
                onClick={() => onOpenDay?.(row.date)}
                aria-current={row.isToday ? "date" : undefined}
                aria-label={`${row.weekday} ${row.dayOfMonth}${row.future ? ": not reached yet" : `, ${row.isSick ? "sick day" : `score ${row.score ?? 0}`}. ${row.cells.map((c, i) => `${columns[i]?.name ?? ""} ${CELL_GLYPH[c.state].label}`).join(", ")}`}`}
                className={cn(
                  "flex w-full flex-col items-stretch rounded-control transition-colors disabled:cursor-default",
                  row.isToday
                    ? "bg-surface-2 ring-1 ring-accent-2"
                    : "hover:bg-surface-2/60 disabled:hover:bg-transparent",
                )}
              >
                <span className="flex h-14 flex-col items-center justify-center font-mono">
                  <span
                    className={cn("text-[10px]", row.isToday ? "text-accent" : "text-text-faint")}
                  >
                    {row.weekday}
                  </span>
                  <span className={cn("text-sm", row.future ? "text-text-faint" : "text-text")}>
                    {row.dayOfMonth}
                  </span>
                </span>
                {row.cells.map((c) => (
                  <span key={c.habitId} className="flex h-9 items-center justify-center">
                    <TrackerCell
                      state={c.state}
                      provisional={c.provisional}
                      className="h-7 w-full max-w-9"
                    />
                  </span>
                ))}
                <span
                  className={cn(
                    "flex h-9 items-center justify-center font-mono text-xs",
                    row.score === null
                      ? "text-text-faint"
                      : row.score >= threshold
                        ? "text-text"
                        : "text-ember",
                  )}
                >
                  {row.future ? "" : row.isSick ? "S" : (row.score ?? "–")}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
