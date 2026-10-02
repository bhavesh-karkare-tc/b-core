"use client";

import { Input } from "@b-core/ui/components/input";
import { MY_WHY_MAX } from "@b-core/arc-engine";
import { Field } from "../../habits/field";

type Props = {
  myWhy: string;
  chapterTarget: string;
  error: string | null;
  onChange: (patch: { myWhy?: string; chapterTarget?: string }) => void;
};

/** S06 My Why (required, ≥10 characters, up to 3 lines) and an optional chapter target. */
export function WhyStep({ myWhy, chapterTarget, error, onChange }: Props) {
  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">
        Why are you doing this?
      </h1>
      <p className="text-sm text-text-muted">You&apos;ll see this on hard days. Up to 3 lines.</p>
      <Field
        label="My why"
        htmlFor="my-why"
        error={error ?? undefined}
        hint={`${myWhy.length}/${MY_WHY_MAX}`}
      >
        <textarea
          id="my-why"
          rows={3}
          value={myWhy}
          maxLength={MY_WHY_MAX}
          onChange={(e) => onChange({ myWhy: e.target.value })}
          aria-invalid={!!error}
          placeholder="Finish the year stronger than I started it."
          className="w-full resize-none rounded-control border border-line-strong bg-surface-2 px-3.5 py-3 text-base outline-none placeholder:text-text-faint focus-visible:border-accent aria-invalid:border-ember"
        />
      </Field>
      <Field label="First chapter target (optional)" htmlFor="chapter-target">
        <Input
          id="chapter-target"
          value={chapterTarget}
          maxLength={80}
          placeholder="e.g. No missed water days in October"
          onChange={(e) => onChange({ chapterTarget: e.target.value })}
        />
      </Field>
    </>
  );
}
