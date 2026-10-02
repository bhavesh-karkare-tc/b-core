"use client";

import { Button } from "@b-core/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@b-core/ui/components/dialog";

const POINTS = [
  ["Done", "10"],
  ["Minimum", "5"],
  ["Rest (day off)", "10"],
  ["Missed", "0"],
  ["Sick", "not counted"],
] as const;

/** "How scoring works" (setup intro). */
export function ScoringDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" block>
          How scoring works
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How scoring works</DialogTitle>
          <DialogDescription>
            Every habit earns points each day. Your day scores out of 100.
          </DialogDescription>
        </DialogHeader>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {POINTS.map(([status, pts]) => (
            <div key={status} className="contents">
              <dt className="text-text-muted">{status}</dt>
              <dd className="text-right font-mono">{pts}</dd>
            </div>
          ))}
        </dl>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-text-muted">
          <li>A day at 80 or more is a strong day and grows your streak.</li>
          <li>One weak day puts the streak at risk. Two in a row break it.</li>
          <li>
            Every 7 strong days in a row earn a shield (hold up to 2). A shield saves a second weak
            day.
          </li>
          <li>Yesterday stays editable until noon today. Then unlogged habits count as Missed.</li>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
