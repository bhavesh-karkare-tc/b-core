"use client";

import { Button } from "@b-core/ui/components/button";
import { Input } from "@b-core/ui/components/input";
import { useState } from "react";
import { Field } from "../habits/field";

type FieldDef<K extends string> = { key: K; label: string; placeholder: string };

type Props<K extends string> = {
  fields: readonly FieldDef<K>[];
  value: Record<K, string> | null;
  readOnly: boolean;
  onSave: (value: Record<K, string>) => Promise<string | null>;
  /** Fields side by side (web weekly summary, W06). */
  columns?: boolean;
};

/** One-line reflections. Shows saved answers with Edit; read-only for past arcs. */
export function ReflectionForm<K extends string>({
  fields,
  value,
  readOnly,
  onSave,
  columns = false,
}: Props<K>) {
  const empty = Object.fromEntries(fields.map((f) => [f.key, ""])) as Record<K, string>;
  const [editing, setEditing] = useState(value === null && !readOnly);
  const [draft, setDraft] = useState<Record<K, string>>(value ?? empty);
  const [error, setError] = useState<string | null>(null);
  // What was just saved here wins over the value loaded with the page.
  const [saved, setSaved] = useState<Record<K, string> | null>(null);
  const shown = saved ?? value;

  if (!editing) {
    if (!shown) return <p className="text-sm text-text-muted">No reflection was written.</p>;
    return (
      <div className="flex flex-col gap-3">
        <dl className={columns ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3"}>
          {fields.map((f) => (
            <div key={f.key} className="flex flex-col gap-0.5">
              <dt className="font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase">
                {f.label}
              </dt>
              <dd className="text-[15px]">{shown[f.key] || "—"}</dd>
            </div>
          ))}
        </dl>
        {!readOnly ? (
          <Button variant="secondary" className="self-start" onClick={() => setEditing(true)}>
            Edit reflection
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        void onSave(draft).then((err) => {
          setError(err);
          if (!err) {
            setSaved(draft);
            setEditing(false);
          }
        });
      }}
    >
      <div className={columns ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3"}>
        {fields.map((f) => (
          <Field
            key={f.key}
            label={f.label}
            htmlFor={`reflect-${f.key}`}
            hint={`${draft[f.key].length}/140`}
          >
            <Input
              id={`reflect-${f.key}`}
              value={draft[f.key]}
              maxLength={140}
              placeholder={f.placeholder}
              onChange={(e) => setDraft({ ...draft, [f.key]: e.target.value })}
            />
          </Field>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-ember">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="self-start">
        Save reflection
      </Button>
    </form>
  );
}
