import { cn } from "@b-core/ui/lib/cn";
import type { TrackerCellState } from "@/data";

/** Glyph + label per state: status is never shown by colour alone. */
export const CELL_GLYPH: Record<TrackerCellState, { glyph: string; label: string }> = {
  done: { glyph: "✓", label: "Done" },
  minimum: { glyph: "½", label: "Minimum" },
  missed: { glyph: "×", label: "Missed" },
  rest: { glyph: "R", label: "Rest" },
  sick: { glyph: "S", label: "Sick" },
  unlogged: { glyph: "", label: "Not logged" },
  future: { glyph: "", label: "Not reached" },
  none: { glyph: "–", label: "Not in arc" },
};

const STYLE: Record<TrackerCellState, string> = {
  done: "bg-accent text-on-accent",
  minimum: "bg-accent-2 text-accent-hover",
  missed: "border border-ember text-ember",
  rest: "bg-surface-2 text-text-muted",
  sick: "bg-surface-2 text-text-muted",
  unlogged: "border border-line-strong",
  future: "border border-dashed border-line-strong",
  none: "text-text-faint",
};

type TrackerCellProps = {
  state: TrackerCellState;
  provisional?: boolean;
  size?: "sm" | "lg";
  className?: string;
};

/** One habit on one day. Decorative inside a labelled row; the row carries the text. */
export function TrackerCell({ state, provisional, size = "sm", className }: TrackerCellProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-[4px] font-mono leading-none",
        size === "sm" ? "h-5 text-[10px]" : "size-9 rounded-cell text-sm",
        STYLE[state],
        provisional && (state === "minimum" || state === "rest") && "opacity-70",
        className,
      )}
    >
      {CELL_GLYPH[state].glyph}
    </span>
  );
}
