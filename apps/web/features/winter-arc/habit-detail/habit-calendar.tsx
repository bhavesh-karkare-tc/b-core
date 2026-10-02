import { weekday } from "@b-core/arc-engine";
import { cn } from "@b-core/ui/lib/cn";
import type { HabitDetailView } from "@/data";
import { shortDate } from "../lib/format";
import { CELL_GLYPH, TrackerCell } from "../tracker/tracker-cell";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];

/** Month mini-calendar for one habit: Done, Minimum, Missed, Rest, Sick (glyph + colour). */
export function HabitCalendar({ cells }: { cells: HabitDetailView["calendar"] }) {
  const first = cells[0];
  const pad = first ? (weekday(first.date) + 6) % 7 : 0;
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {DAYS.map((d, i) => (
        <span
          key={i}
          className="text-center font-mono text-[10px] text-text-faint"
          aria-hidden="true"
        >
          {d}
        </span>
      ))}
      {Array.from({ length: pad }, (_, i) => (
        <span key={`pad-${i}`} aria-hidden="true" />
      ))}
      {cells.map((c) => (
        <div
          key={c.date}
          role="img"
          aria-label={`${shortDate(c.date)}: ${CELL_GLYPH[c.state].label}`}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-cell p-0.5",
            c.isToday && "ring-1 ring-accent-2",
          )}
        >
          <span className="font-mono text-[10px] text-text-faint" aria-hidden="true">
            {Number(c.date.slice(8))}
          </span>
          <TrackerCell state={c.state} className="h-6 w-full" />
        </div>
      ))}
    </div>
  );
}
