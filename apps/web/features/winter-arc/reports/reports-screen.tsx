"use client";

import { Button } from "@b-core/ui/components/button";
import { FileText, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { EmptyPage } from "@/components/shell/empty-page";
import { PageHeader } from "@/components/shell/page-header";
import { shortDate } from "../lib/format";
import { useMediaQuery } from "../lib/use-media-query";
import { ReportCard } from "./report-card";
import { ReportsSplit } from "./reports-split";
import { useReports } from "./use-reports";

/** Report history (MASTER_DOC §11): current arc newest first, then past arcs (R14). */
export function ReportsScreen() {
  const wide = useMediaQuery("(min-width: 64rem)");
  return wide ? <ReportsSplit /> : <ReportsList />;
}

/** Mobile: the list on its own page; each report opens /reports/[id]. */
function ReportsList() {
  const state = useReports();

  if (state.status === "loading") {
    return (
      <div
        className="h-96 animate-pulse rounded-card bg-surface"
        role="status"
        aria-label="Loading reports"
      />
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

  const { current, past } = state.view;
  const nextDue = current?.nextDue ? new Date(current.nextDue) : null;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Winter Arc" title="Reports" />
      {current ? (
        <section aria-labelledby="current-reports" className="flex flex-col gap-3">
          <h2 id="current-reports" className="text-lg font-bold">
            This arc
          </h2>
          {nextDue ? (
            <p className="text-sm text-text-muted">
              Next report:{" "}
              {nextDue.toLocaleString("en-US", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })}
              .
            </p>
          ) : null}
          {current.reports.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {current.reports.map((r) => (
                <ReportCard key={r.id} item={r} />
              ))}
            </ul>
          ) : (
            <EmptyPage
              icon={FileText}
              title="No reports yet"
              description={`Your first weekly summary arrives the Monday after ${shortDate(current.arc.startDate)}, at noon.`}
            />
          )}
        </section>
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

      {past.length > 0 ? (
        <section aria-labelledby="past-reports" className="flex flex-col gap-3">
          <h2 id="past-reports" className="text-lg font-bold">
            Past arcs
          </h2>
          {past.map((p) => (
            <details key={p.arc.id} className="rounded-card border border-line bg-surface p-3">
              <summary className="flex min-h-tap cursor-pointer items-center justify-between gap-3">
                <span className="font-semibold">
                  {p.arc.name} · {shortDate(p.arc.startDate)} – {shortDate(p.arc.endDate)}
                </span>
                <span className="font-mono text-[11px] text-text-faint uppercase">
                  {p.status} · {p.reports.length} reports
                </span>
              </summary>
              <ul className="mt-2 flex flex-col gap-2">
                {p.reports.map((r) => (
                  <ReportCard key={r.id} item={r} readOnly />
                ))}
              </ul>
            </details>
          ))}
        </section>
      ) : null}
    </div>
  );
}
