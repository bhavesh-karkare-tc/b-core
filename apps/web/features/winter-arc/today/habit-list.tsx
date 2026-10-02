import Link from "next/link";
import type { HabitRowView } from "@/data";
import { HabitRow } from "./habit-row";

type HabitListProps = {
  rows: HabitRowView[];
  title?: string;
  onOpen?: (row: HabitRowView) => void;
  onQuickAction?: (row: HabitRowView) => void;
};

export function HabitList({
  rows,
  title = "Today's habits",
  onOpen,
  onQuickAction,
}: HabitListProps) {
  return (
    <section aria-labelledby="todays-habits" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id="todays-habits" className="text-lg font-bold">
          {title}
        </h2>
        <Link
          href="/winter-arc/settings"
          className="inline-flex min-h-tap items-center text-[13px] text-accent"
        >
          Edit
        </Link>
      </div>
      <ul className="flex flex-col gap-2">
        {rows.map((row) => (
          <HabitRow key={row.habit.id} row={row} onOpen={onOpen} onQuickAction={onQuickAction} />
        ))}
      </ul>
    </section>
  );
}
