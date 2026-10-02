import type { DashboardView } from "@/data";
import { CATEGORY_LABEL } from "../habits/drafts";

type Category = Extract<DashboardView, { kind: "dashboard" }>["categories"][number];

/** Body / Mind / Discipline completion: one hue, thin bars, value at the tip. */
export function CategoryBalance({ categories }: { categories: Category[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {categories.map((c) => {
        const pct = c.completion === null ? null : Math.round(c.completion * 100);
        return (
          <li key={c.category} className="flex flex-col gap-1.5">
            <span className="flex justify-between text-sm">
              {CATEGORY_LABEL[c.category]}
              <span className="font-mono text-text-soft">{pct === null ? "—" : `${pct}%`}</span>
            </span>
            <span className="h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
              <span
                className="block h-full rounded-r-[4px] bg-accent"
                style={{ width: `${pct ?? 0}%` }}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
