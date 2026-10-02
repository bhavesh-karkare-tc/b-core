import { ARC_DEFAULT_DAYS, RANKS } from "./constants";
import type { RankName } from "./types";

export type RankThreshold = { name: RankName; points: number };

/** Rank thresholds scaled linearly to the arc length, rounded to the nearest 10 (A5). */
export function rankThresholds(durationDays: number = ARC_DEFAULT_DAYS): RankThreshold[] {
  return RANKS.map((r) => ({
    name: r.name,
    points: Math.round((r.points * durationDays) / ARC_DEFAULT_DAYS / 10) * 10,
  }));
}

/** Highest rank whose threshold is reached. */
export function rankFor(points: number, durationDays: number = ARC_DEFAULT_DAYS): RankName {
  let rank: RankName = "Recruit";
  for (const t of rankThresholds(durationDays)) {
    if (points >= t.points) rank = t.name;
  }
  return rank;
}

/** Next rank and points still needed ("420 points to Contender"); null at Legend. */
export function nextRank(
  points: number,
  durationDays: number = ARC_DEFAULT_DAYS,
): { name: RankName; points: number; remaining: number } | null {
  const next = rankThresholds(durationDays).find((t) => t.points > points);
  return next ? { ...next, remaining: next.points - points } : null;
}

/** Rank never goes down: keep the higher of the stored and computed rank. */
export function maxRank(a: RankName, b: RankName): RankName {
  const order = RANKS.map((r) => r.name);
  return order.indexOf(a) >= order.indexOf(b) ? a : b;
}
