"use client";

import { Button } from "@b-core/ui/components/button";
import { bodyCheckDelta } from "@b-core/arc-engine";
import { Scale } from "lucide-react";
import { useState } from "react";
import {
  bodyCheckInputSchema,
  DataError,
  saveReportBodyCheck,
  type BodyCheck,
  type BodyCheckInput,
} from "@/data";
import { BodyCheckFields, hasBodyCheckValues } from "../body/body-check-fields";
import { shortDate } from "../lib/format";

const ROWS = [
  { key: "weightKg", label: "Weight", unit: " kg" },
  { key: "waistCm", label: "Waist", unit: " cm" },
  { key: "pushupsMax", label: "Push-ups", unit: "" },
  { key: "energy", label: "Energy", unit: "/10" },
] as const;

type Props = {
  reportId: string;
  start: BodyCheck | null;
  end: BodyCheck | null;
  readOnly: boolean;
  onSaved: () => Promise<void>;
};

/** Body check delta for the chapter; prompts for the end check when missing (TC48). */
export function BodyCheckReview({ reportId, start, end, readOnly, onSaved }: Props) {
  const [value, setValue] = useState<BodyCheckInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const delta = bodyCheckDelta(start, end);

  async function save() {
    const parsed = value ? bodyCheckInputSchema.safeParse(value) : null;
    if (!parsed?.success || !hasBodyCheckValues(value)) {
      setError("Add at least one value in range.");
      return;
    }
    try {
      await saveReportBodyCheck(reportId, parsed.data);
      await onSaved();
    } catch (e) {
      setError(e instanceof DataError ? e.message : "Could not save. Try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">Body check: start and end of chapter</caption>
        <thead className="font-mono text-[11px] text-text-faint uppercase">
          <tr>
            <th className="py-1 font-normal">Metric</th>
            <th className="py-1 text-right font-normal">
              {start ? shortDate(start.date) : "Start"}
            </th>
            <th className="py-1 text-right font-normal">{end ? shortDate(end.date) : "End"}</th>
            <th className="py-1 text-right font-normal">Change</th>
          </tr>
        </thead>
        <tbody className="font-mono tabular-nums">
          {ROWS.map((r) => {
            const a = start?.[r.key] ?? null;
            const b = end?.[r.key] ?? null;
            const d = delta[r.key];
            return (
              <tr key={r.key} className="border-t border-line">
                <td className="py-2 font-sans">{r.label}</td>
                <td className="py-2 text-right">{a === null ? "Not logged" : `${a}${r.unit}`}</td>
                <td className="py-2 text-right">{b === null ? "Not logged" : `${b}${r.unit}`}</td>
                <td className="py-2 text-right text-text-muted">
                  {d === null ? "—" : `${d > 0 ? "+" : ""}${d}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {!end && !readOnly ? (
        <div className="flex flex-col gap-3 rounded-row border border-accent-1 bg-accent-surface p-4">
          <p className="flex items-center gap-2 font-semibold text-accent">
            <Scale className="size-4" aria-hidden="true" />
            End-of-chapter body check
          </p>
          <p className="text-sm text-text-soft">
            Log where you finished this chapter. Skip it and the change shows as &quot;Not
            logged&quot;.
          </p>
          <BodyCheckFields value={value} onChange={setValue} />
          {error ? (
            <p role="alert" className="text-sm text-ember">
              {error}
            </p>
          ) : null}
          <Button className="self-start" onClick={() => void save()}>
            Save body check
          </Button>
        </div>
      ) : null}
    </div>
  );
}
