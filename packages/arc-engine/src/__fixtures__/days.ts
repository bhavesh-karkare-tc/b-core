import { addDays } from "../dates";
import type { DayResult } from "../types";

/** Day codes: S = strong (90), W = weak (60), K = sick. */
export function dayCodes(codes: string, start = "2026-10-01"): DayResult[] {
  return [...codes].map((code, i) => {
    const score = code === "S" ? 90 : code === "W" ? 60 : null;
    return {
      date: addDays(start, i),
      entries: [],
      score,
      isSick: code === "K",
      isStrong: code === "S",
      isWeak: code === "W",
      recoveryDay: false,
      provisional: false,
    };
  });
}
