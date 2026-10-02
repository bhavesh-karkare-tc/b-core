"use client";

import { Button } from "@b-core/ui/components/button";
import { MY_WHY_MAX, THRESHOLD_MAX, THRESHOLD_MIN } from "@b-core/arc-engine";
import { Bell, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  abandonArc,
  DataError,
  getArcSettings,
  updateArcSettings,
  type ArcSettingsView,
} from "@/data";
import { Field } from "../habits/field";
import { notifyDataChanged } from "../lib/data-events";
import { shortDate } from "../lib/format";
import { AbandonArcDialog } from "./abandon-arc-dialog";

/** Module settings: arc facts, threshold (before lock, E18), My Why, notifications link, abandon. */
export function ArcSettings() {
  const router = useRouter();
  const [view, setView] = useState<ArcSettingsView | null>(null);
  const [threshold, setThreshold] = useState(80);
  const [why, setWhy] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const apply = useCallback((v: ArcSettingsView) => {
    setView(v);
    setThreshold(v.arc.strongThreshold);
    setWhy(v.myWhy);
  }, []);

  useEffect(() => {
    let active = true;
    getArcSettings()
      .then((v) => active && apply(v))
      .catch(() => undefined); // no arc: HabitSettings shows the empty state
    return () => {
      active = false;
    };
  }, [apply]);

  if (!view) return null;

  async function save(patch: { strongThreshold?: number; myWhy?: string }) {
    try {
      await updateArcSettings(patch);
      apply(await getArcSettings());
      notifyDataChanged();
      setStatus({ ok: true, text: "Saved" });
    } catch (e) {
      setStatus({ ok: false, text: e instanceof DataError ? e.message : "Could not save." });
    }
  }

  const facts = [
    [
      "Dates",
      `${shortDate(view.arc.startDate)} – ${shortDate(view.arc.endDate)} · ${view.arc.durationDays} days`,
    ],
    [
      "Timezone",
      `${view.arc.timeZone} · day boundaries and the noon cutoff use this zone. Changing it arrives with sync.`,
    ],
    ["Sick days", `${view.sickDaysLeft} of ${view.sickDaysTotal} left`],
  ] as const;

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="arc-heading" className="flex flex-col gap-3">
        <h2 id="arc-heading" className="text-lg font-bold">
          Arc
        </h2>
        <dl className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface">
          {facts.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-0.5 px-4 py-3">
              <dt className="font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase">
                {k}
              </dt>
              <dd className="text-sm">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
          <Field
            label={`Strong day at ${threshold}`}
            htmlFor="threshold"
            locked={!view.canChangeThreshold}
            hint={
              view.canChangeThreshold
                ? "Days at or above this keep your streak. Changeable until the end of Day 3."
                : "Fixed after Day 3 so past days are never re-judged."
            }
          >
            <input
              id="threshold"
              type="range"
              min={THRESHOLD_MIN}
              max={THRESHOLD_MAX}
              step={5}
              value={threshold}
              disabled={!view.canChangeThreshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              onPointerUp={() =>
                threshold !== view.arc.strongThreshold && void save({ strongThreshold: threshold })
              }
              onKeyUp={() =>
                threshold !== view.arc.strongThreshold && void save({ strongThreshold: threshold })
              }
              className="h-tap w-full accent-accent disabled:opacity-40"
            />
          </Field>
        </div>
        <div className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4">
          <Field label="My why" htmlFor="settings-why" hint={`${why.length}/${MY_WHY_MAX}`}>
            <textarea
              id="settings-why"
              rows={3}
              value={why}
              maxLength={MY_WHY_MAX}
              onChange={(e) => setWhy(e.target.value)}
              className="w-full resize-none rounded-control border border-line-strong bg-surface-2 px-3.5 py-3 text-base outline-none focus-visible:border-accent"
            />
          </Field>
          <Button
            variant="secondary"
            className="self-start"
            disabled={why === view.myWhy}
            onClick={() => void save({ myWhy: why })}
          >
            Save My Why
          </Button>
        </div>
        {status ? (
          <p role="status" className={status.ok ? "text-sm text-text-muted" : "text-sm text-ember"}>
            {status.ok ? null : <Lock className="mr-1 inline size-3.5" aria-hidden="true" />}
            {status.text}
          </p>
        ) : null}
      </section>

      <Link
        href="/winter-arc/settings/notifications"
        className="flex min-h-tap items-center gap-3 rounded-card border border-line bg-surface px-4 py-3 hover:border-line-strong"
      >
        <Bell className="size-5 text-accent" aria-hidden="true" />
        <span className="flex flex-1 flex-col">
          <span className="font-semibold">Notifications</span>
          <span className="text-xs text-text-muted">
            Reminders, streak risk, reports, quiet hours
          </span>
        </span>
        <ChevronRight className="size-4 text-text-faint" aria-hidden="true" />
      </Link>

      <section
        aria-labelledby="danger-heading"
        className="flex flex-col gap-3 rounded-card border border-ember-line bg-ember-surface p-4"
      >
        <h2 id="danger-heading" className="font-bold text-ember-soft">
          Abandon arc
        </h2>
        <p className="text-sm text-text-soft">
          Stops this arc for good. Logs and reports stay readable as a past arc.
        </p>
        <div>
          <AbandonArcDialog
            onConfirm={async () => {
              await abandonArc();
              notifyDataChanged();
              router.push("/winter-arc/today");
            }}
          />
        </div>
      </section>
    </div>
  );
}
