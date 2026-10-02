# Decisions log

Rules and choices that `docs/MASTER_DOC.md` does not spell out. MASTER_DOC still wins where it is
explicit; this file fills its gaps. Each entry names where it lives in code so the two stay in sync.

- **R** = product rule decided with the product owner.
- **A** = engineering assumption. It stands until someone objects.
- **T** = technical/stack decision.

## Product rules (decided)

| ID | Situation | Decision | Code |
| --- | --- | --- | --- |
| R1 | A 3rd weak day in a row after a shielded day | Still a "second consecutive weak day". It uses another shield if one is held, otherwise the streak breaks. A shield cancels one weak day; it does not reset the weak run. Shields are hard to earn (7 strong days, max 2), so burning both on one bad stretch is a real cost. | `arc-streak.ts` |
| R2 | A sick day inside a weak run (weak → sick → weak) | A sick day is skipped as if it didn't exist, so this counts as two weak days in a row. The same applies to the 7-strong-days shield count and to habit streaks. | `arc-streak.ts`, `habit-streak.ts` |
| R3 | Count/checklist between minimum and target before cutoff (e.g. 2,400 ml at 3 pm) | Shown as a **provisional Minimum** (5 points, `provisional: true`). It becomes final at cutoff. Below the minimum stays pending (0 points). | `status.ts` |
| R4 | "X days per week" schedule | **Rest while you still can**, decided one day at a time. An unlogged day becomes Rest if `Done/Minimum so far this week + days left in the week after it ≥ X`; otherwise it is required and turns Missed at cutoff. Weeks run Monday–Sunday. In a partial first/last arc week, X is capped at the arc days in that week. Before cutoff a slack day shows as provisional Rest. | `schedule.ts` (`perWeekRestEligible`), `evaluate.ts` |
| R5 | Body check photo (setup step 7) | Deferred to Phase 2. The field shows disabled ("Photos arrive with sync"); weight, waist, push-ups and energy work now. | `features/winter-arc/setup` |
| R6 | Commitment screen | Both: typing your name enables "I commit" (the accessible path), and holding the button for 1.5 s also commits. | `features/winter-arc/setup` |
| R7 | Editing a habit before the Day 3 lock | Retroactive: the habit simply changes and Days 1–3 re-score. After lock only rename and reminder change (TC08); target changes wait for a new chapter (E7). | `setup.ts` (`isHabitFieldEditable`), `data/mock/api.ts` |
| R8 | Setup while an arc is active (TC09) | Setup opens with an abandon dialog. Abandoning keeps the old arc as a read-only past arc (E15). | `data/mock/api.ts` (`abandonArc`) |

## Engineering assumptions

