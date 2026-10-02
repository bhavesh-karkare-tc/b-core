import { Lock } from "lucide-react";
import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  locked?: boolean;
  children: ReactNode;
};

/** Labelled form field with error, hint and a "Locked after Day 3" note. */
export function Field({ label, htmlFor, error, hint, locked, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase"
      >
        {label}
        {locked ? (
          <span className="flex items-center gap-1 tracking-normal normal-case">
            <Lock className="size-3" aria-hidden="true" />
            Locked after Day 3
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-ember">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
