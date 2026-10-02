import type { DayView, RankName, StreakView } from "@/data";
import { countWord } from "../lib/format";
import { ScoreRing } from "./score-ring";

type ScoreCardProps = {
  day: DayView;
  threshold: number;
  streak: StreakView;
  rank: RankName;
};

function message(day: DayView, threshold: number): string {
  if (day.isSick) return "Sick day. Score not counted, streak frozen.";
  if (day.recoveryDay) return "Recovery day. Rest counts in full.";
  if (day.habitsNeeded === 0) return `Strong day at ${threshold}. You're safe today.`;
  if (day.habitsNeeded === null) return `Strong day at ${threshold}. Log what you can.`;
  const n = day.habitsNeeded;
  return `Strong day at ${threshold}. ${countWord(n)} more ${n === 1 ? "tick" : "ticks"} to stay safe.`;
}

export function ScoreCard({ day, threshold, streak, rank }: ScoreCardProps) {
  return (
    <section
      aria-label="Today's score"
      className="flex items-center gap-[18px] rounded-card-lg border border-line bg-surface p-4"
    >
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
          <span className="rounded-cell bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-soft uppercase">
            {rank}
          </span>
        </div>
      </div>
    </section>
  );
}
