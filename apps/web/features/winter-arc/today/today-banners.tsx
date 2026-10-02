"use client";

import { Button } from "@b-core/ui/components/button";
import { Clock, Moon, RotateCcw, ShieldCheck, Thermometer, TriangleAlert } from "lucide-react";
import type { Banner } from "@/data";
import { countWord, timeLeft } from "../lib/format";
import { AllDoneBanner } from "./all-done-banner";
import { BannerCard } from "./banner-card";

type TodayBannersProps = {
  banners: Banner[];
  date: string;
  threshold: number;
  /** Demo/server "now" for the time-left label. */
  nowMs: number;
  onOpenYesterday: (date: string) => void;
};

export function TodayBanners({
  banners,
  date,
  threshold,
  nowMs,
  onOpenYesterday,
}: TodayBannersProps) {
  if (banners.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {banners.map((b) => {
        switch (b.kind) {
          case "sick_day":
            return (
              <BannerCard
                key={b.kind}
                icon={Thermometer}
                title="Sick day"
                body="Score not counted. Streak frozen. Rest up."
              />
            );
          case "yesterday_unlogged":
            return (
              <BannerCard
                key={b.kind}
                icon={Clock}
                tone="accent"
                title={`Yesterday has ${b.unlogged} unlogged ${b.unlogged === 1 ? "habit" : "habits"}, ${timeLeft(new Date(b.closesAt).getTime() - nowMs)}`}
                body="Logs close at noon."
                action={
                  <Button variant="secondary" onClick={() => onOpenYesterday(b.date)}>
                    Log yesterday
                  </Button>
                }
              />
            );
          case "broken":
            return (
              <BannerCard
                key={b.kind}
                icon={RotateCcw}
                title="Streak reset. Restart strong today."
                body={
                  b.best > 0
                    ? `Your best so far is ${b.best} days. Today is day one of the next one.`
                    : "Today is day one."
                }
              />
            );
          case "shielded":
            return (
              <BannerCard
                key={b.kind}
                icon={ShieldCheck}
                tone="accent"
                title="A shield saved your streak."
                body={`${b.shieldsHeld === 0 ? "No shields left" : `${countWord(b.shieldsHeld)} left`}. Make today strong.`}
              />
            );
          case "at_risk":
            return (
              <BannerCard
                key={b.kind}
                icon={TriangleAlert}
                tone="ember"
                title="One weak day. Don't miss two."
                body={
                  b.habitsNeeded
                    ? `Score ${threshold} to stay safe: ${b.habitsNeeded} more ${b.habitsNeeded === 1 ? "habit" : "habits"}.`
                    : `Score ${threshold} to stay safe.`
                }
              />
            );
          case "recovery_day":
            return (
              <BannerCard
                key={b.kind}
                icon={Moon}
                title="Recovery day"
                body="Rest counts in full today."
              />
            );
          case "all_done":
            return <AllDoneBanner key={b.kind} date={date} />;
        }
      })}
    </div>
  );
}
