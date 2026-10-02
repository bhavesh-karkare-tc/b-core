import { cn } from "@b-core/ui/lib/cn";
import type { EntryStatus } from "@/data";
import { StatusGlyph } from "../status-glyph";

type StatusOptionProps = {
  status: EntryStatus;
  label: string;
  hint?: string | null;
  selected: boolean;
  onSelect: () => void;
};

/** Large selectable status row: glyph + label + optional hint. */
export function StatusOption({ status, label, hint, selected, onSelect }: StatusOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex min-h-14 items-center gap-3 rounded-row border px-4 text-left transition-colors",
        selected
          ? "border-accent bg-accent-surface"
          : "border-line bg-surface-2 hover:border-line-strong",
      )}
    >
      <StatusGlyph
        status={status}
        className={cn("size-5", status === "missed" ? "text-ember" : "text-accent")}
      />
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold">{label}</span>
        {hint ? <span className="text-xs text-text-muted">{hint}</span> : null}
      </span>
    </button>
  );
}
