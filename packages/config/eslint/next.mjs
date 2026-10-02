import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { base } from "./base.mjs";

/**
 * Next.js app config: Next core-web-vitals + TypeScript rules, then our base again so its
 * stricter settings (e.g. unused vars as errors) win over Next's warnings.
 */
export const next = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...base,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default next;
