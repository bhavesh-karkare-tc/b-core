/**
 * Demo scenarios for the mock layer. Each one seeds an arc history and pins the demo clock,
 * so every Today state can be seen without waiting real days.
 *
 * Day codes (one per day from the arc start): S strong (90), P perfect (100), W weak (60),
 * K sick, Y yesterday-partial (8 of 10 done, still open), E empty.
 */
export type ScenarioId =
  | "day23"
  | "at-risk"
  | "shielded"
  | "broken"
  | "yesterday-unlogged"
  | "sick-today"
  | "sunday"
  | "all-done"
  | "countdown"
  | "day-1"
  | "no-arc"
  | "returning";

export type TodayPreset = "mockup" | "all-done" | "sunday" | "empty";

export type Scenario = {
  id: ScenarioId;
  /** "active" seeds the arc below; "none" seeds nothing; "returning" seeds only a completed past arc. */
  arc?: "active" | "none" | "returning";
  label: string;
  description: string;
  startDate: string;
  /** Codes for the days before today. */
  history: string;
  today: TodayPreset;
  todaySick?: boolean;
  /** Pinned demo clock in the arc timezone. */
  nowDate: string;
  nowTime: string;
};

/** Days 1–13: strong run, a recovered weak day, a sick day, then a break. */
const BASE = "SSSSSSWSKSWWW";

export const SCENARIOS: readonly Scenario[] = [
  {
    id: "day23",
    label: "Day 23 · streak 9",
    description: "Default. Mid-chapter, 9-day streak, 1 shield, Fighter. Today partly logged.",
    startDate: "2026-10-01",
    history: `${BASE}${"S".repeat(9)}`,
    today: "mockup",
    nowDate: "2026-10-23",
    nowTime: "15:00",
  },
  {
    id: "at-risk",
    label: "At risk",
    description: "Yesterday was weak. Don't miss two.",
    startDate: "2026-10-01",
    history: `${BASE}${"S".repeat(8)}W`,
    today: "mockup",
    nowDate: "2026-10-23",
    nowTime: "15:00",
  },
  {
    id: "shielded",
    label: "Shielded",
    description: "Two weak days in a row; a shield saved the streak.",
    startDate: "2026-10-01",
    history: `${BASE}${"S".repeat(7)}WW`,
    today: "mockup",
    nowDate: "2026-10-23",
    nowTime: "15:00",
  },
  {
    id: "broken",
    label: "Streak broken",
    description: "Two weak days with no shield. Restart strong today.",
    startDate: "2026-10-01",
    history: `${BASE}${"S".repeat(6)}WWW`,
    today: "empty",
    nowDate: "2026-10-23",
    nowTime: "15:00",
  },
  {
    id: "yesterday-unlogged",
    label: "Yesterday open",
    description: "09:00 — yesterday has 2 unlogged habits and 3h left.",
    startDate: "2026-10-01",
    history: `${BASE}${"S".repeat(8)}Y`,
    today: "empty",
    nowDate: "2026-10-23",
    nowTime: "09:00",
  },
  {
    id: "sick-today",
    label: "Sick day",
    description: "Today is a sick day: score not counted, streak frozen.",
    startDate: "2026-10-01",
    history: `${BASE}${"S".repeat(9)}`,
    today: "empty",
    todaySick: true,
    nowDate: "2026-10-23",
    nowTime: "15:00",
  },
  {
    id: "sunday",
    label: "Sunday rest",
    description: "Day 18, Sunday: MMA Training is Rest.",
    startDate: "2026-10-01",
    history: `${BASE}SSSS`,
    today: "sunday",
    nowDate: "2026-10-18",
    nowTime: "15:00",
  },
  {
    id: "all-done",
    label: "All done",
    description: "Every habit done today.",
    startDate: "2026-10-01",
    history: `${BASE}${"S".repeat(9)}`,
    today: "all-done",
    nowDate: "2026-10-23",
    nowTime: "20:00",
  },
  {
    id: "countdown",
    label: "Before start",
    description: "Arc starts 1 Nov: countdown, logging disabled.",
    startDate: "2026-11-01",
    history: "",
    today: "empty",
    nowDate: "2026-10-23",
    nowTime: "15:00",
  },
  {
    id: "day-1",
    label: "Day 1",
    description: "Fresh arc, nothing logged yet.",
    startDate: "2026-10-23",
    history: "",
    today: "empty",
    nowDate: "2026-10-23",
    nowTime: "08:00",
  },
  {
    id: "no-arc",
    arc: "none",
    label: "New user",
    description: "No arc yet: Home and Today offer setup.",
    startDate: "2026-10-23",
    history: "",
    today: "empty",
    nowDate: "2026-10-23",
    nowTime: "10:00",
  },
  {
    id: "returning",
    arc: "returning",
    label: "Returning user",
    description: "Last winter's arc is complete; setup can copy its habits.",
    startDate: "2025-10-01",
    history: "",
    today: "empty",
    nowDate: "2026-10-23",
    nowTime: "10:00",
  },
];

export const DEFAULT_SCENARIO: ScenarioId = "day23";

export function scenario(id: ScenarioId): Scenario {
  const found = SCENARIOS.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown scenario ${id}`);
  return found;
}
