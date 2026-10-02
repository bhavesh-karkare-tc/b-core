"use client";

import { useCallback, useEffect, useState } from "react";
import { DataError, getDayDetail, type DayDetailView } from "@/data";
import { notifyDataChanged, onDataChanged } from "../lib/data-events";

type State =
  { status: "loading" } | { status: "missing" } | { status: "ready"; view: DayDetailView };

/** Load Day Detail for `date`; `run` mutates, reloads and tells other screens (tracker) to refresh. */
export function useDayDetail(date: string | null) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!date) return;
    const view = await getDayDetail(date);
    setState(view ? { status: "ready", view } : { status: "missing" });
  }, [date]);

  useEffect(() => {
    if (!date) return;
    let active = true;
    void getDayDetail(date).then((view) => {
      if (active) setState(view ? { status: "ready", view } : { status: "missing" });
    });
    const off = onDataChanged(() => void reload());
    return () => {
      active = false;
      off();
    };
  }, [date, reload]);

  const run = useCallback(async (mutation: () => Promise<unknown>) => {
    setError(null);
    try {
      await mutation();
    } catch (e) {
      setError(e instanceof DataError ? e.message : "Something went wrong. Try again.");
    }
    notifyDataChanged();
  }, []);

  return { state, error, clearError: () => setError(null), run };
}
