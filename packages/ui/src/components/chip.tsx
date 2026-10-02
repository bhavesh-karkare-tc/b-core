import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@b-core/ui/lib/cn";

export const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border font-mono font-medium tracking-[0.08em] whitespace-nowrap uppercase [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      tone: {
        neutral: "border-line bg-surface-2 text-text-muted",
        accent: "border-accent-1 bg-accent-surface text-accent",
        ember: "border-ember-line bg-ember-surface text-ember-soft",
        positive: "border-line bg-surface-2 text-positive",
        outline: "border-line-strong border-dashed bg-transparent text-text-faint",
      },
      size: {
        sm: "h-6 px-2 text-[10px]",
        md: "h-7 px-2.5 text-[11px]",
      },
    },
    defaultVariants: {
      tone: "neutral",
      size: "md",
    },
  },
);

export type ChipProps = Omit<ComponentProps<"span">, "children"> &
  VariantProps<typeof chipVariants> & {
    /** Glyph shown before the label. Meaning must never rely on colour alone. */
    icon?: ReactNode;
    /** Visible text label (required). */
    children: ReactNode;
  };

/** Small status/category pill: icon + text label, tinted by tone. */
export function Chip({ className, tone, size, icon, children, ...props }: ChipProps) {
  return (
    <span
      data-slot="chip"
      data-tone={tone ?? "neutral"}
      className={cn(chipVariants({ tone, size }), className)}
      {...props}
    >
      {icon ? (
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </span>
  );
}
