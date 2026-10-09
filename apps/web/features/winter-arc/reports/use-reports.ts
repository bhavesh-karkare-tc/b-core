"use client";

import { useEffect, useState } from "react";
import { getReports, type ReportsView } from "@/data";
import { onDataChanged } from "../lib/data-events";

export type ReportsState =
  { status: "loading" } | { status: "error" } | { status: "ready"; view: ReportsView };

/** Report history for the list (mobile) and the History panel (web). */
export function useReports(): ReportsState {
  const [state, setState] = useState<ReportsState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    const load = () =>
      getReports()
        .then((view) => active && setState({ status: "ready", view }))
        .catch(() => active && setState({ status: "error" }));
    void load();
    // Demo scenario / clock changes and saved reflections refresh the list.
    const off = onDataChanged(() => void load());
    return () => {
      active = false;
      off();
    };
  }, []);

  return state;
}
