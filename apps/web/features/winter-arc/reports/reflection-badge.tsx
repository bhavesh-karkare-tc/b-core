import { cn } from "@b-core/ui/lib/cn";
import { Check, Clock, PencilLine } from "lucide-react";
import type { ReflectionState } from "@/data";

const COPY = {
  done: { icon: Check, label: "Reflected", tone: "text-accent" },
  empty: { icon: PencilLine, label: "Add reflection", tone: "text-text-muted" },
  pending: { icon: Clock, label: "Reflection pending", tone: "text-ember-soft" },
} as const;

/** Reflection status: icon + label (never colour alone). */
export function ReflectionBadge({
  state,
  readOnly,
}: {
  state: ReflectionState;
  readOnly?: boolean;
}) {
  if (readOnly && state !== "done") return null;
  const { icon: Icon, label, tone } = COPY[state];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", tone)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
