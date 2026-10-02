"use client";

import { useSyncExternalStore } from "react";

const TOKENS = [
  "accent",
  "accent-3",
  "ember",
  "line",
  "text",
  "text-muted",
  "text-faint",
  "surface",
  "surface-2",
] as const;
export type ThemeColors = Record<(typeof TOKENS)[number], string>;

let cache: ThemeColors | null = null;

function read(): ThemeColors | null {
  if (cache) return cache;
  const style = getComputedStyle(document.documentElement);
  const colors = Object.fromEntries(
    TOKENS.map((t) => [t, style.getPropertyValue(`--color-${t}`).trim()]),
  ) as ThemeColors;
  // Tailwind only emits variables that are used somewhere; all of these are.
  if (Object.values(colors).some((v) => !v)) return null;
  cache = colors;
  return cache;
}

/**
 * Night Ice tokens as concrete colour strings for SVG chart attributes (Recharts), read from
 * the CSS theme at runtime so no hex values live in components. Null during server render.
 */
export function useThemeColors(): ThemeColors | null {
  return useSyncExternalStore(
    () => () => {},
    read,
    () => null,
  );
}
