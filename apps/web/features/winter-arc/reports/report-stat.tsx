import type { ReactNode } from "react";

export function ReportStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-card border border-line bg-surface p-3.5">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="font-mono text-2xl leading-none font-semibold">{value}</span>
      {sub ? <span className="text-xs text-text-muted">{sub}</span> : null}
    </div>
  );
}
