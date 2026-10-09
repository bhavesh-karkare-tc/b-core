import { cn } from "@b-core/ui/lib/cn";
import { useId, type ReactNode } from "react";

type PanelProps = {
  title: string;
  action?: ReactNode;
  /** Title inside the card (web, W04) instead of above it (mobile). */
  inset?: boolean;
  className?: string;
  children: ReactNode;
};

/** Titled dashboard section card. */
export function Panel({ title, action, inset = false, className, children }: PanelProps) {
  const id = useId();
  const header = (
    <div className="flex min-h-tap items-center justify-between gap-3">
      <h2 id={id} className="text-lg font-bold">
        {title}
      </h2>
      {action}
    </div>
  );
  if (inset) {
    return (
      <section
        aria-labelledby={id}
        className={cn(
          "flex flex-col gap-3 rounded-card-lg border border-line bg-surface px-5 pt-3 pb-5",
          className,
        )}
      >
        {header}
        <div className="flex-1">{children}</div>
      </section>
    );
  }
  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-2.5", className)}>
      {header}
      <div className="flex-1 rounded-card border border-line bg-surface p-3">{children}</div>
    </section>
  );
}
