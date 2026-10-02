/**
 * Report snapshots (MASTER_DOC §11, A15). Pure: stored arc + engine → reports and views.
 * A report is computed as of its own generation time and stored; it never changes afterwards.
 */
import {
  baselineCheck,
  dueReports,
  evaluateArc,
  monthlySnapshot,
  reportPeriods,
  weeklySnapshot,
} from "@b-core/arc-engine";
import type {
  ReflectionState,
  ReportDetailView,
  ReportListItem,
  ReportsView,
  StoredArc,
  StoredReport,
} from "./types";
import { arcSummary, currentHabits } from "./view-models";

const DAY_MS = 24 * 60 * 60 * 1000;
const monthLong = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" });

/** Reports are generated up to now, or up to the moment an arc was abandoned (E15). */
function reportClock(arc: StoredArc, now: Date): Date {
  const stop = arc.abandonedAt ? new Date(arc.abandonedAt) : null;
  return stop && stop < now ? stop : now;
}

/** Generate any due reports that aren't stored yet. Returns the full list (oldest first). */
export function ensureReports(arc: StoredArc, now: Date): StoredReport[] {
  const stored = arc.reports ?? [];
  const have = new Set(stored.map((r) => `${r.type}-${r.index}`));
  const habits = currentHabits(arc);
  const ids = habits.map((h) => h.id);
  const names = Object.fromEntries(habits.map((h) => [h.id, h.name]));
  const fresh: StoredReport[] = [];

  for (const due of dueReports(arc.arc, reportClock(arc, now))) {
    if (have.has(`${due.type}-${due.index}`)) continue;
    const days = evaluateArc({ ...arc, now: due.generatedAt });
    const base = {
      id: `${arc.arc.id}-${due.type}-${due.index}`,
      arcId: arc.arc.id,
      index: due.index,
      periodStart: due.periodStart,
      periodEnd: due.periodEnd,
      days: due.days,
      generatedAt: due.generatedAt.toISOString(),
      habitNames: names,
      reflectionSavedAt: null,
    };
    fresh.push(
      due.type === "weekly"
        ? { ...base, type: "weekly", snapshot: weeklySnapshot(days, ids, due), reflection: null }
        : { ...base, type: "monthly", snapshot: monthlySnapshot(days, ids, due), reflection: null },
    );
  }
  return [...stored, ...fresh].sort((a, b) => a.generatedAt.localeCompare(b.generatedAt));
}

export function reportTitle(
  r: Pick<StoredReport, "type" | "index" | "days" | "periodStart">,
): string {
  if (r.type === "monthly")
    return `${monthLong.format(new Date(`${r.periodStart}T00:00:00Z`))} review`;
  return r.days < 7 ? `Week ${r.index} · ${r.days} days` : `Week ${r.index}`;
}

function reflectionState(r: StoredReport, now: Date): ReflectionState {
  if (r.reflection) return "done";
  return now.getTime() - new Date(r.generatedAt).getTime() > DAY_MS ? "pending" : "empty";
}

function headline(r: StoredReport): string {
  const avg = r.snapshot.average === null ? "—" : String(Math.round(r.snapshot.average));
  if (r.type === "weekly") return `Avg ${avg} · ${r.snapshot.strongDays} strong of ${r.days}`;
  return `${r.snapshot.total.toLocaleString("en-US")} of ${r.snapshot.max.toLocaleString("en-US")} · avg ${avg}`;
}

function listItem(r: StoredReport, now: Date, readOnly: boolean): ReportListItem {
  return {
    id: r.id,
    type: r.type,
    title: reportTitle(r),
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    generatedAt: r.generatedAt,
    headline: headline(r),
    reflection: readOnly && !r.reflection ? "empty" : reflectionState(r, now),
  };
}

/** Reports list: the current arc newest first, then past arcs (R14). */
export function buildReportsView(
  arcs: readonly StoredArc[],
  activeArcId: string | null,
  now: Date,
): ReportsView {
  const active = arcs.find((a) => a.arc.id === activeArcId) ?? null;
  const next = active
    ? reportPeriods(active.arc).find((p) => p.generatedAt.getTime() > now.getTime())
    : undefined;
  return {
    current: active
      ? {
          arc: arcSummary(active),
          reports: (active.reports ?? []).map((r) => listItem(r, now, false)).reverse(),
          nextDue: next ? next.generatedAt.toISOString() : null,
        }
      : null,
    past: arcs
      .filter((a) => a.arc.id !== activeArcId)
      .sort((a, b) => b.arc.startDate.localeCompare(a.arc.startDate))
      .map((a) => ({
        arc: arcSummary(a),
        status: a.arc.status,
        reports: (a.reports ?? []).map((r) => listItem(r, now, true)).reverse(),
      })),
  };
}

export function buildReportDetail(
  arc: StoredArc,
  reportId: string,
  readOnly: boolean,
): ReportDetailView | null {
  const report = (arc.reports ?? []).find((r) => r.id === reportId);
  if (!report) return null;
  const end = [...arc.bodyChecks]
    .filter((c) => c.date > report.periodStart && c.date <= report.periodEnd)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return {
    report,
    title: reportTitle(report),
    arc: arcSummary(arc),
    readOnly,
    bodyCheck:
      report.type === "monthly"
        ? { start: baselineCheck(arc.bodyChecks, report.periodStart), end: end ?? null }
        : null,
  };
}
