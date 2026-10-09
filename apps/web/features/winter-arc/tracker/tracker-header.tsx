import type { TrackerView } from "@/data";

type Props = { view: Extract<TrackerView, { kind: "tracker" }> };

const fmt = new Intl.NumberFormat("en-US");

export function TrackerHeader({ view }: Props) {
  const { chapter, totals } = view;
  return (
    <header className="flex items-end justify-between gap-3">
      <div className="flex flex-col gap-1">
        <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">
          Chapter {chapter.index} · {chapter.label}
        </p>
        <h1 className="text-[32px] leading-none font-extrabold tracking-tight">
          Tracker
          <span className="hidden lg:inline">
            {" "}
            · {chapter.label} {chapter.startDate.slice(0, 4)}
          </span>
        </h1>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="font-mono text-lg font-semibold">{fmt.format(totals.total)}</span>
        <span className="text-xs text-text-muted">
          {totals.maxSoFar > 0
            ? `of ${fmt.format(totals.maxSoFar)} so far`
            : `of ${fmt.format(totals.max)} max`}
        </span>
      </div>
    </header>
  );
}
