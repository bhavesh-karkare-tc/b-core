import { DAYS_PER_SICK_DAY } from "./constants";

/** Sick days allowed in an arc: 1 per 30 days (92 → 3, 60 → 2, 30 → 1). Assumption A4. */
export function sickDayAllowance(durationDays: number): number {
  return Math.floor(durationDays / DAYS_PER_SICK_DAY);
}

/** Sick days left; never negative. */
export function sickDaysRemaining(durationDays: number, used: number): number {
  return Math.max(0, sickDayAllowance(durationDays) - used);
}
