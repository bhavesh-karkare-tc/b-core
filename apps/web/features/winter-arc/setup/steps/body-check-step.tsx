"use client";

import type { BodyCheckInput } from "@/data";
import { BodyCheckFields } from "../../body/body-check-fields";

type Props = {
  value: BodyCheckInput | null;
  error: string | null;
  onChange: (value: BodyCheckInput) => void;
};

/** S07 Body check (Day 1 baseline). All optional; photo arrives with sync (R5). */
export function BodyCheckStep({ value, error, onChange }: Props) {
  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">Day 1 body check</h1>
      <p className="text-sm text-text-muted">
        A baseline makes your chapter and Day 92 comparisons possible. Every field is optional.
      </p>
      <BodyCheckFields value={value} onChange={onChange} />
      {error ? (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      ) : null}
    </>
  );
}
