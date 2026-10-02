/** Display formatting for Winter Arc screens. Pure, no clock reads. */

function utc(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

/** "2026-10-23" → "FRI 23 OCT". */
export function dayLabel(date: string): string {
  const d = utc(date);
  const weekday = d.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" });
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${weekday} ${d.getUTCDate()} ${month}`.toUpperCase();
}

/** "2026-11-01" → "Sun 1 Nov". */
export function shortDate(date: string): string {
  const d = utc(date);
  const weekday = d.toLocaleString("en-US", { weekday: "short", timeZone: "UTC" });
  const month = d.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  return `${weekday} ${d.getUTCDate()} ${month}`;
}

const WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
];

/** 5 → "Five" (falls back to digits above ten). */
export function countWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/** Remaining time in hours/minutes, e.g. "3h left", "45m left". */
export function timeLeft(ms: number): string {
  const minutes = Math.max(0, Math.round(ms / 60_000));
  if (minutes >= 60) return `${Math.floor(minutes / 60)}h left`;
  return `${minutes}m left`;
}

export const STREAK_STATE_LABEL = {
  safe: "safe",
  at_risk: "at risk",
  shielded: "shielded",
  broken: "broken",
} as const;
