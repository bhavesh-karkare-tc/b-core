"use client";

import { cn } from "@b-core/ui/lib/cn";
import type { TrackerChapter } from "@/data";

type Props = { chapters: TrackerChapter[]; current: number; onSelect: (index: number) => void };

/** Chapter switch (one pill per calendar month in the arc). */
export function ChapterPills({ chapters, current, onSelect }: Props) {
  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      role="group"
      aria-label="Chapter"
    >
      {chapters.map((c) => (
        <button
          key={c.index}
          type="button"
          aria-pressed={c.index === current}
          onClick={() => onSelect(c.index)}
          className={cn(
            "h-tap shrink-0 rounded-full px-4 text-[13px] transition-colors",
            c.index === current
              ? "bg-text font-bold text-bg"
              : "border border-line-strong text-text-muted hover:text-text",
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
