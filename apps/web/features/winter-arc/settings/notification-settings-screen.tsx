"use client";

import { Button } from "@b-core/ui/components/button";
import { Input } from "@b-core/ui/components/input";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DataError,
  getNotificationSettings,
  NOTIFICATION_INFO,
  saveNotificationSettings,
  type NotificationSettings,
} from "@/data";
import { PageHeader } from "@/components/shell/page-header";
import { Field } from "../habits/field";
import { Switch } from "./switch";

/**
 * Notification settings (screen #18). UI only in Phase 1: delivery arrives with sync.
 * `embedded`: shown as a card beside Arc settings on web (W08) instead of its own page.
 */
export function NotificationSettingsScreen({ embedded = false }: { embedded?: boolean }) {
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  // Section headings sit under the card's h2 when embedded.
  const Sub = embedded ? "h3" : "h2";

  useEffect(() => {
    let active = true;
    void getNotificationSettings().then((s) => active && setSettings(s));
    return () => {
      active = false;
    };
  }, []);

  async function update(next: NotificationSettings) {
    setSettings(next);
    try {
      await saveNotificationSettings(next);
      setStatus("Saved");
    } catch (e) {
      setStatus(e instanceof DataError ? e.message : "Could not save.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {embedded ? (
        <h2 className="text-lg font-bold">Notifications</h2>
      ) : (
        <>
          <Link
            href="/winter-arc/settings"
            className="inline-flex min-h-tap items-center gap-1.5 self-start text-sm text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Arc settings
          </Link>
          <PageHeader eyebrow="Winter Arc" title="Notifications" />
        </>
      )}
      <p className="rounded-row border border-line bg-surface p-3 text-sm text-text-muted">
        Choose what you want to hear about. Delivery arrives with sync; these choices are saved now.
      </p>
      {settings ? (
        <>
          <ul className="flex flex-col divide-y divide-line rounded-card border border-line bg-surface">
            {NOTIFICATION_INFO.map((info) => {
              const t = settings.types[info.type];
              return (
                <li key={info.type} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="font-semibold">{info.label}</span>
                    <span className="text-xs text-text-muted">
                      {info.phase2 ? "Coming with weekly challenges." : info.description}
                    </span>
                  </div>
                  {t.time !== null && !info.phase2 ? (
                    <label className="w-36">
                      <span className="sr-only">{info.label} time</span>
                      <Input
                        type="time"
                        value={t.time}
                        disabled={!t.enabled}
                        onChange={(e) =>
                          e.target.value &&
                          void update({
                            ...settings,
                            types: {
                              ...settings.types,
                              [info.type]: { ...t, time: e.target.value },
                            },
                          })
                        }
                      />
                    </label>
                  ) : null}
                  <Switch
                    label={info.label}
                    checked={t.enabled && !info.phase2}
                    disabled={info.phase2}
                    onChange={(enabled) =>
                      void update({
                        ...settings,
                        types: { ...settings.types, [info.type]: { ...t, enabled } },
                      })
                    }
                  />
                </li>
              );
            })}
          </ul>
          <section
            aria-labelledby="quiet-heading"
            className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
          >
            <Sub id="quiet-heading" className="font-semibold">
              Quiet hours
            </Sub>
            <p className="text-xs text-text-muted">
              Nothing is sent in this window, except habit reminders you set inside it (e.g. Phone
              Off by 12 AM).
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="From" htmlFor="quiet-start">
                <Input
                  id="quiet-start"
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) =>
                    e.target.value &&
                    void update({
                      ...settings,
                      quietHours: { ...settings.quietHours, start: e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="To" htmlFor="quiet-end">
                <Input
                  id="quiet-end"
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) =>
                    e.target.value &&
                    void update({
                      ...settings,
                      quietHours: { ...settings.quietHours, end: e.target.value },
                    })
                  }
                />
              </Field>
            </div>
          </section>
          <section
            aria-labelledby="cap-heading"
            className="flex flex-col gap-3 rounded-card border border-line bg-surface p-4"
          >
            <Sub id="cap-heading" className="font-semibold">
              Daily limit
            </Sub>
            <p className="text-xs text-text-muted">
              At most this many a day. When there are more, streak at risk goes first, then the
              cutoff warning, then habit reminders.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                aria-label="Fewer per day"
                disabled={settings.dailyCap <= 1}
                onClick={() => void update({ ...settings, dailyCap: settings.dailyCap - 1 })}
              >
                <Minus />
              </Button>
              <span className="font-mono text-lg" aria-live="polite">
                {settings.dailyCap} per day
              </span>
              <Button
                variant="secondary"
                size="icon"
                aria-label="More per day"
                disabled={settings.dailyCap >= 10}
                onClick={() => void update({ ...settings, dailyCap: settings.dailyCap + 1 })}
              >
                <Plus />
              </Button>
            </div>
          </section>
          <p role="status" aria-live="polite" className="min-h-5 text-sm text-text-muted">
            {status}
          </p>
        </>
      ) : (
        <div className="h-96 animate-pulse rounded-card bg-surface" aria-busy="true" />
      )}
    </div>
  );
}
