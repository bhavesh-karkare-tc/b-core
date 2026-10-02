"use client";

import { ImageOff } from "lucide-react";
import type { BodyCheckInput } from "@/data";
import { Field } from "../../habits/field";
import { NumberInput } from "../../habits/number-input";
import { Segmented } from "../../habits/segmented";

type Props = {
  value: BodyCheckInput | null;
  error: string | null;
  onChange: (value: BodyCheckInput) => void;
};

export const EMPTY_BODY_CHECK: BodyCheckInput = {
  weightKg: null,
  waistCm: null,
  pushupsMax: null,
  energy: null,
};

const ENERGY = Array.from({ length: 10 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));

/** S07 Body check (Day 1 baseline). All optional; photo arrives with sync (R5). */
export function BodyCheckStep({ value, error, onChange }: Props) {
  const v = value ?? EMPTY_BODY_CHECK;
  const set = (patch: Partial<BodyCheckInput>) => onChange({ ...v, ...patch });
  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">Day 1 body check</h1>
      <p className="text-sm text-text-muted">
        A baseline makes your chapter and Day 92 comparisons possible. Every field is optional.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight (kg)" htmlFor="bc-weight">
          <NumberInput
            id="bc-weight"
            decimals
            value={v.weightKg}
            onValueChange={(weightKg) => set({ weightKg })}
          />
        </Field>
        <Field label="Waist (cm)" htmlFor="bc-waist">
          <NumberInput
            id="bc-waist"
            decimals
            value={v.waistCm}
            onValueChange={(waistCm) => set({ waistCm })}
          />
        </Field>
        <Field label="Max push-ups" htmlFor="bc-pushups">
          <NumberInput
            id="bc-pushups"
            value={v.pushupsMax}
            onValueChange={(pushupsMax) => set({ pushupsMax })}
          />
        </Field>
      </div>
      <Field label={`Energy ${v.energy ?? "–"} / 10`}>
        <Segmented
          label="Energy from 1 to 10"
          options={ENERGY}
          value={v.energy ?? 0}
          columns={5}
          onChange={(energy) => set({ energy: v.energy === energy ? null : energy })}
        />
      </Field>
      <div className="flex items-center gap-3 rounded-row border border-dashed border-line-strong p-3 text-sm text-text-faint">
        <ImageOff className="size-5" aria-hidden="true" />
        Progress photo · arrives with sync
      </div>
      {error ? (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      ) : null}
    </>
  );
}

export function hasBodyCheckValues(v: BodyCheckInput | null): boolean {
  return !!v && Object.values(v).some((x) => x !== null);
}
