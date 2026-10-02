"use client";

import type { ReportDetailView } from "@/data";

type Monthly = Extract<ReportDetailView["report"], { type: "monthly" }>;

/** Monthly review (screen #17) — built in the next task. */
export function MonthlyReview(_props: {
  view: ReportDetailView;
  report: Monthly;
  onChange: () => Promise<void>;
}) {
  return <p className="text-text-muted">Monthly review coming in the next task.</p>;
}
