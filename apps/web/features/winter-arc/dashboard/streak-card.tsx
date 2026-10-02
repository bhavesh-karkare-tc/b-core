import { Flame, ShieldCheck } from "lucide-react";
import type { StreakView } from "@/data";
import { STREAK_STATE_LABEL } from "../lib/format";

export function StreakCard({ streak }: { streak: StreakView }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-ember-line bg-ember-surface p-3.5">
      <span className="flex items-center gap-1.5 text-xs text-ember-muted">
        <Flame className="size-4 text-ember" aria-hidden="true" />
        Streak · {STREAK_STATE_LABEL[streak.state]}
      </span>
      <span className="font-mono text-[26px] leading-none font-semibold text-ember-soft">
        {streak.current} {streak.current === 1 ? "day" : "days"}
      </span>
      <span className="flex items-center gap-1 text-xs text-ember-muted">
        Best {streak.best}
        {streak.shieldsHeld > 0 ? (
          <>
            {" · "}
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            {streak.shieldsHeld} {streak.shieldsHeld === 1 ? "shield" : "shields"} held
          </>
        ) : null}
      </span>
    </div>
  );
}
