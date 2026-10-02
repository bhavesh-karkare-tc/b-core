"use client";

import { Button } from "@b-core/ui/components/button";
import { sickDayAllowance } from "@b-core/arc-engine";
import { TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyPage } from "@/components/shell/empty-page";
import {
  abandonArc,
  bodyCheckInputSchema,
  createArc,
  DataError,
  getSetupContext,
  saveSetupDraft,
  type ArcSummary,
  type SetupContext,
  type SetupDraft,
} from "@/data";
import { ActiveArcGate } from "./active-arc-gate";
import { CreatedStep } from "./created-step";
import { habitsStepIssue, initialDraft, templateHabits, whyStepIssue } from "./setup-draft";
import { SetupShell } from "./setup-shell";
import { hasBodyCheckValues } from "../body/body-check-fields";
import { BodyCheckStep } from "./steps/body-check-step";
import { CommitStep } from "./steps/commit-step";
import { DatesStep } from "./steps/dates-step";
import { HabitsStep } from "./steps/habits-step";
import { IntroStep } from "./steps/intro-step";
import { TemplateStep } from "./steps/template-step";
import { WhyStep } from "./steps/why-step";

type Loaded = { ctx: SetupContext; draft: SetupDraft };

/** Setup flow S01–S08 (MASTER_DOC §6). The draft is saved on every change. */
export function SetupFlow() {
  const [state, setState] = useState<Loaded | { error: string } | null>(null);
  const [created, setCreated] = useState<ArcSummary | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [nudged, setNudged] = useState(false);
  const [submit, setSubmit] = useState<{ busy: boolean; error: string | null }>({
    busy: false,
    error: null,
  });

  const load = useCallback(async () => {
    try {
      const ctx = await getSetupContext();
      setState({ ctx, draft: ctx.draft ?? initialDraft() });
    } catch (e) {
      setState({ error: e instanceof Error ? e.message : "Could not load setup." });
    }
  }, []);

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

  const draft = state && "draft" in state && !created ? state.draft : null;
  useEffect(() => {
    if (draft) void saveSetupDraft(draft);
  }, [draft]);

  if (!state) return <p className="text-text-muted">Loading…</p>;
  if ("error" in state) {
    return (
      <EmptyPage icon={TriangleAlert} title="Setup could not load" description={state.error}>
        <Button variant="secondary" onClick={() => void load()}>
          Try again
        </Button>
      </EmptyPage>
    );
  }

  const { ctx } = state;
  if (created) return <CreatedStep arc={created} today={ctx.startOptions.today} />;
  if (ctx.activeArc) {
    return (
      <ActiveArcGate
        arc={ctx.activeArc}
        onAbandon={async () => {
          await abandonArc();
          await load();
        }}
      />
    );
  }

  const d = state.draft;
  const startDate = d.startDate ?? ctx.startOptions.nextMonthStart;
  const update = (patch: Partial<SetupDraft>) => setState({ ctx, draft: { ...d, ...patch } });
  const go = (step: number) => {
    setShowErrors(false);
    update({ step });
  };
  const back = d.step > 1 ? () => go(d.step - 1) : undefined;

  async function commit() {
    setSubmit({ busy: true, error: null });
    try {
      const arc = await createArc({
        habits: d.habits,
        startDate,
        durationDays: d.durationDays,
        strongThreshold: d.strongThreshold,
        myWhy: d.myWhy,
        chapterTarget: d.chapterTarget || null,
        bodyCheck: hasBodyCheckValues(d.bodyCheck) ? d.bodyCheck : null,
        commitName: d.commitName.trim() || "I commit",
      });
      setCreated(arc);
    } catch (e) {
      // Keep the form and every entered value; show the error with a retry (MASTER_DOC §6).
      setSubmit({
        busy: false,
        error: e instanceof DataError ? e.message : "Could not save. Try again.",
      });
    }
  }

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

    case 4:
      return (
        <SetupShell
          step={4}
          onBack={back}
          primary={{ label: "Continue", onClick: () => update({ startDate, step: 5 }) }}
        >
          <DatesStep
            ctx={ctx}
            startDate={startDate}
            durationDays={d.durationDays}
            threshold={d.strongThreshold}
            onChange={(patch) => update(patch)}
          />
        </SetupShell>
      );

    case 5: {
      const issue = whyStepIssue(d.myWhy);
      return (
        <SetupShell
          step={5}
          onBack={back}
          primary={{ label: "Continue", onClick: () => (issue ? setShowErrors(true) : go(6)) }}
        >
          <WhyStep
            myWhy={d.myWhy}
            chapterTarget={d.chapterTarget}
            error={showErrors ? issue : null}
            onChange={(patch) => update(patch)}
          />
        </SetupShell>
      );
    }

    case 6: {
      const parsed = d.bodyCheck ? bodyCheckInputSchema.safeParse(d.bodyCheck) : null;
      const issue = parsed && !parsed.success ? "Check the numbers: they look out of range." : null;
      const filled = hasBodyCheckValues(d.bodyCheck);
      return (
        <SetupShell
          step={6}
          onBack={back}
          primary={{
            label: filled ? "Continue" : nudged ? "Skip anyway" : "Skip for now",
            onClick: () => {
              if (filled) return issue ? setShowErrors(true) : go(7);
              // One-time nudge before skipping (MASTER_DOC §6 step 7).
              if (!nudged && !d.bodyCheckSkipped) return setNudged(true);
              update({ bodyCheckSkipped: true, step: 7 });
            },
          }}
        >
          <BodyCheckStep
            value={d.bodyCheck}
            error={showErrors ? issue : null}
            onChange={(bodyCheck) => update({ bodyCheck })}
          />
          {nudged && !filled ? (
            <p
              role="status"
              className="rounded-row border border-accent-1 bg-accent-surface p-3 text-sm text-accent"
            >
              Without a Day 1 baseline, your Day 92 report can&apos;t show what changed. Even just
              your weight helps.
            </p>
          ) : null}
        </SetupShell>
      );
    }

    default:
      return (
        <SetupShell step={7} onBack={back}>
          <CommitStep
            name={d.commitName}
            sickDays={sickDayAllowance(d.durationDays)}
            busy={submit.busy}
            error={submit.error}
            onName={(commitName) => update({ commitName })}
            onCommit={() => void commit()}
          />
        </SetupShell>
      );
  }
}
