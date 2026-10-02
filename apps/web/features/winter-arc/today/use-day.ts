"use client";

import { useCallback, useEffect, useState } from "react";
import { getDay, type DayView } from "@/data";

/** Load one arc day (e.g. yesterday from the banner); `reload` after mutations. */
export function useDay(date: string | null) {
  const [day, setDay] = useState<DayView | null>(null);

  const reload = useCallback(async () => {
    if (date) setDay(await getDay(date));
  }, [date]);

  useEffect(() => {
    let active = true;
    if (date) void getDay(date).then((d) => active && setDay(d));
    return () => {
      active = false;
    };
  }, [date]);

  return { day: date ? day : null, reload };
}
