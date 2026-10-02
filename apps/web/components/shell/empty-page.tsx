import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyPageProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
};

/** Placeholder block for screens that are not built yet or have no data. */
export function EmptyPage({ icon: Icon, title, description, children }: EmptyPageProps) {
  return (
    <section className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-accent">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="max-w-sm text-sm text-text-muted">{description}</p>
      {children}
    </section>
  );
}
