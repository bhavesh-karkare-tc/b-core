"use client";

import { useCallback, useEffect, useState } from "react";
import { getTracker, type TrackerView } from "@/data";
import { onDataChanged } from "../lib/data-events";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; view: TrackerView };

/** Load the tracker for a chapter (undefined = the chapter containing today). */
export function useTracker(chapter: number | undefined) {
  const [state, setState] = useState<State>({ status: "loading" });

  const reload = useCallback(async () => {
    try {
      setState({ status: "ready", view: await getTracker(chapter) });
    } catch (e) {
      setState({
        status: "error",
        message: e instanceof Error ? e.message : "Could not load the tracker.",
      });
    }
  }, [chapter]);

  useEffect(() => {
    let active = true;
    getTracker(chapter)
      .then((view) => active && setState({ status: "ready", view }))
      .catch(
        (e: unknown) =>
          active &&
          setState({
            status: "error",
            message: e instanceof Error ? e.message : "Could not load the tracker.",
          }),
      );
    const off = onDataChanged(() => void reload());
    return () => {
      active = false;
      off();
    };
  }, [chapter, reload]);

  return { state, reload };
}
