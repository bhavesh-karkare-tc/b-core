"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@b-core/ui/lib/cn";

export const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-control text-sm font-semibold whitespace-nowrap transition-colors outline-none disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-transparent text-text-muted hover:bg-surface-2 hover:text-text data-[state=on]:bg-accent-surface data-[state=on]:text-accent",
        outline:
          "border border-line-strong bg-transparent text-text-muted hover:text-text data-[state=on]:border-accent data-[state=on]:bg-accent-surface data-[state=on]:text-accent",
      },
      size: {
        default: "h-tap min-w-tap px-3",
        lg: "h-12 min-w-12 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function Toggle({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}
