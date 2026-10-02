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
import { Thermometer } from "lucide-react";
import { useState } from "react";
import { markSickDay, type DayView } from "@/data";

type SickDayButtonProps = {
  day: DayView;
  sickDaysLeft: number;
  run: (mutation: () => Promise<unknown>) => Promise<void>;
};

/** Use a sick day (MASTER_DOC §7). Hidden with an explanation once none are left (E9). */
export function SickDayButton({ day, sickDaysLeft, run }: SickDayButtonProps) {
  const [open, setOpen] = useState(false);
  if (day.isSick) return null;

  if (!day.sickDay.allowed) {
    if (day.sickDay.reason !== "no_days_left") return null;
    return (
      <p className="text-center text-xs text-text-faint">
        No sick days left. You get 1 per 30 days of the arc.
      </p>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="self-center text-text-muted">
          <Thermometer aria-hidden="true" />
          Sick today? Use a sick day ({sickDaysLeft} left)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use a sick day?</DialogTitle>
          <DialogDescription>
            Every habit today becomes Sick. The score isn&apos;t counted and your streak is frozen —
            it won&apos;t grow or break. This can&apos;t be undone. {sickDaysLeft - 1} will be left.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={() => void run(() => markSickDay(day.date)).then(() => setOpen(false))}>
            Use sick day
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
