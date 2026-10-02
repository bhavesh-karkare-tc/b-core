import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/** Shared TypeScript rules for every workspace. */
export const base = defineConfig([
  globalIgnores(["**/node_modules/**", "**/dist/**", "**/coverage/**", "**/.turbo/**"]),
  js.configs.recommended,
  tseslint.configs.strict,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
]);

/** Engine purity: the clock must be injected, never read (CLAUDE.md rule 2). */
export const pure = defineConfig([
  {
    files: ["src/**/*.ts"],
    ignores: ["src/**/*.test.ts"],
    rules: {
      "no-restricted-properties": [
        "error",
        { object: "Date", property: "now", message: "Pass `now` in explicitly." },
        { object: "performance", property: "now", message: "Pass `now` in explicitly." },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: "`new Date()` reads the clock. Pass `now` in explicitly.",
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "process", message: "No env access in pure packages." },
        { name: "window", message: "No DOM access in pure packages." },
        { name: "localStorage", message: "No I/O in pure packages." },
        { name: "fetch", message: "No I/O in pure packages." },
      ],
    },
  },
]);

export default base;
