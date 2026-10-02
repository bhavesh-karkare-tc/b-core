"use client";

import { Button } from "@b-core/ui/components/button";
import { Input } from "@b-core/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@b-core/ui/components/sheet";
import { clampHabitName, HABIT_NAME_MAX, validateHabitDraft } from "@b-core/arc-engine";
import { useState } from "react";
import type { Category, HabitDraft, HabitField, HabitType } from "@/data";
import { HabitScheduleField } from "./habit-schedule-field";
import { HabitTypeFields } from "./habit-type-fields";
import { CATEGORY_LABEL, draftForType, TYPE_LABEL } from "./drafts";
import { Field } from "./field";
import { Segmented } from "./segmented";

type HabitEditorSheetProps = {
  /** Draft to edit, or null when closed. */
  draft: HabitDraft | null;
  title: string;
  /** Fields that can't change (after the Day 3 lock). */
  lockedFields?: readonly HabitField[];
  onSave: (draft: HabitDraft) => void | Promise<void>;
  onClose: () => void;
};

const TYPES = (Object.keys(TYPE_LABEL) as HabitType[]).map((value) => ({
  value,
  label: TYPE_LABEL[value],
}));
const CATEGORIES = (Object.keys(CATEGORY_LABEL) as Category[]).map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}));

/** Habit editor (setup step 4 and Settings). Validation comes from the engine. */
export function HabitEditorSheet({
  draft,
  title,
  lockedFields = [],
  onSave,
  onClose,
}: HabitEditorSheetProps) {
  return (
    <Sheet open={draft !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="mx-auto max-h-[92dvh] w-full max-w-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>
            Name, type, target and the minimum version that still counts.
          </SheetDescription>
        </SheetHeader>
        {draft ? (
          <EditorForm
            key={title + draft.order}
            initial={draft}
            lockedFields={lockedFields}
            onSave={onSave}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function EditorForm({
  initial,
  lockedFields,
  onSave,
}: {
  initial: HabitDraft;
  lockedFields: readonly HabitField[];
  onSave: (draft: HabitDraft) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const issues = validateHabitDraft(draft);
  const error = (field: HabitField) =>
    submitted ? issues.find((i) => i.field === field)?.message : undefined;
  const locked = (field: HabitField) => lockedFields.includes(field);

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        if (issues.length === 0) void onSave({ ...draft, name: draft.name.trim() });
      }}
    >
      <Field
        label="Name"
        htmlFor="habit-name"
        error={error("name")}
        hint={`${[...draft.name].length}/${HABIT_NAME_MAX}`}
      >
        <Input
          id="habit-name"
          value={draft.name}
          maxLength={HABIT_NAME_MAX}
          placeholder="e.g. Cold shower"
          onChange={(e) => setDraft({ ...draft, name: clampHabitName(e.target.value) })}
          disabled={locked("name")}
          aria-invalid={!!error("name")}
          autoComplete="off"
        />
      </Field>
      <Field label="Type" locked={locked("type")}>
        <Segmented
          label="Habit type"
          options={TYPES}
          value={draft.type}
          columns={3}
          disabled={locked("type")}
          onChange={(type) => setDraft(draftForType(type, draft))}
        />
      </Field>
      <Field label="Category" locked={locked("category")}>
        <Segmented
          label="Category"
          options={CATEGORIES}
          value={draft.category}
          disabled={locked("category")}
          onChange={(category) => setDraft({ ...draft, category })}
        />
      </Field>
      <HabitTypeFields draft={draft} setDraft={setDraft} error={error} locked={locked} />
      <HabitScheduleField
        schedule={draft.schedule}
        onChange={(schedule) => setDraft({ ...draft, schedule })}
        error={error("schedule")}
        locked={locked("schedule")}
      />
      <Field label="Reminder (optional)" htmlFor="habit-reminder">
        <Input
          id="habit-reminder"
          type="time"
          value={draft.reminderTime ?? ""}
          onChange={(e) => setDraft({ ...draft, reminderTime: e.target.value || null })}
          disabled={locked("reminderTime")}
        />
      </Field>
      {submitted && issues.length > 0 ? (
        <p role="alert" className="text-sm text-ember">
          Fix the highlighted fields to save.
        </p>
      ) : null}
      <Button type="submit" size="lg" block>
        Save habit
      </Button>
    </form>
  );
}
