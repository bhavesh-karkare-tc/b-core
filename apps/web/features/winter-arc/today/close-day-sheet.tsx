"use client";

import { Button } from "@b-core/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@b-core/ui/components/sheet";
import { useState } from "react";
import type { DayView } from "@/data";
import { CloseDayForm } from "./close-day-form";

type CloseDaySheetProps = {
  day: DayView;
  run: (mutation: () => Promise<unknown>) => Promise<void>;
};

/** Mobile: sticky "Close the day" button opening a bottom sheet. */
export function CloseDaySheet({ day, run }: CloseDaySheetProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="sticky bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-10 -mx-4 bg-bg/95 px-4 pt-2.5 pb-2.5 backdrop-blur">
        <Button
          size="lg"
          block
          className="h-[52px] rounded-row bg-text text-bg hover:bg-text-soft"
          onClick={() => setOpen(true)}
        >
          {day.closedAt ? "Day closed · edit" : "Close the day"}
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="mx-auto w-full max-w-xl">
          {/* Content unmounts on close, so the form re-reads the day each time it opens. */}
          <CloseDayForm
            day={day}
            run={run}
            onDone={() => setOpen(false)}
            heading={(saved) => (
              <SheetHeader>
                <SheetTitle>{saved ? "Day closed" : "Close the day"}</SheetTitle>
                <SheetDescription>
                  Closing doesn&apos;t lock the day. Logs stay open until noon tomorrow.
                </SheetDescription>
              </SheetHeader>
            )}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
