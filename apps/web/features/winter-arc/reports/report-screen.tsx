"use client";

import { ArrowLeft, FileX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyPage } from "@/components/shell/empty-page";
import { getReport, type ReportDetailView } from "@/data";
import { shortDate } from "../lib/format";
import { MonthlyReview } from "./monthly-review";
import { WeeklySummary } from "./weekly-summary";

type State =
  { status: "loading" } | { status: "missing" } | { status: "ready"; view: ReportDetailView };

export function ReportScreen({ id }: { id: string }) {
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

  const back = (
    <Link
      href="/winter-arc/reports"
      className="inline-flex min-h-tap items-center gap-1.5 self-start text-sm text-accent"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      All reports
    </Link>
  );

  if (state.status === "loading")
    return <div className="h-96 animate-pulse rounded-card bg-surface" aria-busy="true" />;
  if (state.status === "missing") {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <EmptyPage
          icon={FileX}
          title="Report not found"
          description="It may not be generated yet."
        />
      </div>
    );
  }

  const { view } = state;
  const { report } = view;
  return (
    <div className="flex flex-col gap-5">
      {back}
      <header className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">
          {view.arc.name} · {shortDate(report.periodStart)} – {shortDate(report.periodEnd)}
          {view.readOnly ? " · past arc" : ""}
        </p>
        <h1 className="text-[32px] leading-none font-extrabold tracking-tight">{view.title}</h1>
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
      </header>
      {report.type === "weekly" ? (
        <WeeklySummary report={report} readOnly={view.readOnly} />
      ) : (
        <MonthlyReview view={view} report={report} onChange={reload} />
      )}
    </div>
  );
}
