"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@b-core/ui/components/sheet";
import type { HabitRowView } from "@/data";
import { ChecklistSheetBody } from "./checklist-sheet-body";
import { CountSheetBody } from "./count-sheet-body";
import { StatusSheetBody } from "./status-sheet-body";
import { TimeSheetBody } from "./time-sheet-body";
import type { SheetBodyProps } from "./types";

type HabitSheetProps = {
  row: HabitRowView | null;
  date: string;
  run: SheetBodyProps["run"];
  onClose: () => void;
};

/** Bottom sheet for one habit; the body depends on the habit type (MASTER_DOC §7). */
export function HabitSheet({ row, date, run, onClose }: HabitSheetProps) {
  return (
    <Sheet open={row !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="mx-auto w-full max-w-xl">
        {row ? (
          <>
            <SheetHeader>
              <SheetTitle>{row.habit.name}</SheetTitle>
              <SheetDescription>
                {row.statusLabel} · {row.meta}
              </SheetDescription>
            </SheetHeader>
            <Body key={`${row.habit.id}-${date}`} row={row} date={date} run={run} close={onClose} />
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function Body(props: SheetBodyProps) {
  switch (props.row.habit.type) {
    case "count":
      return <CountSheetBody {...props} />;
    case "time":
      return <TimeSheetBody {...props} />;
    case "checklist":
      return <ChecklistSheetBody {...props} />;
    case "yesno":
    case "session":
      return <StatusSheetBody {...props} />;
  }
}
