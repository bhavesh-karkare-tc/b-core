import { cn } from "@b-core/ui/lib/cn";
import type { ChapterView } from "@/data";

/** One bar per chapter, sized by its days; the current chapter fills as days pass. */
export function ChapterProgress({
  chapters,
  current,
}: {
  chapters: ChapterView[];
  current: number;
}) {
  const columns = chapters.map((c) => `${c.days}fr`).join(" ");
  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid gap-1" style={{ gridTemplateColumns: columns }} aria-hidden="true">
        {chapters.map((c) => (
          <div key={c.index} className="h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full bg-accent" style={{ width: `${(c.elapsed / c.days) * 100}%` }} />
          </div>
        ))}
      </div>
      <ol
        className="grid gap-1 font-mono text-[11px] tracking-wider text-text-muted"
        style={{ gridTemplateColumns: columns }}
      >
        {chapters.map((c) => (
          <li
            key={c.index}
            className={cn(c.index === current && "text-text")}
            aria-current={c.index === current ? "step" : undefined}
          >
            {c.index === current ? `${c.label} · ${c.elapsed}/${c.days}` : c.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
