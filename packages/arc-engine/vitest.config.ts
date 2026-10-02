import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.test.ts", "src/__fixtures__/**", "src/types.ts", "src/index.ts"],
      reporter: ["text", "text-summary"],
      // Sprint 1 "done when": every engine export is covered by tests.
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
    },
  },
});
