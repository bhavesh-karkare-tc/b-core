"use client";

import { cn } from "@b-core/ui/lib/cn";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
};

/** On/off switch (role="switch"), 44 px target, state also shown as On/Off text. */
export function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-tap shrink-0 items-center gap-2 rounded-control px-1 disabled:opacity-40"
    >
      <span
        className="w-6 text-right font-mono text-[11px] text-text-muted uppercase"
        aria-hidden="true"
      >
        {checked ? "On" : "Off"}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 rounded-full border transition-colors",
          checked ? "border-accent bg-accent-2" : "border-line-strong bg-surface-2",
        )}
        aria-hidden="true"
      >
        <span
          className={cn(
            "absolute top-0.5 size-[18px] rounded-full transition-transform",
            checked ? "translate-x-[22px] bg-accent" : "translate-x-0.5 bg-text-faint",
          )}
        />
      </span>
    </button>
  );
}
