import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReportListItem } from "@/data";
import { shortDate } from "../lib/format";
import { ReflectionBadge } from "./reflection-badge";

export function ReportCard({ item, readOnly }: { item: ReportListItem; readOnly?: boolean }) {
  return (
    <li>
      <Link
        href={`/winter-arc/reports/${item.id}`}
        className="flex min-h-tap items-center gap-3 rounded-row border border-line bg-surface px-4 py-3 transition-colors hover:border-line-strong"
      >
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold">{item.title}</span>
            <span className="font-mono text-[11px] text-text-faint uppercase">
              {shortDate(item.periodStart)} – {shortDate(item.periodEnd)}
            </span>
          </span>
          <span className="text-sm text-text-muted">{item.headline}</span>
          <ReflectionBadge state={item.reflection} readOnly={readOnly} />
        </span>
        <ChevronRight className="size-4 shrink-0 text-text-faint" aria-hidden="true" />
      </Link>
    </li>
  );
}
