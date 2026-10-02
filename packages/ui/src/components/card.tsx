import type { ComponentProps } from "react";
import { cn } from "@b-core/ui/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-4 rounded-card border border-line bg-surface p-5 text-text",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-start justify-between gap-3", className)}
      {...props}
    />
  );
}

/** Small caps mono label, e.g. "THIS WEEK". */
export function CardLabel({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-label"
      className={cn(
        "font-mono text-[11px] font-medium tracking-[0.12em] text-text-faint uppercase",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("text-base leading-tight font-bold", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-sm text-text-muted", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card-content" className={cn("flex flex-col gap-3", className)} {...props} />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card-footer" className={cn("flex items-center gap-3", className)} {...props} />
  );
}
