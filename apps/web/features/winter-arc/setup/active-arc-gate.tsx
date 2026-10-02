"use client";

import { Button } from "@b-core/ui/components/button";
import { Flag } from "lucide-react";
import Link from "next/link";
import { EmptyPage } from "@/components/shell/empty-page";
import type { ArcSummary } from "@/data";
import { shortDate } from "../lib/format";
import { AbandonArcDialog } from "../settings/abandon-arc-dialog";

type Props = { arc: ArcSummary; onAbandon: () => Promise<void> };

/** TC09 / R8: one active arc. Abandoning keeps it read-only as a past arc (E15). */
export function ActiveArcGate({ arc, onAbandon }: Props) {
  return (
    <EmptyPage
      icon={Flag}
      title="You already have an arc"
      description={`${arc.name} runs ${shortDate(arc.startDate)} to ${shortDate(arc.endDate)}. Finish it, or abandon it to start a new one.`}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/winter-arc/today">Go to Today</Link>
        </Button>
        <AbandonArcDialog label="Abandon and start over" onConfirm={onAbandon} />
      </div>
    </EmptyPage>
  );
}
