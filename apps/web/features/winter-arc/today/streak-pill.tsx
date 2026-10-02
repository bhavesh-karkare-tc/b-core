import { cn } from "@b-core/ui/lib/cn";
import { Flame, ShieldCheck } from "lucide-react";
import type { StreakView } from "@/data";
import { STREAK_STATE_LABEL } from "../lib/format";

/** Flame + streak count + state, e.g. "9 streak · safe". State is spelled out, never colour only. */
export function StreakPill({ streak }: { streak: StreakView }) {
  const shielded = streak.state === "shielded";
  const broken = streak.state === "broken";
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2",
        shielded
          ? "border-accent-1 bg-accent-surface text-accent"
          : broken
            ? "border-line-strong bg-surface-2 text-text-muted"
            : "border-ember-line bg-ember-surface-2 text-ember-soft",
      )}
    >
      {shielded ? (
        <ShieldCheck className="size-4" aria-hidden="true" />
      ) : (
        <Flame className={cn("size-4", !broken && "text-ember")} aria-hidden="true" />
      )}
      <span className="font-mono text-sm font-semibold">{streak.current}</span>
      <span className="text-xs">streak · {STREAK_STATE_LABEL[streak.state]}</span>
    </div>
  );
}
