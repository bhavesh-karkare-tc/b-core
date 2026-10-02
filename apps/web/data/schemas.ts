import { JOURNAL_MAX } from "@b-core/arc-engine";
import { z } from "zod";

/** Close the day form (MASTER_DOC §7): journal ≤ 140 characters, mood 1–5. */
export const closeDayInputSchema = z.object({
  journal: z
    .string()
    .trim()
    .max(JOURNAL_MAX, `Keep it under ${JOURNAL_MAX} characters`)
    .transform((s) => (s === "" ? null : s))
    .nullable(),
  mood: z.number().int().min(1).max(5).nullable(),
});

export const habitValuePatchSchema = z.object({
  value: z.number().int().min(0).max(1_000_000).nullable().optional(),
  loggedTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm")
    .nullable()
    .optional(),
  durationMin: z.number().int().min(0).max(600).nullable().optional(),
  note: z.string().trim().max(140).nullable().optional(),
});

export const checklistItemPatchSchema = z.object({
  text: z.string().trim().max(60).optional(),
  done: z.boolean().optional(),
});

const optionalNumber = (min: number, max: number, int = false) =>
  (int ? z.number().int() : z.number()).min(min).max(max).nullable();

/** Body check (MASTER_DOC §6 step 7): all optional. */
export const bodyCheckInputSchema = z.object({
  weightKg: optionalNumber(20, 400),
  waistCm: optionalNumber(30, 250),
  pushupsMax: optionalNumber(0, 500, true),
  energy: optionalNumber(1, 10, true),
});

/** Commitment signature: the typed name (or "I commit" when held). */
export const commitNameSchema = z.string().trim().min(1, "Type your name to commit").max(60);
