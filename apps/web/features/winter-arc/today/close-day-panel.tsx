"use client";

import { useId } from "react";
import type { DayView } from "@/data";
import { CloseDayForm } from "./close-day-form";

type CloseDayPanelProps = {
  day: DayView;
  run: (mutation: () => Promise<unknown>) => Promise<void>;
};

/** Web (W02): Close the day as an always-open card in the right column. */
export function CloseDayPanel({ day, run }: CloseDayPanelProps) {
  const headingId = useId();
  return (
    <section
      aria-labelledby={headingId}
      className="flex flex-col gap-3 rounded-card-lg border border-line bg-surface p-5"
    >
      <CloseDayForm
        key={day.date}
        day={day}
        run={run}
        summaryBeforeSave={false}
        doneLabel="Edit note"
        onDone={() => undefined}
        heading={(saved) => (
          <div className="flex flex-col gap-1">
            <h2 id={headingId} className="text-lg font-bold">
              {saved ? "Day closed" : day.closedAt ? "Day closed · edit" : "Close the day"}
            </h2>
            <p className="text-[13px] text-text-muted">
              Closing doesn&apos;t lock the day. Logs stay open until noon tomorrow.
            </p>
          </div>
        )}
      />
    </section>
  );
}
