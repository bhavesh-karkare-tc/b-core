import { CalendarRange, ListChecks, ShieldAlert } from "lucide-react";
import type { PastArcView } from "@/data";
import { shortDate } from "../../lib/format";
import { ScoringDialog } from "../scoring-dialog";

const CARDS = [
  {
    icon: CalendarRange,
    title: "92 days",
    body: "Three monthly chapters, October to December. Each gets its own review.",
  },
  { icon: ListChecks, title: "Up to 10 habits", body: "One tap each. Under 10 seconds a day." },
  {
    icon: ShieldAlert,
    title: "Never miss two",
    body: "One weak day is a warning. Two in a row break the streak.",
  },
];

/** S01 Intro: default, or "returning user" when a past arc exists. */
export function IntroStep({ lastArc }: { lastArc?: PastArcView }) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="font-mono text-xs tracking-[0.16em] text-accent">WINTER ARC</p>
        <h1 className="text-[36px] leading-none font-extrabold tracking-tight">
          {lastArc ? "Welcome back." : "Start your arc."}
        </h1>
        <p className="text-text-muted">
          {lastArc
            ? `Your last arc ran ${shortDate(lastArc.startDate)} – ${shortDate(lastArc.endDate)}. Start the next one, or copy its habits on the next step.`
            : "A 92-day discipline challenge. Log daily, earn points, protect the streak."}
        </p>
      </div>
      <ul className="flex flex-col gap-2">
        {CARDS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="flex gap-3 rounded-card border border-line bg-surface p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-surface text-accent">
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="font-bold">{title}</p>
              <p className="text-sm text-text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ul>
      <ScoringDialog />
    </>
  );
}
