"use client";

import { Button } from "@b-core/ui/components/button";
import { Card, CardDescription, CardLabel, CardTitle } from "@b-core/ui/components/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getToday, type TodayView } from "@/data";

/** B-Core Home entry point: "Start your Winter Arc" when none is active (MASTER_DOC §6). */
export function WinterArcCard() {
  const [view, setView] = useState<TodayView | null>(null);

  useEffect(() => {
    let active = true;
    void getToday().then((v) => active && setView(v));
    return () => {
      active = false;
    };
  }, []);

  if (!view) return <Card className="h-[164px] max-w-md animate-pulse" aria-busy="true" />;

  const content =
    view.kind === "no_arc"
      ? {
          body: "92 days. 10 habits. Never miss two.",
          cta: "Start your Winter Arc",
          href: "/winter-arc/setup",
        }
      : view.kind === "countdown"
        ? {
            body: `Starts in ${view.daysUntilStart} ${view.daysUntilStart === 1 ? "day" : "days"}.`,
            cta: "See the countdown",
            href: "/winter-arc/today",
          }
        : view.kind === "completed"
          ? {
              body: "Arc complete. Your final report is ready soon.",
              cta: "View reports",
              href: "/winter-arc/reports",
            }
          : {
              body: `Day ${view.day.dayNumber} of ${view.arc.durationDays} · ${view.streak.current}-day streak.`,
              cta: "Open Today",
              href: "/winter-arc/today",
            };

  return (
    <Card className="max-w-md">
      <CardLabel>Module</CardLabel>
      <CardTitle>Winter Arc</CardTitle>
      <CardDescription>{content.body}</CardDescription>
      <Button asChild className="self-start">
        <Link href={content.href}>{content.cta}</Link>
      </Button>
    </Card>
  );
}
