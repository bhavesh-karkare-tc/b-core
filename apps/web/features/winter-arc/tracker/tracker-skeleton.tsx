export function TrackerSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3.5">
      <div className="flex justify-between">
        <div className="h-12 w-40 animate-pulse rounded-control bg-surface-2" />
        <div className="h-10 w-24 animate-pulse rounded-control bg-surface-2" />
      </div>
      <div className="h-11 w-72 animate-pulse rounded-full bg-surface-2" />
      <div className="h-[640px] animate-pulse rounded-card bg-surface" />
      <span className="sr-only">Loading tracker…</span>
    </div>
  );
}
