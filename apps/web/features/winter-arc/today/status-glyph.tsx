import { Check, Contrast, Moon, Plus, Thermometer, X } from "lucide-react";
import type { EntryStatus } from "@/data";

const ICONS = {
  done: Check,
  minimum: Contrast,
  missed: X,
  rest: Moon,
  sick: Thermometer,
  unlogged: Plus,
} satisfies Record<EntryStatus, unknown>;

/** Icon for a habit status. Always paired with a text label elsewhere (never colour only). */
export function StatusGlyph({ status, className }: { status: EntryStatus; className?: string }) {
  const Icon = ICONS[status];
  return <Icon aria-hidden="true" className={className} />;
}
