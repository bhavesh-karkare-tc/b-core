import type { StreakView } from "@/data";
import { dayLabel } from "../lib/format";
import { StreakPill } from "./streak-pill";

type TodayHeaderProps = {
  date: string;
  dayNumber: number;
  durationDays: number;
  /** Omitted on web, where the streak sits in the score card. */
  streak?: StreakView;
};

export function TodayHeader({ date, dayNumber, durationDays, streak }: TodayHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.16em] text-accent">
          WINTER ARC · {dayLabel(date)}
        </p>
        <h1 className="flex items-baseline gap-2">
          <span className="text-[40px] leading-none font-extrabold tracking-tight">
            Day {dayNumber}
          </span>
          <span className="font-mono text-base text-text-muted">/ {durationDays}</span>
        </h1>
      </div>
      {streak ? <StreakPill streak={streak} /> : null}
    </header>
  );
}
