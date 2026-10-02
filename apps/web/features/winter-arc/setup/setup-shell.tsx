"use client";

import { Button } from "@b-core/ui/components/button";
import { cn } from "@b-core/ui/lib/cn";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { STEP_COUNT, STEPS } from "./setup-draft";

type SetupShellProps = {
  step: number;
  onBack?: () => void;
  primary: { label: string; onClick: () => void; disabled?: boolean };
  /** Shown above the primary button when the step can't continue. */
  issue?: string | null;
  children: ReactNode;
};

/** Full-screen setup frame: back, progress, content, sticky primary action. */
export function SetupShell({ step, onBack, primary, issue, children }: SetupShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center gap-2 pb-4">
        {onBack ? (
          <Button variant="ghost" size="icon" aria-label="Back" onClick={onBack}>
            <ArrowLeft />
          </Button>
        ) : (
          <span className="size-tap" aria-hidden="true" />
        )}
        <div className="flex flex-1 flex-col gap-1.5">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${STEP_COUNT}, 1fr)` }}
            aria-hidden="true"
          >
            {STEPS.map((name, i) => (
              <span
                key={name}
                className={cn("h-1 rounded-full", i < step ? "bg-accent" : "bg-line")}
              />
            ))}
          </div>
          <p className="font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase">
            Step {step} of {STEP_COUNT} · {STEPS[step - 1]}
          </p>
        </div>
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label="Exit setup (your progress is saved)"
        >
          <Link href="/">
            <X />
          </Link>
        </Button>
      </header>
      <div className="flex flex-1 flex-col gap-5 pb-6">{children}</div>
      <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-line bg-bg/95 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6">
        {issue ? (
          <p role="alert" className="text-center text-sm text-ember">
            {issue}
          </p>
        ) : null}
        <Button size="lg" block onClick={primary.onClick} disabled={primary.disabled}>
          {primary.label}
        </Button>
      </div>
    </div>
  );
}
