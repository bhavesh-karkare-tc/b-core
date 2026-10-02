"use client";

import { Input } from "@b-core/ui/components/input";
import { Lock, Clock, ShieldAlert, Thermometer } from "lucide-react";
import { Field } from "../../habits/field";
import { HoldButton } from "../hold-button";

type Props = {
  name: string;
  sickDays: number;
  busy: boolean;
  error: string | null;
  onName: (name: string) => void;
  onCommit: () => void;
};

/** S08 Commitment: the rules, then sign by typing your name or holding "I commit" (R6). */
export function CommitStep({ name, sickDays, busy, error, onName, onCommit }: Props) {
  const rules = [
    { icon: Lock, text: "Habits lock after Day 3. Then only rename and reminders change." },
    { icon: Clock, text: "Each day closes at noon the next day. Unlogged habits count as Missed." },
    {
      icon: ShieldAlert,
      text: "Never miss two. One weak day is a warning; two in a row break the streak.",
    },
    { icon: Thermometer, text: `${sickDays} sick days for the whole arc.` },
  ];
  return (
    <>
      <h1 className="text-[28px] leading-tight font-extrabold tracking-tight">The rules</h1>
      <ul className="flex flex-col gap-2">
        {rules.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex gap-3 rounded-row border border-line bg-surface p-3 text-sm"
          >
            <Icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
      <Field
        label="Sign with your name"
        htmlFor="commit-name"
        hint="Or press and hold the button below."
      >
        <Input
          id="commit-name"
          value={name}
          maxLength={60}
          autoComplete="name"
          onChange={(e) => onName(e.target.value)}
          placeholder="Your name"
        />
      </Field>
      <HoldButton armed={name.trim().length > 0} onConfirm={onCommit} disabled={busy} />
      {error ? (
        <p role="alert" className="text-center text-sm text-ember">
          {error}
        </p>
      ) : null}
    </>
  );
}
