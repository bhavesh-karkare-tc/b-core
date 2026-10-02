# B-Core Winter Arc — Sprint Plan

Status legend: [ ] todo · [~] in progress · [x] done
Current sprint: **Sprint 2**

## Phase 1 — Web UI prototype with mock data

### Sprint 0 · Foundation
- [x] Turborepo + pnpm monorepo: `apps/web`, `packages/arc-engine`, `packages/ui`, `packages/config`
- [x] Next.js (App Router, TypeScript strict), ESLint, Prettier, Vitest wired into Turborepo tasks
- [x] Tailwind preset in `packages/ui` with Night Ice tokens (see CLAUDE.md), fonts Archivo + JetBrains Mono via next/font
- [x] shadcn/ui init; base primitives: Button, Card, Chip, Input, Toggle, Progress, Sheet, Dialog
- [x] B-Core app shell: web sidebar (Home, Winter Arc: Today/Tracker/Dashboard/Reports, Settings), header, responsive mobile bottom tabs
- [x] Routes stubbed: `/winter-arc/today|tracker|dashboard|reports|setup|settings`
- [x] GitHub Actions CI: lint, typecheck, test on push
- **Done when:** app runs locally, shell + empty pages render in Night Ice theme, CI green

### Sprint 1 · arc-engine (pure logic)
- [x] Domain types (Arc, Chapter, Habit, HabitVersion, DayLog, HabitEntry, StreakState, BodyCheck)
- [x] Status resolution per habit type incl. cutoff rules (count/time/checklist min vs target)
- [x] Daily score, strong day, weekly/chapter/arc totals, completion %
- [x] Arc streak state machine (safe, at_risk, shielded, broken), shields, sick days
- [x] Habit streaks; rank from arc points; chapter generation (incl. mid-month start)
- [x] Edit window / cutoff helpers (timezone-aware, `now` injected)
- [x] Tests for all engine-related Master Doc cases (TC07, TC12–TC17, TC22, TC23, TC28–TC37, TC44)
- **Done when:** all engine tests pass, 100% of engine exports covered by tests

### Sprint 2 · Mock data layer + Today
- [x] `data/types.ts`, `data/index.ts` with async functions (getActiveArc, getToday, logHabit, setHabitValue, closeDay, markSickDay…)
- [x] Mock implementation with seeded October data (Day 23 scenario) persisted to localStorage
- [x] Today screen: header, chapter progress, score ring, streak pill, habit rows for all 5 types
- [ ] Status sheet / count keypad / time entry / checklist interactions
- [ ] Close the day sheet; banners: at risk, shielded, yesterday unlogged, sick day, broken
- **Done when:** a full day can be logged on mock data and score/streak update live

### Sprint 3 · Setup flow (S01–S08)
- [ ] Intro, template, habit list + editor (validation 3–10, name ≤ 30), dates + threshold, My Why, body check, commitment
- [ ] Countdown state for future start; lock after Day 3 in editor
- **Done when:** a new arc can be created in under 3 minutes and lands on Today

### Sprint 4 · Tracker + Day Detail
- [ ] Month grid (10 habits × days, points, journal), chapter switch, week view on small screens
- [ ] Day Detail drawer/page: editable within window, locked after, sick day view
- **Done when:** tracker numbers match engine output for every seeded day

### Sprint 5 · Dashboard
- [ ] Tiles, streak card, rank card, arc heatmap, score trend, habit completion, category balance, body metrics
- [ ] Insights (weakest habit, day-of-week pattern, minimum overuse); "unlock after 7 days" state
- **Done when:** dashboard matches mockup and all figures reconcile with tracker

### Sprint 6 · Reports + Settings
- [ ] Reports list, weekly summary, monthly review (with body check), reflections
- [ ] Notification settings (UI only), module settings, abandon arc dialog
- **Done when:** all MVP screens (S01–S18) exist with their listed states on mock data

## Phase 2 — Backend integration (Supabase)
- [ ] Supabase project, Drizzle schema from Master Doc §14, RLS policies (user owns rows)
- [ ] Auth (email magic link / Google)
- [ ] `data/supabase/*` implementing the same functions; switch `data/index.ts`
- [ ] Cutoff job (hourly, per timezone) + report generation job
- [ ] Email notifications via Resend
- [ ] Beta with 3–5 users; fix P1 bugs

## Phase 3 — Game layer and mobile
- [ ] Ranks UI, badges, weekly challenge, rank-up moment, arc final report + share card
- [ ] Expo mobile app reusing `arc-engine` and `ui` tokens
