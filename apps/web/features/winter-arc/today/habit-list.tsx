import Link from "next/link";
import { useId } from "react";
import type { HabitRowView } from "@/data";
import { HabitRow } from "./habit-row";

type HabitListProps = {
  rows: HabitRowView[];
  title?: string;
  /** Show the "Edit" link to habit settings (Today only). */
  showEdit?: boolean;
  /** Two columns on wide screens (web Today, W02). */
  twoColumn?: boolean;
  onOpen?: (row: HabitRowView) => void;
  onQuickAction?: (row: HabitRowView) => void;
};

export function HabitList({
  rows,
  title = "Today's habits",
  showEdit = true,
  twoColumn = false,
  onOpen,
  onQuickAction,
}: HabitListProps) {
  const headingId = useId();
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 id={headingId} className="text-lg font-bold">
          {title}
        </h2>
        {showEdit ? (
          <Link
            href="/winter-arc/settings"
            className="inline-flex min-h-tap items-center text-[13px] text-accent"
          >
            Edit
          </Link>
        ) : null}
      </div>
      <ul className={twoColumn ? "grid gap-2 lg:grid-cols-2" : "flex flex-col gap-2"}>
        {rows.map((row) => (
          <HabitRow key={row.habit.id} row={row} onOpen={onOpen} onQuickAction={onQuickAction} />
        ))}
      </ul>
    </section>
  );
}
