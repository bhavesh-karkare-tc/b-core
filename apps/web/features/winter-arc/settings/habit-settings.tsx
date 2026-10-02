"use client";

import { Button } from "@b-core/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@b-core/ui/components/dialog";
import { canAddHabit, HABIT_FIELDS, MAX_HABITS, MIN_HABITS } from "@b-core/arc-engine";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Flag,
  Lock,
  Plus,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyPage } from "@/components/shell/empty-page";
import {
  addHabit,
  DataError,
  getHabitSettings,
  removeHabit,
  reorderHabits,
  updateHabit,
  type Habit,
  type HabitDraft,
  type HabitSettingsView,
} from "@/data";
import { CATEGORY_LABEL, describeHabit, describeSchedule, newHabitDraft } from "../habits/drafts";
import { HabitEditorSheet } from "../habits/habit-editor-sheet";
import { shortDate } from "../lib/format";

type State =
  { status: "loading" } | { status: "no_arc" } | { status: "ready"; view: HabitSettingsView };

function toDraft(h: Habit): HabitDraft {
  const { id: _id, arcId: _arcId, ...draft } = h;
  return draft;
}

/** Arc settings → Habits. Free edits until the end of Day 3, then rename + reminder only (TC08, R7). */
export function HabitSettings() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [editing, setEditing] = useState<{ id: string | null; draft: HabitDraft } | null>(null);
  const [removing, setRemoving] = useState<Habit | null>(null);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setState({ status: "ready", view: await getHabitSettings() });
    } catch (e) {
      if (e instanceof DataError && e.code === "no_arc") setState({ status: "no_arc" });
      else setError("Could not load habits. Try again.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    getHabitSettings()
      .then((view) => active && setState({ status: "ready", view }))
      .catch(
        (e: unknown) =>
          active && e instanceof DataError && e.code === "no_arc" && setState({ status: "no_arc" }),
      );
    return () => {
      active = false;
    };
  }, []);

  async function run(mutation: () => Promise<unknown>): Promise<boolean> {
    setError(null);
    try {
      await mutation();
      await load();
      return true;
    } catch (e) {
      setError(e instanceof DataError ? e.message : "Something went wrong. Try again.");
      await load();
      return false;
    }
  }

  if (state.status === "loading")
    return <div className="h-64 animate-pulse rounded-card bg-surface" aria-busy="true" />;
  if (state.status === "no_arc") {
    return (
      <EmptyPage
        icon={Flag}
        title="No active arc"
        description="Start an arc to set up your habits."
      >
        <Button asChild>
          <Link href="/winter-arc/setup">Start my arc</Link>
        </Button>
      </EmptyPage>
    );
  }

  const { view } = state;
  const habits = view.habits;
  const lockedFields = HABIT_FIELDS.filter((f) => !view.editableFields.includes(f));

  function move(index: number, delta: -1 | 1) {
    const ids = habits.map((h) => h.id);
    const [id] = ids.splice(index, 1);
    if (!id) return;
    ids.splice(index + delta, 0, id);
    void run(() => reorderHabits(ids));
  }

  return (
    <section aria-labelledby="habits-heading" className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <h2 id="habits-heading" className="text-lg font-bold">
          Habits
        </h2>
        <p className="font-mono text-sm text-text-muted">
          {habits.length} / {MAX_HABITS}
        </p>
      </div>
      <div
        role="status"
        className="flex items-start gap-3 rounded-row border border-line bg-surface p-3 text-sm text-text-muted"
      >
        {view.locked ? (
          <Lock className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        ) : null}
        {view.locked
          ? "Habits are locked after Day 3. You can rename them and change reminders. Target changes come with a new chapter."
          : `You can change everything until the end of Day 3 (${shortDate(view.lockDate)}). Changes apply from Day 1.`}
      </div>
      {error ? (
        <p role="alert" className="flex items-center gap-2 text-sm text-ember">
          <TriangleAlert className="size-4" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      <div className="flex justify-end">
        <Button
          variant="secondary"
          aria-pressed={reordering}
          onClick={() => setReordering(!reordering)}
        >
          {reordering ? <Check aria-hidden="true" /> : <ArrowUpDown aria-hidden="true" />}
          {reordering ? "Done" : "Reorder"}
        </Button>
      </div>
      <ol className="flex flex-col gap-2">
        {habits.map((h, i) => (
          <li
            key={h.id}
            className="flex items-center gap-1 rounded-row border border-line bg-surface p-1.5"
          >
            <button
              type="button"
              disabled={reordering}
              onClick={() => setEditing({ id: h.id, draft: toDraft(h) })}
              aria-label={`Edit ${h.name}`}
              className="flex min-h-tap min-w-0 flex-1 items-center gap-3 rounded-control px-2 text-left hover:bg-surface-2 disabled:hover:bg-transparent"
            >
              <span className="w-5 shrink-0 font-mono text-xs text-text-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-semibold">{h.name}</span>
                <span className="truncate text-xs text-text-muted">
                  {describeHabit(h)} · {describeSchedule(h.schedule)} · {CATEGORY_LABEL[h.category]}
                </span>
              </span>
            </button>
            {reordering ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${h.name} up`}
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Move ${h.name} down`}
                  disabled={i === habits.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown />
                </Button>
              </>
            ) : view.canChangeList && habits.length > MIN_HABITS ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${h.name}`}
                onClick={() => setRemoving(h)}
              >
                <Trash2 />
              </Button>
            ) : null}
          </li>
        ))}
      </ol>
      {view.canChangeList && canAddHabit(habits.length) ? (
        <Button
          variant="secondary"
          block
          onClick={() => setEditing({ id: null, draft: newHabitDraft(habits.length + 1) })}
        >
          <Plus aria-hidden="true" />
          Add habit
        </Button>
      ) : null}

      <HabitEditorSheet
        draft={editing?.draft ?? null}
        title={editing?.id === null ? "New habit" : `Edit ${editing?.draft.name ?? "habit"}`}
        lockedFields={editing?.id === null ? [] : lockedFields}
        onClose={() => setEditing(null)}
        onSave={async (draft) => {
          if (!editing) return;
          const id = editing.id;
          const ok = await run(() => (id === null ? addHabit(draft) : updateHabit(id, draft)));
          if (ok) setEditing(null);
        }}
      />

      <Dialog open={removing !== null} onOpenChange={(open) => !open && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {removing?.name}?</DialogTitle>
            <DialogDescription>
              Its logs so far are deleted and scores recalculate. You can&apos;t remove habits after
              Day 3.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Keep it</Button>
            </DialogClose>
            <Button
              variant="ember"
              onClick={() => {
                const target = removing;
                setRemoving(null);
                if (target) void run(() => removeHabit(target.id));
              }}
            >
              Remove habit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
