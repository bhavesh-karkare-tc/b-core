"use client";

import { cn } from "@b-core/ui/lib/cn";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { BannerCard } from "./banner-card";

const KEY = "b-core:winter-arc:celebrated";

function seen(date: string): boolean {
  try {
    return window.localStorage.getItem(KEY) === date;
  } catch {
    return false;
  }
}

/** "All done" — animated the first time it shows on a date, calm afterwards (MASTER_DOC §7). */
export function AllDoneBanner({ date }: { date: string }) {
  const [celebrate] = useState(() => !seen(date));

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, date);
    } catch {
      // storage blocked: celebrate again next time, harmless
    }
  }, [date]);

  return (
    <BannerCard
      icon={Sparkles}
      tone="accent"
      title="All done. Every habit logged."
      body="That's a full day. Close it with one line."
      className={cn(celebrate && "animate-in duration-700 fade-in-0 zoom-in-95")}
    />
  );
}
