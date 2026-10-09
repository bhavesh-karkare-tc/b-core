import { cn } from "@b-core/ui/lib/cn";
import type { TrackerCellState } from "@/data";
import { CELL_GLYPH, TrackerCell } from "./tracker-cell";

const SHOWN: TrackerCellState[] = ["done", "minimum", "missed", "rest", "sick", "future"];

export function TrackerLegend({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-3.5 gap-y-1.5 font-mono text-[11px] text-text-muted uppercase",
        className,
      )}
      aria-label="Legend"
    >
      {SHOWN.map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <TrackerCell state={s} className="w-4" />
          {CELL_GLYPH[s].label}
        </li>
      ))}
    </ul>
  );
}
