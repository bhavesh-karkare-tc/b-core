"use client";

import { Button } from "@b-core/ui/components/button";
import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { EmptyPage } from "@/components/shell/empty-page";
import { getSetupContext, saveSetupDraft, type SetupContext, type SetupDraft } from "@/data";
import { habitsStepIssue, initialDraft, templateHabits } from "./setup-draft";
import { SetupShell } from "./setup-shell";
import { HabitsStep } from "./steps/habits-step";
import { IntroStep } from "./steps/intro-step";
import { TemplateStep } from "./steps/template-step";

type Loaded = { ctx: SetupContext; draft: SetupDraft };

/** Setup flow S01–S08 (MASTER_DOC §6). The draft is saved on every change. */
export function SetupFlow() {
  const [state, setState] = useState<Loaded | { error: string } | null>(null);

  useEffect(() => {
    let active = true;
    getSetupContext()
      .then((ctx) => active && setState({ ctx, draft: ctx.draft ?? initialDraft() }))
      .catch(
        (e: unknown) =>
          active && setState({ error: e instanceof Error ? e.message : "Could not load setup." }),
      );
    return () => {
      active = false;
    };
  }, []);

  const draft = state && "draft" in state ? state.draft : null;
  useEffect(() => {
    if (draft) void saveSetupDraft(draft);
  }, [draft]);

  if (!state) return <p className="text-text-muted">Loading…</p>;
  if ("error" in state) {
    return (
      <EmptyPage icon={TriangleAlert} title="Setup could not load" description={state.error}>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </EmptyPage>
    );
  }

  const { ctx } = state;
  const d = state.draft;
  const update = (patch: Partial<SetupDraft>) => setState({ ctx, draft: { ...d, ...patch } });
  const go = (step: number) => update({ step });
  const back = d.step > 1 ? () => go(d.step - 1) : undefined;

  switch (d.step) {
    case 1:
      return (
        <SetupShell step={1} primary={{ label: "Start my arc", onClick: () => go(2) }}>
          <IntroStep />
        </SetupShell>
      );

    case 2: {
      const template = d.template ?? "default";
      return (
        <SetupShell
          step={2}
          onBack={back}
          primary={{
            label: "Continue",
            onClick: () =>
              update({
                template,
                habits:
                  d.template === template && d.habits.length > 0
                    ? d.habits
                    : templateHabits(ctx, template),
                step: 3,
              }),
          }}
        >
          <TemplateStep
            ctx={ctx}
            value={template}
            edited={d.habits.length > 0}
            onChange={(t) => update({ template: t, habits: templateHabits(ctx, t) })}
          />
        </SetupShell>
      );
    }

    case 3: {
      const issue = habitsStepIssue(d.habits);
      return (
        <SetupShell
          step={3}
          onBack={back}
          issue={issue}
          primary={{ label: "Continue", onClick: () => go(4), disabled: !!issue }}
        >
          <HabitsStep habits={d.habits} onChange={(habits) => update({ habits })} />
        </SetupShell>
      );
    }

    default:
      return (
        <SetupShell
          step={Math.min(d.step, 7)}
          onBack={back}
          primary={{ label: "Coming next", onClick: () => {}, disabled: true }}
        >
          <p className="text-text-muted">
            Dates, My Why, body check and commitment arrive in the next task.
          </p>
        </SetupShell>
      );
  }
}
