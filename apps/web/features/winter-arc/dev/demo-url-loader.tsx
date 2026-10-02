"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { demo, type ScenarioId } from "@/data";
import { notifyDataChanged } from "../lib/data-events";

/** `?demo=<scenario>` loads a demo scenario once (shareable demo links, screenshots). Mock only. */
export function DemoUrlLoader() {
  const scenario = useSearchParams().get("demo");

  useEffect(() => {
    if (!scenario) return;
    void demo.getState().then(async (state) => {
      if (!state.scenarios.some((s) => s.id === scenario)) return;
      await demo.loadScenario(scenario as ScenarioId);
      notifyDataChanged();
    });
  }, [scenario]);

  return null;
}
