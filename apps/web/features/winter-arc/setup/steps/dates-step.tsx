"use client";

import { Input } from "@b-core/ui/components/input";
import { useState } from "react";
import { generateChapters, plannedEndDate, THRESHOLD_MAX, THRESHOLD_MIN } from "@b-core/arc-engine";
import type { SetupContext } from "@/data";
import { Field } from "../../habits/field";
import { Segmented } from "../../habits/segmented";
import { shortDate } from "../../lib/format";

type Props = {
  ctx: SetupContext;
  startDate: string;
  durationDays: number;
  threshold: number;
  onChange: (patch: {
    startDate?: string;
    durationDays?: number;
    strongThreshold?: number;
  }) => void;
};

const DURATIONS = [
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 92, label: "92 days" },
] as const;

const monthLabel = (date: string) =>
  new Date(`${date}T00:00:00Z`).toLocaleString("en-US", { month: "short", timeZone: "UTC" });

/** S05 Dates and threshold: start, length with chapter preview, strong-day threshold. */
export function DatesStep({ ctx, startDate, durationDays, threshold, onChange }: Props) {
  const { today, nextMonthStart } = ctx.startOptions;
  // "Pick a date" is its own mode: the chosen date may equal today or the 1st.
  const [picking, setPicking] = useState(startDate !== today && startDate !== nextMonthStart);
  const choice = picking ? "pick" : startDate === today ? "today" : "next";
  const chapters = generateChapters(startDate, durationDays);
  const starts = [
    { value: "today", label: `Today · ${shortDate(today)}` },
    ...(nextMonthStart !== today
      ? [{ value: "next", label: `1st · ${shortDate(nextMonthStart)}` }]
      : []),
    { value: "pick", label: "Pick a date" },
  ];

  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">
        Dates and threshold
      </h1>
      <Field label="Start">
        <Segmented
          label="Start date"
          options={starts}
          value={choice}
          columns={1}
          onChange={(v) => {
            setPicking(v === "pick");
            if (v !== "pick") onChange({ startDate: v === "today" ? today : nextMonthStart });
          }}
        />
        {picking ? (
          <Input
            type="date"
            aria-label="Start date"
            min={today}
            value={startDate}
            onChange={(e) => e.target.value && onChange({ startDate: e.target.value })}
          />
        ) : null}
      </Field>
      <Field label="Length">
        <Segmented
          label="Arc length"
          options={DURATIONS}
          value={durationDays}
          onChange={(v) => onChange({ durationDays: v })}
        />
      </Field>
      <div className="flex flex-col gap-2 rounded-card border border-line bg-surface p-4">
        <p className="text-sm">
          {shortDate(startDate)} → {shortDate(plannedEndDate(startDate, durationDays))} ·{" "}
          {chapters.length} {chapters.length === 1 ? "chapter" : "chapters"}
        </p>
        <ol className="flex flex-wrap gap-1.5">
          {chapters.map((c) => (
            <li
              key={c.index}
              className="rounded-cell bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-soft uppercase"
            >
              {monthLabel(c.startDate)} · {c.days}d
            </li>
          ))}
        </ol>
        {chapters[0] && chapters.length > 1 && chapters[0].days < 28 ? (
          <p className="text-xs text-text-muted">
            Starting mid-month makes the first chapter shorter.
          </p>
        ) : null}
      </div>
      <Field
        label={`Strong day at ${threshold}`}
        htmlFor="threshold"
        hint="Days at or above this keep your streak."
      >
        <input
          id="threshold"
          type="range"
          min={THRESHOLD_MIN}
          max={THRESHOLD_MAX}
          step={5}
          value={threshold}
          onChange={(e) => onChange({ strongThreshold: Number(e.target.value) })}
          className="h-tap w-full accent-accent"
        />
        <div
          className="flex justify-between font-mono text-[11px] text-text-faint"
          aria-hidden="true"
        >
          <span>{THRESHOLD_MIN}</span>
          <span>80 default</span>
          <span>{THRESHOLD_MAX}</span>
        </div>
      </Field>
    </>
  );
}
