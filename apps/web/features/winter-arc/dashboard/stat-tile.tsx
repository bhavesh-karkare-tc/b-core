import { cn } from "@b-core/ui/lib/cn";

type StatTileProps = {
  label: string;
  value: string;
  sub?: string;
  /** Signed change; colour follows direction (up = good), with an arrow so it's not colour-only. */
  delta?: number | null;
  className?: string;
};

export function StatTile({ label, value, sub, delta, className }: StatTileProps) {
  const rounded = delta === null || delta === undefined ? null : Math.round(delta);
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-card border border-line bg-surface p-3.5",
        className,
      )}
    >
      <span className="text-xs text-text-muted">{label}</span>
      <span className="font-mono text-[26px] leading-none font-semibold">{value}</span>
      {rounded !== null && rounded !== 0 ? (
        <span className={cn("text-xs", rounded > 0 ? "text-positive" : "text-ember-soft")}>
          {rounded > 0 ? "▲ +" : "▼ "}
          {rounded} vs last week
        </span>
      ) : sub ? (
        <span className="text-xs text-text-muted">{sub}</span>
      ) : null}
    </div>
  );
}
