"use client";

import { cn } from "@b-core/ui/lib/cn";
import type { HabitRowView } from "@/data";
import { StatusGlyph } from "./status-glyph";

type HabitRowProps = {
  row: HabitRowView;
  /** Open the detail sheet for this habit (row tap / long press). */
  onOpen?: (row: HabitRowView) => void;
  /** One-tap action (round button). */
  onQuickAction?: (row: HabitRowView) => void;
};

const ACTION_LABEL = {
  toggle: "Mark done",
  increment: "Add",
  "log-time": "Log now",
  "session-done": "Mark done",
  "open-checklist": "Open checklist",
} as const;

function quickLabel(row: HabitRowView): string {
  if (!row.quickAction) return row.statusLabel;
  if (row.quickAction === "toggle" && row.status === "done") return "Mark not done";
  if (row.quickAction === "increment" && row.habit.type === "count") {
    return `Add ${row.habit.step} ${row.habit.unit}`;
  }
  return ACTION_LABEL[row.quickAction];
}

export function HabitRow({ row, onOpen, onQuickAction }: HabitRowProps) {
  const filled = row.status === "done";
  const inactive = row.status === "rest" || row.status === "sick";

  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-row border border-line bg-surface py-2.5 pr-2.5 pl-3.5",
        inactive && "bg-surface/60",
      )}
    >
      <span className="w-[18px] shrink-0 font-mono text-xs text-text-faint" aria-hidden="true">
        {row.number}
      </span>
      <button
        type="button"
        onClick={() => onOpen?.(row)}
        onContextMenu={(e) => {
          e.preventDefault();
          onOpen?.(row);
        }}
        disabled={!onOpen || !row.quickAction}
        className="flex min-h-tap min-w-0 flex-1 flex-col justify-center gap-1 rounded-control text-left disabled:cursor-default"
        aria-label={`${row.habit.name}: ${row.statusLabel}. ${row.meta}`}
      >
        <span className="truncate text-[15px] font-semibold">{row.habit.name}</span>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className={cn("font-mono uppercase", statusTone(row))}>{row.statusLabel}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{row.meta}</span>
        </span>
        {row.progress !== null ? (
          <span className="h-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
            <span className="block h-full bg-accent" style={{ width: `${row.progress * 100}%` }} />
          </span>
        ) : null}
      </button>
      {inactive ? (
        <span className="flex h-tap w-12 items-center justify-center rounded-control border border-dashed border-line-strong font-mono text-[10px] tracking-wider text-text-faint uppercase">
          {row.status}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onQuickAction?.(row)}
          disabled={!row.quickAction || !onQuickAction}
          aria-label={`${row.habit.name}: ${quickLabel(row)}`}
          className={cn(
            "flex h-tap w-12 shrink-0 items-center justify-center rounded-control transition-colors disabled:opacity-50",
            filled
              ? "bg-accent text-on-accent hover:bg-accent-hover"
              : row.status === "missed"
                ? "border-[1.5px] border-ember-line text-ember"
                : row.status === "minimum"
                  ? "border-[1.5px] border-accent-2 text-accent"
                  : "border-[1.5px] border-line-strong text-text-muted hover:border-text-faint",
          )}
        >
          <StatusGlyph status={row.status} className="size-5" />
        </button>
      )}
    </li>
  );
}

function statusTone(row: HabitRowView): string {
  switch (row.status) {
    case "done":
    case "minimum":
      return "text-accent";
    case "missed":
      return "text-ember";
    default:
      return "text-text-faint";
  }
}
