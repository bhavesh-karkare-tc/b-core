import type { ComponentProps } from "react";
import { cn } from "@b-core/ui/lib/cn";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-tap w-full min-w-0 rounded-control border border-line-strong bg-surface-2 px-3.5 text-base text-text transition-colors outline-none placeholder:text-text-faint",
        "focus-visible:border-accent focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-ember",
        "file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-text",
        className,
      )}
      {...props}
    />
  );
}
