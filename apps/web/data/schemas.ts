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
