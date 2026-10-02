import type { NotificationSettings, NotificationType } from "./types";

/** Defaults from MASTER_DOC §12 (UI only in Phase 1; delivery arrives with Phase 2). */
export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  types: {
    morning_plan: { enabled: true, time: "07:00" },
    habit_reminder: { enabled: true, time: null },
    close_day: { enabled: true, time: "21:30" },
    streak_risk: { enabled: true, time: "18:00" },
    cutoff_warning: { enabled: true, time: "09:00" },
    report_ready: { enabled: true, time: null },
    milestone: { enabled: true, time: null },
    weekly_challenge: { enabled: false, time: "08:00" },
  },
  quietHours: { start: "23:00", end: "07:00" },
  dailyCap: 4,
};

/** Display order and copy (priority order for the daily cap: streak risk, cutoff, habit reminders, rest). */
export const NOTIFICATION_INFO: readonly {
  type: NotificationType;
  label: string;
  description: string;
  phase2?: boolean;
}[] = [
  {
    type: "streak_risk",
    label: "Streak at risk",
    description: "Yesterday was weak and today isn't strong yet.",
  },
  {
    type: "cutoff_warning",
    label: "Cutoff warning",
    description: "Yesterday has unlogged habits before noon.",
  },
  {
    type: "habit_reminder",
    label: "Habit reminders",
    description: "At each habit's reminder time, if not logged.",
  },
  { type: "morning_plan", label: "Morning plan", description: "Your day: habits and focus." },
  {
    type: "close_day",
    label: "Close the day",
    description: "When habits are still unlogged in the evening.",
  },
  { type: "report_ready", label: "Report ready", description: "Weekly and monthly reports." },
  { type: "milestone", label: "Milestones", description: "Rank-ups, badges and records." },
  {
    type: "weekly_challenge",
    label: "Weekly challenge",
    description: "Monday's bonus challenge.",
    phase2: true,
  },
];
