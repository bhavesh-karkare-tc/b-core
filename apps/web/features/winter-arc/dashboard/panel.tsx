import { cn } from "@b-core/ui/lib/cn";
import { useId, type ReactNode } from "react";

type PanelProps = { title: string; action?: ReactNode; className?: string; children: ReactNode };

/** Titled dashboard section card. */
export function Panel({ title, action, className, children }: PanelProps) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={cn("flex flex-col gap-2.5", className)}>
      <div className="flex min-h-tap items-center justify-between gap-3">
        <h2 id={id} className="text-lg font-bold">
          {title}
        </h2>
        {action}
      </div>
      <div className="flex-1 rounded-card border border-line bg-surface p-3">{children}</div>
    </section>
  );
}
