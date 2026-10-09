"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMediaQuery } from "../lib/use-media-query";
import { ReportDetail } from "./report-detail";
import { ReportsSplit } from "./reports-split";

/** /reports/[id]: detail page on mobile, list + detail on web (W06). */
export function ReportScreen({ id }: { id: string }) {
  const wide = useMediaQuery("(min-width: 64rem)");
  if (wide) return <ReportsSplit selectedId={id} />;

  return (
    <ReportDetail
      id={id}
      back={
        <Link
          href="/winter-arc/reports"
          className="inline-flex min-h-tap items-center gap-1.5 self-start text-sm text-accent"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          All reports
        </Link>
      }
    />
  );
}
