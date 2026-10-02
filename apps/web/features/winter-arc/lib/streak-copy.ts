import type { StreakEffect } from "@/data";

/** Close-the-day streak line. Short, direct, never shaming (MASTER_DOC §12 tone). */
export function streakEffectCopy(effect: StreakEffect, current: number): string {
  const days = `${current} ${current === 1 ? "day" : "days"}`;
  switch (effect) {
    case "grows":
      return `Streak safe, ${days}.`;
    case "holds":
      return `Streak holds at ${current}.`;
    case "at_risk":
      return "One weak day. Don't miss two.";
    case "shielded":
      return `Shield used. Streak holds at ${current}.`;
    case "broken":
      return "Streak resets. Restart strong tomorrow.";
    case "frozen":
      return `Sick day. Streak frozen at ${current}.`;
  }
}
