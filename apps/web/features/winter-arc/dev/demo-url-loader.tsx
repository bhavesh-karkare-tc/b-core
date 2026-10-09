"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { demo, type ScenarioId } from "@/data";
import { notifyDataChanged } from "../lib/data-events";

/**
 * `?demo=<scenario>` loads a demo scenario once and `?clock=<ISO instant>` (e.g.
 * 2026-11-01T12:00:00+05:30) pins the demo clock — shareable demo links, screenshots. Mock only.
 */
export function DemoUrlLoader() {
  const params = useSearchParams();
  const scenario = params.get("demo");
  const clock = params.get("clock");

  useEffect(() => {
    if (!scenario) return;
    void demo.getState().then(async (state) => {
      if (!state.scenarios.some((s) => s.id === scenario)) return;
      await demo.loadScenario(scenario as ScenarioId);
      notifyDataChanged();
    });
  }, [scenario]);

  useEffect(() => {
    if (!clock || Number.isNaN(Date.parse(clock))) return;
    void demo.setNow(new Date(clock).toISOString()).then(notifyDataChanged);
  }, [clock]);

  return null;
}
