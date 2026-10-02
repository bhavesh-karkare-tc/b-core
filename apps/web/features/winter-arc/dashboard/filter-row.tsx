"use client";

import { cn } from "@b-core/ui/lib/cn";
import type { DashboardFilter, TrackerChapter } from "@/data";

type Applied = Exclude<DashboardFilter, { kind: "current" }>;

type Props = {
  chapters: TrackerChapter[];
  filter: Applied;
  onChange: (filter: Applied) => void;
};

const same = (a: Applied, b: Applied) =>
  a.kind === b.kind && (a.kind === "arc" || (b.kind === "chapter" && a.index === b.index));

/** Arc / chapter filter: one row above the widgets it scopes (Section B). */
export function FilterRow({ chapters, filter, onChange }: Props) {
  const options: { label: string; value: Applied }[] = [
    { label: "Arc", value: { kind: "arc" } },
    ...chapters.map((c) => ({
      label: c.label,
      value: { kind: "chapter" as const, index: c.index },
    })),
  ];
  return (
    <div
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      role="group"
      aria-label="Show data for"
    >
      {options.map((o) => (
        <button
          key={o.label}
          type="button"
          aria-pressed={same(o.value, filter)}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-tap shrink-0 rounded-full px-4 text-[13px] transition-colors",
            same(o.value, filter)
              ? "bg-text font-bold text-bg"
              : "border border-line-strong text-text-muted hover:text-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
