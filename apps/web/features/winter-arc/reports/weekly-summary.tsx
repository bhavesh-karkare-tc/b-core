"use client";

import { DataError, saveReflection, type ReportDetailView, type WeeklyReflection } from "@/data";
import { STREAK_STATE_LABEL } from "../lib/format";
import { ReflectionForm } from "./reflection-form";
import { ReportStat } from "./report-stat";

type Weekly = Extract<ReportDetailView["report"], { type: "weekly" }>;

const pct = (r: number) => `${Math.round(r * 100)}%`;
const FIELDS = [
  { key: "win", label: "One-line win", placeholder: "What went well this week?" },
  { key: "fix", label: "One-line fix", placeholder: "One thing to do better next week" },
] as const;

/** Weekly summary (screen #16): auto-filled numbers + one-line win and fix. */
export function WeeklySummary({ report, readOnly }: { report: Weekly; readOnly: boolean }) {
  const s = report.snapshot;
  const change = s.change === null ? null : Math.round(s.change);
  const name = (id: string) => report.habitNames[id] ?? "Habit";

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="Week in numbers" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <ReportStat
          label="Average score"
          value={s.average === null ? "—" : Math.round(s.average)}
          sub={
            change === null
              ? "first week"
              : change === 0
                ? "same as last week"
                : `${change > 0 ? "▲ +" : "▼ "}${change} vs last week`
          }
        />
        <ReportStat
          label="Weekly score"
          value={s.total.toLocaleString("en-US")}
          sub={`of ${s.max.toLocaleString("en-US")}`}
        />
        <ReportStat label="Strong days" value={s.strongDays} sub={`of ${report.days}`} />
        <ReportStat
          label="Streak"
          value={`${s.streakStart} → ${s.streakEnd}`}
          sub={STREAK_STATE_LABEL[s.streakState]}
        />
      </section>
      <section aria-label="Habits" className="grid gap-2.5 sm:grid-cols-2">
        <ReportStat
          label="Best habit"
          value={s.best ? pct(s.best.ratio) : "—"}
          sub={s.best ? name(s.best.habitId) : "No data"}
        />
        <ReportStat
          label="Weakest habit"
          value={s.weakest ? pct(s.weakest.ratio) : "—"}
          sub={s.weakest ? name(s.weakest.habitId) : "Every habit at the top"}
        />
      </section>
      <section
        aria-labelledby="reflect-heading"
        className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      >
        <h2 id="reflect-heading" className="text-lg font-bold">
          Reflection
        </h2>
        <ReflectionForm<keyof WeeklyReflection>
          fields={FIELDS}
          value={report.reflection}
          readOnly={readOnly}
          onSave={async (value) => {
            try {
              await saveReflection(report.id, value);
              return null;
            } catch (e) {
              return e instanceof DataError ? e.message : "Could not save. Try again.";
            }
          }}
        />
      </section>
    </div>
  );
}
