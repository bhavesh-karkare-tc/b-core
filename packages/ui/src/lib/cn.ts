import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/** tailwind-merge taught the Night Ice theme keys (see styles/night-ice.css). */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      radius: ["cell", "control", "row", "card", "card-lg"],
      spacing: ["tap", "sidebar"],
    },
  },
});

/** Merge class names; later Tailwind classes win over earlier conflicting ones. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
