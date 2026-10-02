/**
 * Data access for the UI. Components import only from here (CLAUDE.md rule 1).
 * Phase 1 re-exports the mock implementation; Phase 2 swaps in Supabase with the same signatures.
 */
export type * from "./types";
export { DataError } from "./types";
