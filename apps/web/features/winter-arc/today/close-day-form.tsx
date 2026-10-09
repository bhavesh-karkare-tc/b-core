"use client";

import { Button } from "@b-core/ui/components/button";
import { cn } from "@b-core/ui/lib/cn";
import { JOURNAL_MAX } from "@b-core/arc-engine";
import { useEffect, useState, type ReactNode } from "react";
import {
  closeDay,
  closeDayInputSchema,
  getCloseDaySummary,
  type CloseDaySummary,
  type DayView,
} from "@/data";
import { streakEffectCopy } from "../lib/streak-copy";

type CloseDayFormProps = {
  day: DayView;
  run: (mutation: () => Promise<unknown>) => Promise<void>;
  /** Heading for the current step; the sheet and the web panel render their own. */
  heading: (saved: boolean) => ReactNode;
  /** Show the summary before saving (sheet) or only after (web panel, next to the score card). */
  summaryBeforeSave?: boolean;
  doneLabel?: string;
  onDone: () => void;
};

const MOODS = [1, 2, 3, 4, 5] as const;

/** Close the day: summary, one-line journal (≤140), mood 1–5. Does not lock the day. */
export function CloseDayForm({
  day,
  run,
  heading,
  summaryBeforeSave = true,
  doneLabel = "Done",
  onDone,
}: CloseDayFormProps) {
  const [summary, setSummary] = useState<CloseDaySummary | null>(null);
  const [journal, setJournal] = useState(day.journal ?? "");
  const [mood, setMood] = useState<number | null>(day.mood);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!summaryBeforeSave) return;
    let live = true;
    void getCloseDaySummary(day.date).then((s) => {
      if (live) setSummary(s);
    });
    return () => {
      live = false;
    };
  }, [day.date, summaryBeforeSave]);

  async function save() {
    const parsed = closeDayInputSchema.safeParse({ journal, mood });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    setError(null);
    await run(async () => setSummary(await closeDay(day.date, { journal, mood })));
    setSaved(true);
  }

  function done() {
    setSaved(false);
    onDone();
  }

  return (
    <>
      {heading(saved)}
      {summary && (saved || summaryBeforeSave) ? (
        <div className="grid grid-cols-3 gap-2 rounded-row border border-line bg-surface-2 p-3 text-center">
          <div>
            <p className="font-mono text-2xl font-semibold">{summary.score ?? "—"}</p>
            <p className="text-xs text-text-muted">score</p>
          </div>
          <div>
            <p className="font-mono text-2xl font-semibold">
              {summary.doneCount}/{summary.totalCount}
            </p>
            <p className="text-xs text-text-muted">done</p>
          </div>
          <div>
            <p
              className={cn(
                "font-mono text-2xl font-semibold",
                summary.isStrong ? "text-accent" : "text-ember",
              )}
            >
              {summary.score === null ? "—" : summary.isStrong ? "Strong" : "Weak"}
            </p>
            <p className="text-xs text-text-muted">day</p>
          </div>
          <p className="col-span-3 text-sm font-semibold">
            {streakEffectCopy(summary.effect, summary.streak.current)}
          </p>
        </div>
      ) : null}
      {saved ? (
        <Button block size="lg" onClick={done}>
          {doneLabel}
        </Button>
      ) : (
        <>
          <label className="flex flex-col gap-1.5">
            <span className="flex justify-between font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase">
              One line about today
              <span aria-live="polite">
                {journal.length}/{JOURNAL_MAX}
              </span>
            </span>
            <textarea
              value={journal}
              maxLength={JOURNAL_MAX}
              rows={2}
              onChange={(e) => setJournal(e.target.value)}
              placeholder="What went well, what to fix."
              className="w-full resize-none rounded-control border border-line-strong bg-surface-2 px-3.5 py-3 text-base text-text outline-none placeholder:text-text-faint focus-visible:border-accent"
            />
          </label>
          <fieldset className="flex flex-col gap-1.5">
            <legend className="mb-1.5 font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase">
              Mood / energy
            </legend>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => (
                <Button
                  key={m}
                  variant={mood === m ? "primary" : "secondary"}
                  aria-pressed={mood === m}
                  aria-label={`Mood ${m} of 5`}
                  onClick={() => setMood(mood === m ? null : m)}
                  className="font-mono"
                >
                  {m}
                </Button>
              ))}
            </div>
          </fieldset>
          {error ? (
            <p role="alert" className="text-sm text-ember">
              {error}
            </p>
          ) : null}
          <Button block size="lg" onClick={() => void save()}>
            {day.closedAt ? "Update" : "Close day"}
          </Button>
        </>
      )}
    </>
  );
}
