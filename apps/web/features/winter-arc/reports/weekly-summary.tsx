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

type Props = {
  report: Weekly;
  readOnly: boolean;
  /** Web layout (W06): hero card, highlights card, reflection fields side by side. */
  wide?: boolean;
  /** Web hero line, e.g. "Week 4 · 19 Oct – 25 Oct". */
  heading?: string;
};

/** Weekly summary (screen #16): auto-filled numbers + one-line win and fix. */
export function WeeklySummary({ report, readOnly, wide = false, heading }: Props) {
  const s = report.snapshot;
  const change = s.change === null ? null : Math.round(s.change);
  const name = (id: string) => report.habitNames[id] ?? "Habit";
  const fmt = (n: number) => n.toLocaleString("en-US");
  const changeCopy =
    change === null
      ? "first week"
      : change === 0
        ? "same as last week"
        : `${change > 0 ? "▲ +" : "▼ "}${change} vs last week`;

  const reflection = (
    <section
      aria-labelledby="reflect-heading"
      className={
        wide
          ? "flex flex-col gap-3 rounded-card-lg border border-line bg-surface p-5"
          : "flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
      }
    >
      <h2 id="reflect-heading" className="text-lg font-bold">
        {wide ? "Your reflection" : "Reflection"}
      </h2>
      <ReflectionForm<keyof WeeklyReflection>
        fields={FIELDS}
        value={report.reflection}
        readOnly={readOnly}
        columns={wide}
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
  );

  if (wide) {
    const highlights = [
      {
        label: "Best habit",
        value: s.best ? `${name(s.best.habitId)} · ${pct(s.best.ratio)}` : "—",
      },
      {
        label: "Weakest habit",
        value: s.weakest ? `${name(s.weakest.habitId)} · ${pct(s.weakest.ratio)}` : "—",
      },
      { label: "Strong days", value: `${s.strongDays} of ${report.days}` },
      {
        label: "Streak",
        value: `${s.streakStart} → ${s.streakEnd} · ${STREAK_STATE_LABEL[s.streakState]}`,
      },
    ];
    return (
      <div className="flex flex-col gap-6">
        <section
          aria-labelledby="week-total"
          className="flex flex-col gap-2 rounded-card-lg border border-line bg-surface p-5"
        >
          {heading ? <p className="text-[13px] text-text-muted">{heading}</p> : null}
          <h2 id="week-total" className="font-mono text-[32px] leading-tight font-semibold">
            {fmt(s.total)} / {fmt(s.max)} · {s.average === null ? "—" : Math.round(s.average)} avg
          </h2>
          <p className="text-sm text-text-muted">
            {changeCopy} · {s.strongDays} strong {s.strongDays === 1 ? "day" : "days"} · streak{" "}
            {s.streakStart} → {s.streakEnd} ({STREAK_STATE_LABEL[s.streakState]})
          </p>
        </section>
        <section
          aria-labelledby="highlights-heading"
          className="flex flex-col gap-3 rounded-card-lg border border-line bg-surface p-5"
        >
          <h2 id="highlights-heading" className="text-lg font-bold">
            Highlights
          </h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
            {highlights.map((h) => (
              <div key={h.label} className="flex items-baseline justify-between gap-4">
                <dt className="text-[13px] text-text-muted">{h.label}</dt>
                <dd className="text-right font-semibold">{h.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        {reflection}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <section aria-label="Week in numbers" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <ReportStat
          label="Average score"
          value={s.average === null ? "—" : Math.round(s.average)}
          sub={changeCopy}
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
      {reflection}
    </div>
  );
}
