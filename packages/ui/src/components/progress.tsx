"use client";

import { Progress as ProgressPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@b-core/ui/lib/cn";

export type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root> & {
  tone?: "accent" | "ember";
};

/** Thin progress bar. `value` is 0–100. */
export function Progress({ className, value, tone = "accent", ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, value ?? 0));

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={pct}
      className={cn("relative h-1.5 w-full overflow-hidden rounded-full bg-line", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 rounded-full transition-transform duration-300",
          tone === "ember" ? "bg-ember" : "bg-accent",
        )}
        style={{ transform: `translateX(-${100 - pct}%)` }}
      />
    </ProgressPrimitive.Root>
  );
}