| ID | Topic | Assumption | Code |
| --- | --- | --- | --- |
| A1 | Time habits around midnight | Times are compared on a "night clock": 12:00–23:59 stay as-is, 00:00–11:59 count as 24:00–35:59. For Phone Off (target 00:00, minimum 00:30): 23:50 Done, 00:20 Minimum, 01:10 Missed (TC15–17). | `timezone.ts` (`nightMinutes`) |
| A2 | Habit streak | Done/Minimum +1. Rest, Sick and still-pending days hold the streak and are skipped when checking for "two Missed in a row". | `habit-streak.ts` |
| A3 | Completion % | `(done + rest + 0.5 × minimum) / counted days`. Sick and still-pending days are left out of both sides. The engine returns a 0–1 ratio; the UI rounds it. | `completion.ts` |
| A4 | Sick days | Allowance = `floor(duration / 30)` (92 → 3, 60 → 2, 30 → 1). Allowed only while the day is still editable (before cutoff) and allowance remains. A sick day replaces all entries that day, including ones the user marked Missed. | `sick.ts`, `cutoff.ts` (`canUseSickDay`) |
| A5 | Ranks for 30/60-day arcs | Thresholds scale by `duration / 92`, rounded to the nearest 10 (60 days: 0, 650, 1,630, 2,930, 4,240, 5,220). Rank never drops (`maxRank`). | `rank.ts` |
| A6 | Score edge cases | All habits Sick → score `null` (neither weak nor strong). All counted habits Rest → 100, strong, flagged `recoveryDay` (E8). | `scoring.ts` |
| A7 | Chapters | One chapter per calendar month the arc touches. A 92-day arc starting 15 Oct gives Oct (17 days), Nov (30), Dec (31) and Jan (14). | `chapters.ts` |
| A8 | No-minimum habits | A "minimum" logged on a no-minimum habit (e.g. No P) resolves to Missed. The UI should never offer it (TC19). | `status.ts` |
| A9 | Edit window | Days before the arc start, after the arc end, or in the future (arc timezone) are not editable. The lock starts at 00:00 of Day 4 in the arc timezone. | `cutoff.ts` |
| A10 | Today streak display | The streak pill and banners use days **before** today. Today joins the streak once it is final or when you close it ("Streak safe, 10 days" on the close-day summary), so a half-logged afternoon never shows "at risk". | `data/view-models.ts` |
| A11 | "x of y done" on Today | x = habits logged Done; y = counted habits minus Rest, so a Sunday reads "x of 9". | `data/view-models.ts` |
| A12 | Demo clock (Phase 1 only) | The mock layer pins "now" (default Fri 23 Oct 2026, 15:00, browser timezone). Demo controls and `?demo=<scenario>` switch scenario or move the clock. Time-habit "Log now" uses this clock, never the device clock (E3). | `data/mock/*` |

## Open questions

| ID | Question | Context |
| --- | --- | --- |
| Q1 | Bedtime habits logged after midnight | At 00:20 the arc's "today" has already rolled over, so tapping Phone Off on Today logs it for the new day. Today the user must open "Log yesterday" from the banner instead. Should a time habit's quick action log to the previous day between 00:00 and its minimum time (e.g. 00:30)? |

## Technical decisions

| ID | Decision | Why |
| --- | --- | --- |
| T1 | Tailwind v4 with a shared CSS theme (`packages/ui/src/styles/night-ice.css`) instead of a v3 JS "preset" | Current shadcn/ui targets v4, and v4 has no JS presets. The CSS `@theme` is the equivalent single source of tokens. |
| T2 | TypeScript 5.9, ESLint 9 | typescript-eslint does not support TS 7 yet. eslint-plugin-react (through eslint-config-next) is not reliable on ESLint 10. |
| T3 | Internal packages ship TypeScript source (no build step) | Next compiles them through `transpilePackages`; this keeps the monorepo simple. |
| T4 | Respect pnpm's minimum-release-age check | Pin to an older version (lucide-react 1.49.0) rather than bypass the supply-chain guard. |
| T5 | Engine never reads the clock | ESLint blocks `Date.now`, an argument-less `new Date()`, `process`, `window`, `localStorage` and `fetch` in `arc-engine`. Every time-dependent function takes `now` and a timezone. |
| T6 | Engine coverage gate is 100% (lines, branches, functions, statements) | This is the Sprint 1 "done when" condition, enforced in `packages/arc-engine/vitest.config.ts`. |
| T7 | Today is a client component over the async data API | Mock data lives in localStorage. Signatures stay async, so Phase 2 swaps in Supabase without UI changes. |
| T8 | Scroll padding for fixed and sticky chrome | Focused rows must not hide under the top bar, bottom tabs or the sticky "Close the day" bar (WCAG 2.4.11). Found in browser testing: a tap under the sticky bar closed the day. |
| T9 | Tracker month rows are 28 px tall | 31 day rows at 44 px would make a ~1,400 px month on a phone; the mockup is a dense grid. Rows stay ≥ 24 px (WCAG 2.5.8 AA) and each row is a single target. Week view gives 44 px targets. |
