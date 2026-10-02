import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyPageProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  /** 1 when the block is the whole page (it then carries the page's only h1). */
  level?: 1 | 2;
  children?: ReactNode;
};

/** Empty, error or placeholder block for a screen or section. */
export function EmptyPage({ icon: Icon, title, description, level = 2, children }: EmptyPageProps) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <section className="flex flex-col items-center gap-3 rounded-card border border-dashed border-line-strong px-6 py-14 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-surface-2 text-accent">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <Heading className="text-lg font-bold">{title}</Heading>
      <p className="max-w-sm text-sm text-text-muted">{description}</p>
      {children}
    </section>
  );
}
