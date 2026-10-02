export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-3 w-32 animate-pulse rounded-full bg-surface-2" />
        <div className="h-9 w-56 animate-pulse rounded-control bg-surface-2" />
      </div>
      <div className="h-48 animate-pulse rounded-card bg-surface" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
