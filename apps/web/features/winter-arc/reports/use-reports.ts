"use client";

import { useEffect, useState } from "react";
import { getReports, type ReportsView } from "@/data";

export type ReportsState =
  { status: "loading" } | { status: "error" } | { status: "ready"; view: ReportsView };

/** Report history for the list (mobile) and the History panel (web). */
export function useReports(): ReportsState {
  const [state, setState] = useState<ReportsState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    getReports()
      .then((view) => active && setState({ status: "ready", view }))
      .catch(() => active && setState({ status: "error" }));
    return () => {
      active = false;
    };
  }, []);

  return state;
}
