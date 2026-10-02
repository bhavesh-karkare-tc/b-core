"use client";

import { Button } from "@b-core/ui/components/button";
import { Input } from "@b-core/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@b-core/ui/components/sheet";
import { cn } from "@b-core/ui/lib/cn";
import { FlaskConical } from "lucide-react";
import { useCallback, useState } from "react";
import { demo, type DemoState, type ScenarioId } from "@/data";
import { notifyDataChanged } from "../lib/data-events";

function toLocalInputs(iso: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

/** Wall-clock date + time in `timeZone` → ISO instant (offset found via Intl, no extra deps). */
function fromLocalInputs(date: string, time: string, timeZone: string): string {
  const guess = new Date(`${date}T${time}:00Z`);
  const shown = toLocalInputs(guess.toISOString(), timeZone);
  const drift = new Date(`${shown.date}T${shown.time}:00Z`).getTime() - guess.getTime();
  return new Date(guess.getTime() - drift).toISOString();
}

/** Mock-only control: switch demo scenario and move the pinned clock. */
export function DemoPanel() {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<DemoState | null>(null);
  const [clock, setClock] = useState({ date: "", time: "" });

  const load = useCallback(async () => {
    const next = await demo.getState();
    setState(next);
    setClock(toLocalInputs(next.now, next.timeZone));
  }, []);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) void load();
  }

  async function pick(id: ScenarioId) {
    await demo.loadScenario(id);
    notifyDataChanged();
    await load();
  }

  async function applyClock() {
    if (!state) return;
    await demo.setNow(fromLocalInputs(clock.date, clock.time, state.timeZone));
    notifyDataChanged();
    await load();
  }

  async function reset() {
    await demo.reset();
    notifyDataChanged();
    await load();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="mx-auto mt-6 flex text-text-faint">
          <FlaskConical aria-hidden="true" />
          Demo controls
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="gap-5">
        <SheetHeader>
          <SheetTitle>Demo controls</SheetTitle>
          <SheetDescription>Mock data only. Pick a scenario or move the clock.</SheetDescription>
        </SheetHeader>
        {state ? (
          <>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase">
                Scenario
              </legend>
              {state.scenarios.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => void pick(s.id)}
                  aria-pressed={s.id === state.scenario}
                  className={cn(
                    "flex min-h-tap flex-col items-start gap-0.5 rounded-control border px-3 py-2 text-left",
                    s.id === state.scenario
                      ? "border-accent bg-accent-surface"
                      : "border-line hover:bg-surface-2",
                  )}
                >
                  <span className="text-sm font-semibold">{s.label}</span>
                  <span className="text-xs text-text-muted">{s.description}</span>
                </button>
              ))}
            </fieldset>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 font-mono text-[11px] tracking-[0.12em] text-text-faint uppercase">
                Clock ({state.timeZone})
              </legend>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  aria-label="Demo date"
                  value={clock.date}
                  onChange={(e) => setClock((c) => ({ ...c, date: e.target.value }))}
                />
                <Input
                  type="time"
                  aria-label="Demo time"
                  value={clock.time}
                  onChange={(e) => setClock((c) => ({ ...c, time: e.target.value }))}
                />
              </div>
              <Button variant="secondary" onClick={() => void applyClock()}>
                Set clock
              </Button>
            </fieldset>
            <Button variant="ghost" onClick={() => void reset()}>
              Reset demo data
            </Button>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
