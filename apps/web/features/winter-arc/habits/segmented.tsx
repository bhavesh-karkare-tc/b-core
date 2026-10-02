"use client";

import { cn } from "@b-core/ui/lib/cn";

type SegmentedProps<T extends string | number> = {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
  columns?: number;
};

/** Single-choice button group (radio semantics), 44px targets. */
export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
  columns,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid gap-1.5"
      style={{ gridTemplateColumns: `repeat(${columns ?? options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          disabled={disabled}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-tap rounded-control border px-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            o.value === value
              ? "border-accent bg-accent-surface text-accent"
              : "border-line-strong bg-surface-2 text-text-muted hover:text-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
