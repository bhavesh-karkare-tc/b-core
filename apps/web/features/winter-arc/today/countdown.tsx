import { Button } from "@b-core/ui/components/button";
import { Card, CardLabel } from "@b-core/ui/components/card";
import { Check } from "lucide-react";
import Link from "next/link";
import type { ArcSummary } from "@/data";
import { shortDate } from "../lib/format";

type CountdownProps = { arc: ArcSummary; daysUntilStart: number; myWhy: string };

/** Before the start date: countdown, My Why, and what is already set (TC06). Logging is disabled. */
export function Countdown({ arc, daysUntilStart, myWhy }: CountdownProps) {
  const ready = [
    "10 habits set",
    `Strong day at ${arc.strongThreshold}`,
    `${arc.durationDays} days, ends ${shortDate(arc.endDate)}`,
  ];
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.16em] text-accent">
          WINTER ARC · STARTS {shortDate(arc.startDate).toUpperCase()}
        </p>
        <h1 className="flex items-baseline gap-2">
          <span className="text-[40px] leading-none font-extrabold tracking-tight">
            {daysUntilStart}
          </span>
          <span className="font-mono text-base text-text-muted">
            {daysUntilStart === 1 ? "day to go" : "days to go"}
          </span>
        </h1>
      </header>
      <Card>
        <CardLabel>My why</CardLabel>
        <p className="text-base leading-snug">{myWhy}</p>
      </Card>
      <Card>
        <CardLabel>Ready</CardLabel>
        <ul className="flex flex-col gap-2">
          {ready.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm">
              <Check className="size-4 text-accent" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-sm text-text-muted">
          Logging opens on Day 1. You can still change your habits until the end of Day 3.
        </p>
        <Button asChild variant="secondary" className="self-start">
          <Link href="/winter-arc/settings">Edit habits</Link>
        </Button>
      </Card>
    </div>
  );
}
