"use client";

import { Input } from "@b-core/ui/components/input";
import { Toggle } from "@b-core/ui/components/toggle";
import type { HabitDraft, HabitField } from "@/data";
import { Field } from "./field";

type Props = {
  draft: HabitDraft;
  setDraft: (draft: HabitDraft) => void;
  error: (field: HabitField) => string | undefined;
  locked: (field: HabitField) => boolean;
};

const int = (value: string) => Number(value.replace(/\D/g, "") || 0);

/** Target / minimum fields per habit type, plus the minimum-version description. */
export function HabitTypeFields({ draft, setDraft, error, locked }: Props) {
  const minimumLocked = locked("minimum");
  const minimumText = (
    <Field
      label="Minimum version"
      htmlFor="habit-min-text"
      error={error("minimumText")}
      hint="The small version that still counts on a hard day."
    >
      <Input
        id="habit-min-text"
        value={draft.minimumText ?? ""}
        maxLength={60}
        placeholder="e.g. 15 min shadow boxing"
        onChange={(e) => setDraft({ ...draft, minimumText: e.target.value })}
        disabled={locked("minimumText")}
      />
    </Field>
  );

  const hasMinToggle = (pressed: boolean, onChange: (on: boolean) => void) => (
    <Toggle
      variant="outline"
      pressed={pressed}
      onPressedChange={onChange}
      disabled={minimumLocked}
      className="self-start"
    >
      {pressed ? "Has a minimum" : "No minimum (Done or Missed only)"}
    </Toggle>
  );

  switch (draft.type) {
    case "yesno":
    case "session":
      return (
        <div className="flex flex-col gap-3">
          {hasMinToggle(draft.hasMinimum, (on) => setDraft({ ...draft, hasMinimum: on }))}
          {draft.hasMinimum ? minimumText : null}
        </div>
      );

    case "count":
      return (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Target"
              htmlFor="habit-target"
              error={error("target")}
              locked={locked("target")}
            >
              <Input
                id="habit-target"
                inputMode="numeric"
                value={String(draft.target)}
                onChange={(e) => setDraft({ ...draft, target: int(e.target.value) })}
                disabled={locked("target")}
              />
            </Field>
            <Field label="Unit" htmlFor="habit-unit" error={error("unit")}>
              <Input
                id="habit-unit"
                value={draft.unit}
                maxLength={12}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value })}
                disabled={locked("unit")}
              />
            </Field>
            <Field label="Quick-add step" htmlFor="habit-step" error={error("step")}>
              <Input
                id="habit-step"
                inputMode="numeric"
                value={String(draft.step)}
                onChange={(e) => setDraft({ ...draft, step: int(e.target.value) })}
                disabled={locked("step")}
              />
            </Field>
            {draft.minimum !== null ? (
              <Field label="Minimum" htmlFor="habit-min" error={error("minimum")}>
                <Input
                  id="habit-min"
                  inputMode="numeric"
                  value={String(draft.minimum)}
                  onChange={(e) => setDraft({ ...draft, minimum: int(e.target.value) })}
                  disabled={minimumLocked}
                />
              </Field>
            ) : null}
          </div>
          {hasMinToggle(draft.minimum !== null, (on) =>
            setDraft({ ...draft, minimum: on ? Math.max(1, Math.floor(draft.target / 2)) : null }),
          )}
          {draft.minimum !== null ? minimumText : null}
        </div>
      );

    case "time":
      return (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Done by" htmlFor="habit-time" locked={locked("target")}>
              <Input
                id="habit-time"
                type="time"
                value={draft.target}
                onChange={(e) => e.target.value && setDraft({ ...draft, target: e.target.value })}
                disabled={locked("target")}
              />
            </Field>
            {draft.minimum !== null ? (
              <Field label="Minimum by" htmlFor="habit-time-min" error={error("minimum")}>
                <Input
                  id="habit-time-min"
                  type="time"
                  value={draft.minimum}
                  onChange={(e) =>
                    e.target.value && setDraft({ ...draft, minimum: e.target.value })
                  }
                  disabled={minimumLocked}
                />
              </Field>
            ) : null}
          </div>
          {hasMinToggle(draft.minimum !== null, (on) =>
            setDraft({ ...draft, minimum: on ? "00:30" : null }),
          )}
          {draft.minimum !== null ? minimumText : null}
        </div>
      );

    case "checklist":
      return (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Items"
              htmlFor="habit-items"
              error={error("items")}
              locked={locked("items")}
            >
              <Input
                id="habit-items"
                inputMode="numeric"
                value={String(draft.items)}
                onChange={(e) => setDraft({ ...draft, items: int(e.target.value) })}
                disabled={locked("items")}
              />
            </Field>
            {draft.minimum !== null ? (
              <Field label="Minimum ticked" htmlFor="habit-items-min" error={error("minimum")}>
                <Input
                  id="habit-items-min"
                  inputMode="numeric"
                  value={String(draft.minimum)}
                  onChange={(e) => setDraft({ ...draft, minimum: int(e.target.value) })}
                  disabled={minimumLocked}
                />
              </Field>
            ) : null}
          </div>
          {hasMinToggle(draft.minimum !== null, (on) =>
            setDraft({ ...draft, minimum: on ? 1 : null }),
          )}
          {draft.minimum !== null ? minimumText : null}
        </div>
      );
  }
}
