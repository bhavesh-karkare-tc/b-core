"use client";

import { cn } from "@b-core/ui/lib/cn";
import { Check } from "lucide-react";
import type { SetupContext, TemplateId } from "@/data";

type Props = {
  ctx: SetupContext;
  value: TemplateId | null;
  edited: boolean;
  onChange: (template: TemplateId) => void;
};

/** S02 Choose template: Winter Arc default (preselected), Blank, or copy the previous arc. */
export function TemplateStep({ ctx, value, edited, onChange }: Props) {
  const previous = ctx.pastArcs[0];
  const options: { id: TemplateId; title: string; body: string; available: boolean }[] = [
    {
      id: "default",
      title: "Winter Arc default",
      body: ctx.templates.default.map((h) => h.name).join(" · "),
      available: true,
    },
    {
      id: "blank",
      title: "Blank",
      body: "Start from zero and add 3 to 10 habits.",
      available: true,
    },
    {
      id: "previous",
      title: "Copy from previous arc",
      body: previous
        ? `${previous.habitCount} habits from your arc that started ${previous.startDate}.`
        : "",
      available: ctx.templates.previous !== null,
    },
  ];

  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">Choose a template</h1>
      <div role="radiogroup" aria-label="Template" className="flex flex-col gap-2">
        {options
          .filter((o) => o.available)
          .map((o) => {
            const selected = value === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(o.id)}
                className={cn(
                  "flex items-start gap-3 rounded-card border p-4 text-left transition-colors",
                  selected
                    ? "border-accent bg-accent-surface"
                    : "border-line bg-surface hover:border-line-strong",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border",
                    selected ? "border-accent bg-accent text-on-accent" : "border-line-strong",
                  )}
                  aria-hidden="true"
                >
                  {selected ? <Check className="size-3.5" /> : null}
                </span>
                <span className="flex flex-col gap-1">
                  <span className="font-bold">{o.title}</span>
                  <span className="text-sm text-text-muted">{o.body}</span>
                </span>
              </button>
            );
          })}
      </div>
      {edited ? (
        <p className="text-sm text-text-muted">Switching template replaces your habit list.</p>
      ) : null}
    </>
  );
}
