"use client";

import { Button } from "@b-core/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@b-core/ui/components/sheet";
import { cn } from "@b-core/ui/lib/cn";
import { JOURNAL_MAX } from "@b-core/arc-engine";
import { useState } from "react";
import {
  closeDay,
  closeDayInputSchema,
  getCloseDaySummary,
  type CloseDaySummary,
  type DayView,
} from "@/data";
import { streakEffectCopy } from "../lib/streak-copy";

type CloseDaySheetProps = {
  day: DayView;
  run: (mutation: () => Promise<unknown>) => Promise<void>;
};

const MOODS = [1, 2, 3, 4, 5] as const;

/** Close the day: summary, one-line journal (≤140), mood 1–5. Does not lock the day. */
export function CloseDaySheet({ day, run }: CloseDaySheetProps) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<CloseDaySummary | null>(null);
  const [journal, setJournal] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) return;
    setJournal(day.journal ?? "");
    setMood(day.mood);
    setError(null);
    setSaved(false);
    setSummary(await getCloseDaySummary(day.date));
  }

  async function save() {
    const parsed = closeDayInputSchema.safeParse({ journal, mood });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form.");
      return;
    }
    await run(async () => setSummary(await closeDay(day.date, { journal, mood })));
    setSaved(true);
  }

  return (
    <>
      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 -mx-4 bg-bg/95 px-4 pt-2.5 pb-2.5 backdrop-blur lg:bottom-6 lg:mx-0 lg:bg-transparent lg:px-0">
        <Button
          size="lg"
          block
          className="h-[52px] rounded-row bg-text text-bg hover:bg-text-soft"
          onClick={() => void onOpenChange(true)}
        >
          {day.closedAt ? "Day closed · edit" : "Close the day"}
        </Button>
      </div>
      <Sheet open={open} onOpenChange={(o) => void onOpenChange(o)}>
        <SheetContent side="bottom" className="mx-auto w-full max-w-xl">
          <SheetHeader>
            <SheetTitle>{saved ? "Day closed" : "Close the day"}</SheetTitle>
            <SheetDescription>
              Closing doesn&apos;t lock the day. Logs stay open until noon tomorrow.
            </SheetDescription>
          </SheetHeader>
          {summary ? (
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
            <Button block size="lg" onClick={() => setOpen(false)}>
              Done
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
        </SheetContent>
      </Sheet>
    </>
  );
}
