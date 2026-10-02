"use client";

import { useCallback, useEffect, useState } from "react";
import { getDashboard, type DashboardFilter, type DashboardView } from "@/data";
import { onDataChanged } from "../lib/data-events";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; view: DashboardView; refreshing: boolean };

function toFilter(kind: DashboardFilter["kind"], index: number): DashboardFilter {
  return kind === "chapter" ? { kind, index } : { kind };
}

/** Load the dashboard. On a filter change the previous render stays (dimmed) until new data lands. */
export function useDashboard(kind: DashboardFilter["kind"], index: number) {
  const [state, setState] = useState<State>({ status: "loading" });

  const reload = useCallback(async () => {
    try {
      setState({
        status: "ready",
        view: await getDashboard(toFilter(kind, index)),
        refreshing: false,
      });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Could not load the dashboard.",
      });
    }
  }, [kind, index]);

  useEffect(() => {
    let active = true;
    getDashboard(toFilter(kind, index))
      .then((view) => active && setState({ status: "ready", view, refreshing: false }))
      .catch(
        (e: unknown) =>
          active &&
          setState({
            status: "error",
            message: e instanceof Error ? e.message : "Could not load the dashboard.",
          }),
      );
    const off = onDataChanged(() => void reload());
    return () => {
      active = false;
      off();
    };
  }, [kind, index, reload]);

  return { state, reload };
}
