"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@b-core/ui/components/sheet";
import { dayLabel } from "../lib/format";
import { useMediaQuery } from "../lib/use-media-query";
import { DayDetailBody } from "./day-detail-body";
import { useDayDetail } from "./use-day-detail";

type Props = {
  date: string | null;
  threshold: number;
  onClose: () => void;
};

/** Day Detail: bottom sheet on mobile, right-hand drawer on web. */
export function DayDetailSheet({ date, threshold, onClose }: Props) {
  const wide = useMediaQuery("(min-width: 64rem)");
  const { state, error, clearError, run } = useDayDetail(date);
  const ready = state.status === "ready" && state.view.day.date === date ? state.view : null;

  return (
    <Sheet open={date !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={wide ? "right" : "bottom"}
        className={wide ? "max-w-lg" : "mx-auto max-h-[92dvh] w-full max-w-xl"}
      >
        <SheetHeader>
          <SheetTitle>{ready ? `Day ${ready.day.dayNumber}` : "Day"}</SheetTitle>
          <SheetDescription className="font-mono tracking-[0.12em] uppercase">
            {date ? dayLabel(date) : ""}
          </SheetDescription>
        </SheetHeader>
        {ready ? (
          <DayDetailBody
            view={ready}
            threshold={threshold}
            run={run}
            error={error}
            onDismissError={clearError}
          />
        ) : state.status === "missing" ? (
          <p className="text-sm text-text-muted">This day hasn&apos;t been reached yet.</p>
        ) : (
          <div className="h-64 animate-pulse rounded-row bg-surface-2" aria-busy="true" />
        )}
      </SheetContent>
    </Sheet>
  );
}
