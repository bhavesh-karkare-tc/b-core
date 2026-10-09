"use client";

import { cn } from "@b-core/ui/lib/cn";
import Link from "next/link";
import { useState } from "react";
import type { ReportListItem, ReportsView } from "@/data";
import { shortDate } from "../lib/format";
import { ReflectionBadge } from "./reflection-badge";

type Filter = "all" | "weekly" | "monthly" | "arc";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "arc", label: "Arc" },
];

type Props = { view: ReportsView; selectedId: string | null };

/** Web report history (W06): type filter, current arc newest first, upcoming, past arcs. */
export function HistoryPanel({ view, selectedId }: Props) {
  const [filter, setFilter] = useState<Filter>("all");
  const keep = (r: ReportListItem) => filter === "all" || r.type === filter;
  const current = view.current;
  const nextDue = filter === "all" && current?.nextDue ? new Date(current.nextDue) : null;

  return (
    <section
      aria-labelledby="history-heading"
      className="flex flex-col gap-3 rounded-card-lg border border-line bg-surface p-5"
    >
      <h2 id="history-heading" className="text-lg font-bold">
        History
      </h2>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Report type">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "h-9 rounded-full px-3.5 text-[13px] transition-colors",
              filter === f.value
                ? "bg-text font-bold text-bg"
                : "border border-line-strong text-text-muted hover:text-text",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter === "arc" ? (
        <p className="px-3 py-2 text-sm text-text-muted">
          The arc report arrives after the last day of the arc.
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-1">
            {(current?.reports ?? []).filter(keep).map((r) => (
              <HistoryItem key={r.id} item={r} selected={r.id === selectedId} />
            ))}
            {nextDue ? (
              <li className="flex flex-col gap-0.5 px-3 py-2.5">
                <span className="font-semibold text-text-muted">Next report</span>
                <span className="text-[13px] text-text-faint">
                  {nextDue.toLocaleString("en-US", {
                    day: "numeric",
                    month: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  })}{" "}
                  · upcoming
                </span>
              </li>
            ) : null}
          </ul>
          {view.past.map((p) => {
            const reports = p.reports.filter(keep);
            if (reports.length === 0) return null;
            return (
              <div key={p.arc.id} className="flex flex-col gap-1 border-t border-line pt-3">
                <p className="px-3 font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase">
                  {p.arc.name} · {shortDate(p.arc.startDate)} – {shortDate(p.arc.endDate)}
                </p>
                <ul className="flex flex-col gap-1">
                  {reports.map((r) => (
                    <HistoryItem key={r.id} item={r} selected={r.id === selectedId} readOnly />
                  ))}
                </ul>
              </div>
            );
          })}
        </>
      )}
    </section>
  );
}

function HistoryItem({
  item,
  selected,
  readOnly,
}: {
  item: ReportListItem;
  selected: boolean;
  readOnly?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/winter-arc/reports/${item.id}`}
        aria-current={selected ? "page" : undefined}
        className={cn(
          "flex min-h-tap flex-col gap-0.5 rounded-row px-3 py-2.5 transition-colors",
          selected ? "bg-surface-2" : "hover:bg-surface-2/60",
        )}
      >
        <span className="font-semibold">{item.title}</span>
        <span className="text-[13px] text-text-muted">
          {shortDate(item.periodStart)} – {shortDate(item.periodEnd)} · {item.headline}
        </span>
        <ReflectionBadge state={item.reflection} readOnly={readOnly} />
      </Link>
    </li>
  );
}
