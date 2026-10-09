"use client";

import { cn } from "@b-core/ui/lib/cn";
import type { TrackerColumn, TrackerRow } from "@/data";
import { CELL_GLYPH, TrackerCell } from "./tracker-cell";

type Props = {
  columns: TrackerColumn[];
  rows: TrackerRow[];
  threshold: number;
  /** Open Day Detail for a reached day. */
  onOpenDay?: (date: string) => void;
};

function rowLabel(row: TrackerRow, columns: TrackerColumn[]): string {
  const day = `${row.weekday} ${row.dayOfMonth}, day ${row.dayNumber}`;
  if (row.future) return `${day}: not reached yet`;
  const score = row.isSick ? "sick day" : `score ${row.score ?? 0}`;
  const cells = row.cells
    .map((c, i) => `${columns[i]?.name ?? ""} ${CELL_GLYPH[c.state].label}`)
    .join(", ");
  return `${day}, ${score}. ${cells}`;
}

/**
 * Month grid (MASTER_DOC §13 #12): one row per day, one cell per habit, points.
 * Rows are 28 px (≥ 24 px WCAG AA target, decision T9); Week view gives 44 px targets.
 * Mobile only; web uses MonthTable (W03).
 */
export function MonthGrid({ columns, rows, threshold, onOpenDay }: Props) {
  const template = `3.25rem repeat(${columns.length}, minmax(0, 1fr)) 2.25rem`;

  return (
    <div className="flex flex-col gap-[3px] rounded-card border border-line bg-surface p-2.5">
      <div
        className="grid items-end gap-[3px] pb-1 font-mono text-[10px] text-text-faint"
        style={{ gridTemplateColumns: template }}
        aria-hidden="true"
      >
        <span>DAY</span>
        {columns.map((c) => (
          <span key={c.habitId} className="truncate text-center" title={c.name}>
            {c.number}
          </span>
        ))}
        <span className="text-right">PTS</span>
      </div>
      <ol className="flex flex-col gap-[3px]">
        {rows.map((row) => {
          const reached = !row.future;
          return (
            <li key={row.date}>
              <button
                type="button"
                disabled={!reached || !onOpenDay}
                onClick={() => onOpenDay?.(row.date)}
                aria-label={rowLabel(row, columns)}
                aria-current={row.isToday ? "date" : undefined}
                className={cn(
                  "grid min-h-7 w-full items-center gap-[3px] rounded-cell px-0.5 text-left transition-colors",
                  row.isToday ? "bg-surface-2 ring-1 ring-accent-2" : "hover:bg-surface-2/60",
                  "disabled:cursor-default disabled:hover:bg-transparent",
                )}
                style={{ gridTemplateColumns: template }}
              >
                <span
                  className={cn(
                    "font-mono text-[11px]",
                    row.isToday
                      ? "text-accent"
                      : row.future
                        ? "text-text-faint"
                        : "text-text-muted",
                  )}
                >
                  {row.weekday} {row.dayOfMonth}
                </span>
                {row.cells.map((c) => (
                  <TrackerCell key={c.habitId} state={c.state} provisional={c.provisional} />
                ))}
                <span
                  className={cn(
                    "text-right font-mono text-[11px]",
                    row.score === null
                      ? "text-text-faint"
                      : row.score >= threshold
                        ? row.final
                          ? "text-text"
                          : "text-text-soft"
                        : "text-ember",
                  )}
                >
                  {row.future ? "" : row.isSick ? "S" : (row.score ?? "–")}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
