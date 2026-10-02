"use client";

import { Button } from "@b-core/ui/components/button";
import { canAddHabit, MAX_HABITS, validateHabitDraft } from "@b-core/arc-engine";
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { HabitDraft } from "@/data";
import {
  CATEGORY_LABEL,
  describeHabit,
  describeSchedule,
  newHabitDraft,
} from "../../habits/drafts";
import { HabitEditorSheet } from "../../habits/habit-editor-sheet";
import { renumber } from "../setup-draft";

type Props = {
  habits: HabitDraft[];
  onChange: (habits: HabitDraft[]) => void;
};

/** S03 Edit habits list (3–10; tap to edit, reorder mode, remove) + S04 editor sheet. */
export function HabitsStep({ habits, onChange }: Props) {
  const [editing, setEditing] = useState<{ index: number | null; draft: HabitDraft } | null>(null);
  const [reordering, setReordering] = useState(false);

  function move(index: number, delta: -1 | 1) {
    const next = [...habits];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(index + delta, 0, item);
    onChange(renumber(next));
  }

  return (
    <>
      <div className="flex items-end justify-between gap-3">
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">Your habits</h1>
        <p className="font-mono text-sm text-text-muted" aria-live="polite">
          {habits.length} / {MAX_HABITS}
        </p>
      </div>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-text-muted">
          3 to 10 habits, in the order they show on Today. Tap one to edit. Everything stays
          editable until the end of Day 3.
        </p>
        {habits.length > 1 ? (
          <Button
            variant="secondary"
            aria-pressed={reordering}
            onClick={() => setReordering(!reordering)}
          >
            {reordering ? <Check aria-hidden="true" /> : <ArrowUpDown aria-hidden="true" />}
            {reordering ? "Done" : "Reorder"}
          </Button>
        ) : null}
      </div>
      <ol className="flex flex-col gap-2">
        {habits.map((h, i) => {
          const invalid = validateHabitDraft(h).length > 0;
          const name = h.name || "untitled habit";
          return (
            <li
              key={`${h.name}-${i}`}
              className="flex items-center gap-1 rounded-row border border-line bg-surface p-1.5"
            >
              <button
                type="button"
                disabled={reordering}
                onClick={() => setEditing({ index: i, draft: h })}
                aria-label={`Edit ${name}`}
                className="flex min-h-tap min-w-0 flex-1 items-center gap-3 rounded-control px-2 text-left hover:bg-surface-2 disabled:hover:bg-transparent"
              >
                <span className="w-5 shrink-0 font-mono text-xs text-text-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="flex items-center gap-1.5 truncate font-semibold">
                    {invalid ? (
                      <TriangleAlert
                        className="size-4 shrink-0 text-ember"
                        aria-label="Needs fixing"
                      />
                    ) : null}
                    {h.name || "Untitled"}
                  </span>
                  <span className="truncate text-xs text-text-muted">
                    {describeHabit(h)} · {describeSchedule(h.schedule)} ·{" "}
                    {CATEGORY_LABEL[h.category]}
                  </span>
                </span>
              </button>
              {reordering ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${name} up`}
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Move ${name} down`}
                    disabled={i === habits.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown />
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${name}`}
                  onClick={() => onChange(renumber(habits.filter((_, j) => j !== i)))}
                >
                  <Trash2 />
                </Button>
              )}
            </li>
          );
        })}
      </ol>
      {canAddHabit(habits.length) ? (
        <Button
          variant="secondary"
          block
          onClick={() => setEditing({ index: null, draft: newHabitDraft(habits.length + 1) })}
        >
          <Plus aria-hidden="true" />
          Add habit
        </Button>
      ) : (
        <p className="text-center text-sm text-text-muted">
          That&apos;s the maximum of {MAX_HABITS} habits.
        </p>
      )}
      <HabitEditorSheet
        draft={editing?.draft ?? null}
        title={editing?.index === null ? "New habit" : `Edit ${editing?.draft.name ?? "habit"}`}
        onClose={() => setEditing(null)}
        onSave={(draft) => {
          if (!editing) return;
          const next =
            editing.index === null
              ? [...habits, draft]
              : habits.map((h, i) => (i === editing.index ? draft : h));
          onChange(renumber(next));
          setEditing(null);
        }}
      />
    </>
  );
}
