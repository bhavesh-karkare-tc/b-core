import type { Insight } from "@/data";

const pct = (ratio: number) => `${Math.round(ratio * 100)}%`;

/** One-line, never-shaming copy for each insight (MASTER_DOC §10 Section C, §12 tone). */
export function insightCopy(insight: Insight): { title: string; body: string } {
  switch (insight.kind) {
    case "streak_risk":
      return {
        title: "You're at risk today",
        body: insight.habitsNeeded
          ? `Score ${insight.threshold} to stay safe: ${insight.habitsNeeded} more ${insight.habitsNeeded === 1 ? "habit" : "habits"}.`
          : `Score ${insight.threshold} to stay safe.`,
      };
    case "weakest_habit": {
      const points = insight.change === null ? null : Math.round(insight.change * 100);
      const trend =
        points === null || points === 0
          ? ""
          : `, ${points < 0 ? "down" : "up"} ${Math.abs(points)} ${Math.abs(points) === 1 ? "point" : "points"} from last week`;
      return {
        title: "Weakest habit this week",
        body: `${insight.name} is at ${pct(insight.ratio)}${trend}.`,
      };
    }
    case "day_of_week":
      return {
        title: `${insight.weekday}s are your weak spot`,
        body: `Your ${insight.weekday} average is ${insight.average}, ${insight.gap} below your other days.`,
      };
    case "minimum_overuse":
      return {
        title: "Lots of minimums",
        body: `${insight.name} was Minimum ${insight.minimum} of ${insight.of} days. Consider a reachable target next chapter.`,
      };
  }
}
