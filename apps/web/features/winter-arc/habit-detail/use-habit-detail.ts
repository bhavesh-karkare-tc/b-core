"use client";

import { useEffect, useState } from "react";
import { getHabitDetail, type HabitDetailView } from "@/data";
import { onDataChanged } from "../lib/data-events";

type State =
  { status: "loading" } | { status: "missing" } | { status: "ready"; view: HabitDetailView };

export function useHabitDetail(habitId: string | null, chapter: number | undefined) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    if (!habitId) return;
    let active = true;
    const load = () =>
      void getHabitDetail(habitId, chapter).then((view) => {
        if (active) setState(view ? { status: "ready", view } : { status: "missing" });
      });
    load();
    const off = onDataChanged(load);
    return () => {
      active = false;
      off();
    };
  }, [habitId, chapter]);

  return state;
}
