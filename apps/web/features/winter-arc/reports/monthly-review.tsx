"use client";

import { DataError, saveReflection, type MonthlyReflection, type ReportDetailView } from "@/data";
import { Button } from "@b-core/ui/components/button";
import { FileDown, Printer } from "lucide-react";
import { notifyDataChanged } from "../lib/data-events";
import { BodyCheckReview } from "./body-check-review";
import { ReflectionForm } from "./reflection-form";
import { ReportStat } from "./report-stat";

type Monthly = Extract<ReportDetailView["report"], { type: "monthly" }>;

const WEEKDAY = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
const pct = (r: number | null) => (r === null ? "—" : `${Math.round(r * 100)}%`);
const FIELDS = [
  {
    key: "biggestWin",
    label: "Biggest win",
    placeholder: "What are you proudest of this chapter?",
  },
  { key: "fixThis", label: "Fix this", placeholder: "The one thing that held you back" },
  { key: "nextTarget", label: "Next chapter target", placeholder: "e.g. No missed water days" },
] as const;

type Props = {
  view: ReportDetailView;
  report: Monthly;
  onChange: () => Promise<void>;
  /** Web layout (W07): tiles, habit table + pattern left, body check + reflection right. */
  wide?: boolean;
};

const card = "flex flex-col gap-3 rounded-card-lg border border-line bg-surface p-5";

/** Monthly review (screen #17): chapter numbers, habit totals, body check delta, reflections. */
export function MonthlyReview({ view, report, onChange, wide = false }: Props) {
  const s = report.snapshot;
  const name = (id: string) => report.habitNames[id] ?? "Habit";
  const fmt = (n: number) => n.toLocaleString("en-US");

  const tiles = (
    <section
      aria-label="Chapter in numbers"
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:gap-4"
    >
      <ReportStat label="Chapter score" value={fmt(s.total)} sub={`of ${fmt(s.max)}`} />
      <ReportStat
        label="Average"
        value={s.average === null ? "—" : Math.round(s.average)}
        sub={`${s.countedDays} counted days`}
      />
      <ReportStat label="Strong days" value={s.strongDays} sub={`of ${report.days}`} />
      <ReportStat label="Best streak" value={s.bestStreak} sub="days this chapter" />
    </section>
  );

  const pattern = (
    <section
      aria-labelledby="pattern-heading"
      className={wide ? card : "flex flex-col gap-1 rounded-card border border-line bg-surface p-4"}
    >
      <h2 id="pattern-heading" className={wide ? "text-lg font-bold" : "font-semibold"}>
        Day-of-week pattern
      </h2>
      <p className="text-sm text-text-soft">
        {s.pattern
          ? `Your ${WEEKDAY[s.pattern.weekday]} average was ${Math.round(s.pattern.average)}, ${Math.round(s.pattern.gap)} below your other days.`
          : "No weekday stood out this chapter."}
      </p>
    </section>
  );

  const table = (
    <table className="w-full min-w-[28rem] text-left text-sm">
      <thead className="font-mono text-[11px] text-text-faint uppercase">
        <tr>
          <th className="py-1 font-normal">Habit</th>
          <th className="py-1 text-right font-normal">Done</th>
          <th className="py-1 text-right font-normal">Min</th>
          <th className="py-1 text-right font-normal">Missed</th>
          <th className="py-1 text-right font-normal">Rest</th>
          <th className="py-1 text-right font-normal">%</th>
        </tr>
      </thead>
      <tbody className="font-mono tabular-nums">
        {s.habits.map((h) => (
          <tr key={h.habitId} className="border-t border-line">
            <td className={wide ? "py-3 font-sans" : "py-2 font-sans"}>{name(h.habitId)}</td>
            <td className="py-2 text-right">{h.done}</td>
            <td className="py-2 text-right">{h.minimum}</td>
            <td className="py-2 text-right">{h.missed}</td>
            <td className="py-2 text-right">{h.rest}</td>
            <td className="py-2 text-right">{pct(h.ratio)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const body = view.bodyCheck ? (
    <BodyCheckReview
      reportId={report.id}
      start={view.bodyCheck.start}
      end={view.bodyCheck.end}
      readOnly={view.readOnly}
      onSaved={onChange}
    />
  ) : null;

  const reflection = (
    <section
      aria-labelledby="reflect-heading"
      className={wide ? card : "flex flex-col gap-3 rounded-card border border-line bg-surface p-4"}
    >
      <h2 id="reflect-heading" className="text-lg font-bold">
        Reflection
      </h2>
      <ReflectionForm<keyof MonthlyReflection>
        fields={FIELDS}
        value={report.reflection}
        readOnly={view.readOnly}
        onSave={async (value) => {
          try {
            await saveReflection(report.id, value);
            notifyDataChanged();
            return null;
          } catch (e) {
            return e instanceof DataError ? e.message : "Could not save. Try again.";
          }
        }}
      />
    </section>
  );

  if (wide) {
    return (
      <div className="flex flex-col gap-6">
        {tiles}
        <div className="grid grid-cols-12 items-start gap-6">
          <div className="col-span-7 flex flex-col gap-6">
            <section aria-labelledby="habit-totals" className={card}>
              <h2 id="habit-totals" className="text-lg font-bold">
                Habit-wise totals
              </h2>
              <div className="overflow-x-auto">{table}</div>
            </section>
            {pattern}
          </div>
          <div className="col-span-5 flex flex-col gap-6">
            {body ? (
              <section aria-labelledby="body-heading" className={card}>
                <h2 id="body-heading" className="text-lg font-bold">
                  Body check
                </h2>
                {body}
              </section>
            ) : null}
            {reflection}
            {/* Export and the printed monthly sheet arrive in Phase 2. */}
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" disabled title="Export arrives in Phase 2">
                <FileDown aria-hidden="true" />
                Export PDF
              </Button>
              <Button variant="secondary" disabled title="Print arrives in Phase 2">
                <Printer aria-hidden="true" />
                Print monthly sheet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {tiles}

      <section aria-label="Strongest and weakest" className="grid gap-2.5 sm:grid-cols-2">
        <ReportStat
          label="Strongest habit"
          value={s.best ? pct(s.best.ratio) : "—"}
          sub={s.best ? name(s.best.habitId) : "No data"}
        />
        <ReportStat
          label="Weakest habit"
          value={s.weakest ? pct(s.weakest.ratio) : "—"}
          sub={s.weakest ? name(s.weakest.habitId) : "Every habit at the top"}
        />
      </section>

      {pattern}

      <section aria-labelledby="habit-totals" className="flex flex-col gap-2">
        <h2 id="habit-totals" className="text-lg font-bold">
          Habit totals
        </h2>
        <div className="overflow-x-auto rounded-card border border-line bg-surface p-3">
          {table}
        </div>
      </section>

      {body ? (
        <section aria-labelledby="body-heading" className="flex flex-col gap-2">
          <h2 id="body-heading" className="text-lg font-bold">
            Body check
          </h2>
          <div className="rounded-card border border-line bg-surface p-4">{body}</div>
        </section>
      ) : null}

      {reflection}
    </div>
  );
}
