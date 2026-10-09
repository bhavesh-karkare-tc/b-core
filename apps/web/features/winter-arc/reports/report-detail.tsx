"use client";

import { FileX } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { EmptyPage } from "@/components/shell/empty-page";
import { getReport, type ReportDetailView } from "@/data";
import { shortDate } from "../lib/format";
import { MonthlyReview } from "./monthly-review";
import { WeeklySummary } from "./weekly-summary";

type State =
  { status: "loading" } | { status: "missing" } | { status: "ready"; view: ReportDetailView };

type Props = {
  id: string;
  /** "All reports" link on mobile; the web split view has the list beside it. */
  back?: ReactNode;
  /** Web layout (W06): weekly summary as hero, highlights and reflection cards. */
  wide?: boolean;
};

/** One report: header plus the weekly summary or monthly review. */
export function ReportDetail({ id, back, wide = false }: Props) {
  const [state, setState] = useState<State>({ status: "loading" });

  const reload = useCallback(async () => {
    const view = await getReport(id);
    setState(view ? { status: "ready", view } : { status: "missing" });
  }, [id]);

  useEffect(() => {
    let active = true;
    void getReport(id).then(
      (view) => active && setState(view ? { status: "ready", view } : { status: "missing" }),
    );
    return () => {
      active = false;
    };
  }, [id]);

  if (state.status === "loading")
    return <div className="h-96 animate-pulse rounded-card bg-surface" aria-busy="true" />;
  if (state.status === "missing") {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <EmptyPage
          level={1}
          icon={FileX}
          title="Report not found"
          description="It may not be generated yet."
        />
      </div>
    );
  }

  const { view } = state;
  const { report } = view;
  const generated = (
    <p className="text-xs text-text-muted">
      Generated{" "}
      {new Date(report.generatedAt).toLocaleString("en-US", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })}
      . Reports don&apos;t change after they&apos;re written.
    </p>
  );

  // Web weekly: the summary card is the header (W06).
  if (wide && report.type === "weekly") {
    return (
      <div className="flex flex-col gap-6">
        <WeeklySummary
          report={report}
          readOnly={view.readOnly}
          wide
          heading={`${view.title} · ${shortDate(report.periodStart)} – ${shortDate(report.periodEnd)}${view.readOnly ? " · past arc" : ""}`}
        />
        {generated}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {back}
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">
          {view.arc.name} · {shortDate(report.periodStart)} – {shortDate(report.periodEnd)}
          {view.readOnly ? " · past arc" : ""}
        </p>
        <h1 className="text-[32px] leading-none font-extrabold tracking-tight">{view.title}</h1>
        {generated}
      </header>
      {report.type === "weekly" ? (
        <WeeklySummary report={report} readOnly={view.readOnly} />
      ) : (
        <MonthlyReview view={view} report={report} onChange={reload} />
      )}
    </div>
  );
}
