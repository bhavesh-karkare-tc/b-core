import type { DayView, RankName, StreakView } from "@/data";
import { countWord } from "../lib/format";
import { ScoreRing } from "./score-ring";

const fmt = new Intl.NumberFormat("en-US");

type ScoreCardProps = {
  day: DayView;
  threshold: number;
  streak: StreakView;
  rank: RankName;
  /** Web (W02): arc progress bar and rank line under the ring. */
  arc?: {
    dayNumber: number;
    durationDays: number;
    next: { name: RankName; remaining: number } | null;
  };
};

function message(day: DayView, threshold: number): string {
  if (day.isSick) return "Sick day. Score not counted, streak frozen.";
  if (day.recoveryDay) return "Recovery day. Rest counts in full.";
  if (day.habitsNeeded === 0) return `Strong day at ${threshold}. You're safe today.`;
  if (day.habitsNeeded === null) return `Strong day at ${threshold}. Log what you can.`;
  const n = day.habitsNeeded;
  return `Strong day at ${threshold}. ${countWord(n)} more ${n === 1 ? "tick" : "ticks"} to stay safe.`;
}

export function ScoreCard({ day, threshold, streak, rank, arc }: ScoreCardProps) {
  return (
    <section
      aria-label="Today's score"
      className="flex flex-col gap-4 rounded-card-lg border border-line bg-surface p-4 lg:p-5"
    >
      <div className="flex items-center gap-[18px]">
        <ScoreRing score={day.score} provisional={day.provisional} />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="text-base font-bold">
            {day.isSick ? "Sick day" : `${day.doneCount} of ${day.totalCount} done`}
          </p>
          <p className="text-[13px] text-text-muted">{message(day, threshold)}</p>
          <div className="flex flex-wrap gap-2">
            {streak.shieldsHeld > 0 ? (
              <span className="rounded-cell bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-soft">
                SHIELD ×{streak.shieldsHeld}
              </span>
            ) : null}
            {arc ? null : (
              <span className="rounded-cell bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-soft uppercase">
                {rank}
              </span>
            )}
          </div>
        </div>
      </div>
      {arc ? (
        <div className="flex flex-col gap-2">
          <div
            role="progressbar"
            aria-label="Arc progress"
            aria-valuemin={0}
            aria-valuemax={arc.durationDays}
            aria-valuenow={arc.dayNumber}
            className="h-1.5 overflow-hidden rounded-full bg-line"
          >
            <div
              className="h-full bg-accent"
              style={{ width: `${(arc.dayNumber / arc.durationDays) * 100}%` }}
            />
          </div>
          <p className="font-mono text-[11px] tracking-wider text-text-muted uppercase">
            Day {arc.dayNumber} of {arc.durationDays} · {rank}
            {arc.next ? ` (${fmt.format(arc.next.remaining)} to ${arc.next.name})` : ""}
          </p>
        </div>
      ) : null}
    </section>
  );
}
