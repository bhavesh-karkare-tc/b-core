/** Loading placeholder shaped like Today. */
export function TodaySkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-[18px]">
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-40 animate-pulse rounded-full bg-surface-2" />
          <div className="h-10 w-36 animate-pulse rounded-control bg-surface-2" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded-full bg-surface-2" />
      </div>
      <div className="h-1.5 animate-pulse rounded-full bg-surface-2" />
      <div className="flex flex-col gap-[18px] lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-6">
        <div className="h-[150px] animate-pulse rounded-card-lg bg-surface lg:order-2 lg:h-[420px]" />
        <div className="grid gap-2 lg:grid-cols-2">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-16 animate-pulse rounded-row bg-surface ${i >= 5 ? "hidden lg:block" : ""}`}
            />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading today…</span>
    </div>
  );
}
