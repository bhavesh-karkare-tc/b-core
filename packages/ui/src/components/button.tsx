import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@b-core/ui/lib/cn";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-control text-sm font-semibold whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-ember [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent hover:bg-accent-hover",
        secondary: "border border-line-strong bg-surface-2 text-text hover:border-text-faint",
        outline: "border border-line-strong bg-transparent text-text hover:bg-surface-2",
        ghost: "bg-transparent text-text-muted hover:bg-surface-2 hover:text-text",
        ember:
          "border border-ember-line bg-ember-surface-2 text-ember-soft hover:border-ember hover:text-ember",
        link: "h-auto min-h-tap px-0 text-accent underline-offset-4 hover:text-accent-hover hover:underline",
      },
      size: {
        default: "h-tap px-4",
        lg: "h-12 px-6 text-base",
        icon: "size-tap",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (e.g. a link) with button styles. */
    asChild?: boolean;
  };

export function Button({
  className,
  variant = "primary",
  size = "default",
  block,
  asChild = false,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      type={asChild ? type : (type ?? "button")}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  );
}
