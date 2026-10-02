"use client";

import { useCallback, useEffect, useState } from "react";
import { DataError, getToday, type TodayView } from "@/data";
import { onDataChanged } from "../lib/data-events";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; view: TodayView };

/** Load Today and re-load after every mutation or demo change. */
export function useToday() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [actionError, setActionError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const view = await getToday();
      setState({ status: "ready", view });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Could not load Today.",
      });
    }
  }, []);

  useEffect(() => {
    let active = true;
    getToday()
      .then((view) => active && setState({ status: "ready", view }))
      .catch(
        (e: unknown) =>
          active &&
          setState({
            status: "error",
            message: e instanceof Error ? e.message : "Could not load Today.",
          }),
      );
    const off = onDataChanged(() => void refresh());
    return () => {
      active = false;
      off();
    };
  }, [refresh]);

  /** Run a data mutation, surface a friendly error, then refresh. */
  const run = useCallback(
    async (mutation: () => Promise<unknown>) => {
      setActionError(null);
      try {
        await mutation();
      } catch (e) {
        setActionError(e instanceof DataError ? e.message : "Something went wrong. Try again.");
      }
      await refresh();
    },
    [refresh],
  );

  return { state, refresh, run, actionError, clearActionError: () => setActionError(null) };
}
