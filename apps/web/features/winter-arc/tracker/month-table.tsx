"use client";

import { cn } from "@b-core/ui/lib/cn";
import type { TrackerColumn, TrackerRow } from "@/data";
import { CELL_GLYPH, TrackerCell } from "./tracker-cell";

type Props = {
  columns: TrackerColumn[];
  rows: TrackerRow[];
  threshold: number;
  /** Open Day Detail for a reached day (click on the date). */
  onOpenDay?: (date: string) => void;
};

const WEEKDAY: Record<string, string> = {
  Mo: "Mon",
  Tu: "Tue",
  We: "Wed",
  Th: "Thu",
  Fr: "Fri",
  Sa: "Sat",
  Su: "Sun",
};

/**
 * Web month tracker (W03): a digital twin of the printed sheet. 10 habit columns, score and
 * journal; a heavier rule after each Sunday closes the week.
 */
export function MonthTable({ columns, rows, threshold, onOpenDay }: Props) {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-[76px]" />
          {columns.map((c) => (
            <col key={c.habitId} />
          ))}
          <col className="w-[76px]" />
          <col className="w-[22%]" />
        </colgroup>
        <thead className="bg-surface-2 text-[12px] text-text-muted">
          <tr>
            <th scope="col" className="px-3 py-3 font-semibold">
              Date
            </th>
            {columns.map((c) => (
              <th
                key={c.habitId}
                scope="col"
                title={c.name}
                className="px-1 py-3 text-center font-semibold"
              >
                <span className="line-clamp-2 leading-tight">{c.name}</span>
              </th>
            ))}
            <th scope="col" className="px-2 py-3 text-center font-semibold">
              Score
            </th>
            <th scope="col" className="px-3 py-3 font-semibold">
              Journal
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const weekEnd = row.weekday === "Su";
            const label = `${String(row.dayOfMonth).padStart(2, "0")} ${WEEKDAY[row.weekday] ?? row.weekday}`;
            return (
              <tr
                key={row.date}
                aria-current={row.isToday ? "date" : undefined}
                className={cn(
                  "border-t border-line",
                  weekEnd && "border-b-2 border-b-line-strong",
                  row.isToday && "bg-surface-2 outline-1 -outline-offset-1 outline-accent-2",
                )}
              >
                <th scope="row" className="p-0 font-normal">
                  {row.future || !onOpenDay ? (
                    <span className="flex h-8 items-center px-3 font-mono text-[12px] text-text-faint">
                      {label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenDay(row.date)}
                      aria-label={`${label}, day ${row.dayNumber}: open day detail`}
                      className={cn(
                        "flex h-8 w-full items-center px-3 font-mono text-[12px] hover:text-accent",
                        row.isToday ? "text-accent" : "text-text-muted",
                      )}
                    >
                      {label}
                    </button>
                  )}
                </th>
                {row.cells.map((c, i) => (
                  <td key={c.habitId} className="px-1 text-center">
                    <TrackerCell
                      state={c.state}
                      provisional={c.provisional}
                      className="mx-auto size-[22px] rounded-[5px] text-[11px]"
                    />
                    <span className="sr-only">
                      {columns[i]?.name}: {CELL_GLYPH[c.state].label}
                    </span>
                  </td>
                ))}
                <td
                  className={cn(
                    "px-2 text-center font-mono text-[12px]",
                    row.score === null
                      ? "text-text-faint"
                      : row.score >= threshold
                        ? row.final
                          ? "text-text"
                          : "text-text-soft"
                        : "text-ember",
                  )}
                >
                  {row.future
                    ? ""
                    : row.isSick
                      ? "—"
                      : row.score === null
                        ? "–"
                        : `${row.score}/100`}
                </td>
                <td
                  className="truncate px-3 text-[12px] text-text-muted"
                  title={row.journal ?? undefined}
                >
                  {row.journal ?? ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
