"use client";

import { Button } from "@b-core/ui/components/button";
import { diffDays } from "@b-core/arc-engine";
import { PartyPopper } from "lucide-react";
import Link from "next/link";
import type { ArcSummary } from "@/data";
import { shortDate } from "../lib/format";

/** Confirmation: lands on Today (Day 1) or the countdown for a future start (TC06). */
export function CreatedStep({ arc, today }: { arc: ArcSummary; today: string }) {
  const waitDays = diffDays(arc.startDate, today);
  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-16 animate-in items-center justify-center rounded-full bg-accent-surface text-accent duration-500 zoom-in-75">
        <PartyPopper className="size-8" aria-hidden="true" />
      </span>
      <h1 className="text-[32px] leading-tight font-extrabold tracking-tight">Your arc is set.</h1>
      <p className="max-w-sm text-text-muted">
        {waitDays > 0
          ? `It starts ${shortDate(arc.startDate)}, in ${waitDays} ${waitDays === 1 ? "day" : "days"}. Get ready.`
          : `Day 1 starts now. ${arc.durationDays} days to ${shortDate(arc.endDate)}. Never miss two.`}
      </p>
      <Button asChild size="lg" className="min-w-56">
        <Link href="/winter-arc/today">{waitDays > 0 ? "See the countdown" : "Go to Today"}</Link>
      </Button>
    </div>
  );
}
