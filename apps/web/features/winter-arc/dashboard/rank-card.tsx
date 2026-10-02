import { Progress } from "@b-core/ui/components/progress";
import { rankThresholds } from "@b-core/arc-engine";
import type { DashboardView } from "@/data";

type Rank = Extract<DashboardView, { kind: "dashboard" }>["rank"];

const fmt = new Intl.NumberFormat("en-US");

/** Rank with a meter from the current rank's threshold to the next ("660 pts to Contender"). */
export function RankCard({ rank, durationDays }: { rank: Rank; durationDays: number }) {
  const thresholds = rankThresholds(durationDays);
  const from = thresholds.find((t) => t.name === rank.name)?.points ?? 0;
  const to = rank.next ? rank.points + rank.next.remaining : null;
  const progress = to === null ? 100 : ((rank.points - from) / (to - from)) * 100;
  return (
    <div className="flex flex-col gap-1.5 rounded-card border border-line bg-surface p-3.5">
      <span className="text-xs text-text-muted">Rank · {fmt.format(rank.points)} pts</span>
      <span className="font-mono text-[22px] leading-none font-semibold uppercase">
        {rank.name}
      </span>
      <Progress value={progress} aria-label={`Progress to ${rank.next?.name ?? "top rank"}`} />
      <span className="text-xs text-text-muted">
        {rank.next
          ? `${fmt.format(rank.next.remaining)} pts to ${rank.next.name}`
          : "Top rank reached"}
      </span>
    </div>
  );
}
