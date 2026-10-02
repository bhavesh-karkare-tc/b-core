import type { ReactNode } from "react";

type PageHeaderProps = {
  /** Small mono caps line above the title, e.g. "WINTER ARC · DAY 23 OF 92". */
  eyebrow?: string;
  title: string;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1.5">
        {eyebrow ? (
          <p className="font-mono text-xs tracking-[0.18em] text-accent uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="text-[32px] leading-none font-extrabold tracking-tight lg:text-4xl">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </header>
  );
}
