const R = 52;
const CIRCUMFERENCE = 2 * Math.PI * R;

/** Today's score out of 100 as a ring. Null (sick day) shows a dash. */
export function ScoreRing({
  score,
  provisional,
  compact = false,
}: {
  score: number | null;
  provisional: boolean;
  /** Small ring without the caption (Day Detail drawer, W05). */
  compact?: boolean;
}) {
  const filled = ((score ?? 0) / 100) * CIRCUMFERENCE;
  if (compact) {
    return (
      <div className="relative size-20 shrink-0">
        <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="12" className="stroke-line" />
          {filled > 0 ? (
            <circle
              cx="60"
              cy="60"
              r={R}
              fill="none"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
              transform="rotate(-90 60 60)"
              className="stroke-accent"
            />
          ) : null}
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-2xl font-semibold">
          {score ?? "—"}
        </span>
      </div>
    );
  }
  return (
    <div className="relative size-[116px] shrink-0">
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <circle cx="60" cy="60" r={R} fill="none" strokeWidth="10" className="stroke-line" />
        {filled > 0 ? (
          <circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRCUMFERENCE}`}
            transform="rotate(-90 60 60)"
            className="stroke-accent transition-[stroke-dasharray] duration-300"
          />
        ) : null}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-[32px] leading-none font-semibold">{score ?? "—"}</span>
        <span className="text-xs text-text-muted">
          {score === null ? "not counted" : provisional ? "of 100 so far" : "of 100"}
        </span>
      </div>
    </div>
  );
}
