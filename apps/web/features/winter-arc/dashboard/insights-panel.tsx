import { Progress } from "@b-core/ui/components/progress";
import { Lightbulb, Lock } from "lucide-react";
import type { DashboardView } from "@/data";
import { insightCopy } from "../lib/insight-copy";

type View = Extract<DashboardView, { kind: "dashboard" }>;

/** "What to fix" (Section C). Locked Days 1–6 with a progress bar (TC43). */
export function InsightsPanel({ view, limit }: { view: View; limit?: number }) {
  const { insights, dayNumber } = view;
  if (!insights.unlocked) {
    return (
      <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Lock className="size-4 text-text-muted" aria-hidden="true" />
          Insights unlock after {insights.unlockDay} days
        </p>
        <Progress
          value={(dayNumber / insights.unlockDay) * 100}
          aria-label="Days until insights unlock"
        />
        <p className="text-xs text-text-muted">
          Day {dayNumber} of {insights.unlockDay}. Keep logging; patterns need a week of data.
        </p>
      </div>
    );
  }
  const items = limit ? insights.items.slice(0, limit) : insights.items;
  if (items.length === 0) {
    return (
      <p className="rounded-card border border-line bg-surface p-4 text-sm text-text-muted">
        Nothing to fix this week. Keep it going.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {items.map((insight, i) => {
        const copy = insightCopy(insight);
        return (
          <li
            key={i}
            className="flex gap-3 rounded-card border border-accent-1 bg-accent-surface p-3.5"
          >
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold">{copy.title}</p>
              <p className="text-[13px] leading-snug text-text-soft">{copy.body}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
