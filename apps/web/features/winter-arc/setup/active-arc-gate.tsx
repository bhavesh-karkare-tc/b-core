"use client";

import { Button } from "@b-core/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@b-core/ui/components/dialog";
import { Flag } from "lucide-react";
import Link from "next/link";
import { EmptyPage } from "@/components/shell/empty-page";
import type { ArcSummary } from "@/data";
import { shortDate } from "../lib/format";

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
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ember">Abandon and start over</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Abandon this arc?</DialogTitle>
              <DialogDescription>
                Your logs and reports so far are kept as a read-only past arc. There will be no
                final arc report, and the streak ends here. This can&apos;t be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary">Keep my arc</Button>
              </DialogClose>
              <Button variant="ember" onClick={() => void onAbandon()}>
                Abandon arc
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EmptyPage>
  );
}
