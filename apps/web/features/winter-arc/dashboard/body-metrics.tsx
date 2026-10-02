"use client";

import { Button } from "@b-core/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@b-core/ui/components/dialog";
import { Plus } from "lucide-react";
import { useState } from "react";
import { bodyCheckInputSchema, saveBodyCheck, type BodyCheck, type BodyCheckInput } from "@/data";
import { BodyCheckFields, hasBodyCheckValues } from "../body/body-check-fields";
import { notifyDataChanged } from "../lib/data-events";
import { shortDate } from "../lib/format";

const ROWS = [
  { key: "weightKg", label: "Weight", unit: "kg" },
  { key: "waistCm", label: "Waist", unit: "cm" },
  { key: "pushupsMax", label: "Push-ups", unit: "" },
  { key: "energy", label: "Energy", unit: "/10" },
] as const;

/** Body metrics at each check, with change since the first (MASTER_DOC §10) and "Add check". */
export function BodyMetrics({ checks }: { checks: BodyCheck[] }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<BodyCheckInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const first = checks[0];
  const last = checks.at(-1);

  async function save() {
    const parsed = value ? bodyCheckInputSchema.safeParse(value) : null;
    if (!parsed?.success || !hasBodyCheckValues(value)) {
      setError("Add at least one value in range.");
      return;
    }
    await saveBodyCheck(parsed.data);
    setOpen(false);
    setValue(null);
    notifyDataChanged();
  }

  return (
    <div className="flex flex-col gap-3">
      {first && last ? (
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Body metrics, first and latest check</caption>
          <thead className="font-mono text-[11px] text-text-faint uppercase">
            <tr>
              <th className="py-1 font-normal">Metric</th>
              <th className="py-1 text-right font-normal">{shortDate(first.date)}</th>
              {checks.length > 1 ? (
                <th className="py-1 text-right font-normal">{shortDate(last.date)}</th>
              ) : null}
              {checks.length > 1 ? <th className="py-1 text-right font-normal">Change</th> : null}
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {ROWS.map((r) => {
              const a = first[r.key];
              const b = last[r.key];
              const delta = a !== null && b !== null ? Math.round((b - a) * 10) / 10 : null;
              return (
                <tr key={r.key} className="border-t border-line">
                  <td className="py-2 font-sans">{r.label}</td>
                  <td className="py-2 text-right">{a === null ? "—" : `${a}${r.unit}`}</td>
                  {checks.length > 1 ? (
                    <td className="py-2 text-right">{b === null ? "—" : `${b}${r.unit}`}</td>
                  ) : null}
                  {checks.length > 1 ? (
                    <td className="py-2 text-right text-text-muted">
                      {delta === null || delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${delta}`}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-sm text-text-muted">
          No body checks yet. A baseline makes your Day 92 comparison possible.
        </p>
      )}
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          setError(null);
        }}
      >
        <DialogTrigger asChild>
          <Button variant="secondary" className="self-start">
            <Plus aria-hidden="true" />
            Add check
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Body check</DialogTitle>
            <DialogDescription>Saved for today. Every field is optional.</DialogDescription>
          </DialogHeader>
          <BodyCheckFields value={value} onChange={setValue} />
          {error ? (
            <p role="alert" className="text-sm text-ember">
              {error}
            </p>
          ) : null}
          <Button block size="lg" onClick={() => void save()}>
            Save check
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
