"use client";

import { Button } from "@b-core/ui/components/button";
import { FileText, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { EmptyPage } from "@/components/shell/empty-page";
import { PageHeader } from "@/components/shell/page-header";
import { shortDate } from "../lib/format";
import { HistoryPanel } from "./history-panel";
import { ReportDetail } from "./report-detail";
import { useReports } from "./use-reports";

/** Web reports (W06): History list on the left, the selected report on the right. */
export function ReportsSplit({ selectedId }: { selectedId?: string }) {
  const state = useReports();

  if (state.status === "loading") {
    return (
      <div className="grid grid-cols-[340px_minmax(0,1fr)] gap-6" role="status">
        <div className="h-[520px] animate-pulse rounded-card-lg bg-surface" />
        <div className="h-96 animate-pulse rounded-card-lg bg-surface" />
        <span className="sr-only">Loading reports…</span>
      </div>
    );
  }
  if (state.status === "error") {
    return (
      <div role="alert">
        <EmptyPage
          level={1}
          icon={TriangleAlert}
          title="Reports could not load"
          description="Try again in a moment."
        >
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </EmptyPage>
      </div>
    );
  }

  const { view } = state;
  const selected =
    selectedId ?? view.current?.reports[0]?.id ?? view.past[0]?.reports[0]?.id ?? null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Winter Arc" title="Reports" />
      <div className="grid grid-cols-[340px_minmax(0,1fr)] items-start gap-6">
        <div className="sticky top-6">
          <HistoryPanel view={view} selectedId={selected} />
        </div>
        {selected ? (
          // Keyed so switching reports starts from a fresh loading state.
          <ReportDetail key={selected} id={selected} wide />
        ) : view.current ? (
          <EmptyPage
            icon={FileText}
            title="No reports yet"
            description={`Your first weekly summary arrives the Monday after ${shortDate(view.current.arc.startDate)}, at noon.`}
          />
        ) : (
          <EmptyPage
            icon={FileText}
            title="No active arc"
            description="Reports are written from your logged days."
          >
            <Button asChild>
              <Link href="/winter-arc/setup">Start my arc</Link>
            </Button>
          </EmptyPage>
        )}
      </div>
    </div>
  );
}
