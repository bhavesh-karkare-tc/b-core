# B-Core — Project Context for Claude Code

B-Core is a modular self-improvement web app (mobile app later). **Winter Arc** is the first module:
a 92-day personal discipline challenge where the user logs up to 10 daily habits, earns points and
streaks, and sees detailed progress (dashboard, weekly/monthly reports). More modules will be added
later, so everything shared (shell, design tokens, UI components) must be module-agnostic.

## Source of truth

| What | Where |
| --- | --- |
| Product requirements (all rules, data model, 50 test cases, edge cases E1–E20) | `docs/MASTER_DOC.md` |
| Rules and assumptions not spelled out in the Master Doc (R*, A*, T*) | `docs/DECISIONS.md` |
| Sprint plan and current status | `docs/SPRINT_PLAN.md` |
| High-fidelity mockups (visual reference only, not production code) | `docs/design/mockups/*.dc.html` |
| Low-fi wireframes (all 56 mobile + 8 web screens) | Figma: https://www.figma.com/design/tmfLgAFRgMXKhf9lDAY4IH |

When requirements and code disagree, `docs/MASTER_DOC.md` wins. If something is unclear or missing
there, ask before inventing a rule.

## Current phase

**Phase 1 — UI prototype with mock data (web only).** No database, no auth yet.
All data comes from the mock data layer. Phase 2 swaps the mock layer for Supabase without touching UI.

## Tech stack

- **Language:** TypeScript (strict) everywhere
- **Package manager:** pnpm; monorepo with Turborepo
- **Web:** Next.js (App Router), React Server Components where sensible
- **Styling:** Tailwind CSS + shadcn/ui (components copied into `packages/ui` / app)
- **Charts:** Recharts
- **Tests:** Vitest (unit, especially `arc-engine`), Playwright later for E2E
- **Lint/format:** ESLint + Prettier
- **Phase 2 (not yet):** Supabase (Postgres + Auth + RLS), Drizzle ORM, pg_cron or Vercel Cron, Resend
- **Hosting:** Vercel (Hobby is non-commercial; revisit before commercial launch)
- Everything must stay on free tiers / open source.

## Repo structure

```
b-core/
  apps/
    web/                    Next.js app
      app/                  routes: /winter-arc/(today|tracker|dashboard|reports|setup|settings)
      components/           app-level composed components
      features/winter-arc/  feature logic + feature components (setup, logging, tracker, dashboard, reports)
      data/
        types.ts            domain types (Arc, Chapter, Habit, DayLog, HabitEntry, BodyCheck, Report…)
        index.ts            data access functions used by UI (getToday, logHabit, getDashboard…)
        mock/               Phase 1 implementation (in-memory / localStorage, seeded fixtures)
        supabase/           Phase 2 implementation (same function signatures)
  packages/
    arc-engine/             PURE TypeScript domain logic + Vitest tests. No React, no I/O, no Date.now()
    ui/                     design tokens (Tailwind preset) + shared primitives (Button, Card, Chip…)
    config/                 shared tsconfig / eslint / tailwind preset
  docs/
```

## Architecture rules (do not break)

1. **UI never touches data directly.** Components call functions exported from `apps/web/data/index.ts`.
   `index.ts` re-exports the active implementation (mock now, Supabase later). Function signatures are
   async and identical in both implementations.
2. **All scoring/streak/cutoff logic lives in `packages/arc-engine`** as pure functions with explicit
   inputs (pass `now`, timezone, threshold — never read the clock or env inside the engine).
   UI and data layers call the engine; they never re-implement rules.
3. Every engine function has Vitest tests. Use the Master Doc test cases as test names, e.g.
   `it('TC28: 7 Done, 1 Minimum, 1 Rest, 1 Missed = 85')`.
4. Shared shell (sidebar, header, tokens, primitives) must not import from `features/winter-arc`.
5. Keep components small; one component per file; colocate feature components under the feature.

## Domain rules (summary — full detail in MASTER_DOC sections 4, 7, 8, 15)

- **Arc:** default 92 days (1 Oct–31 Dec), split into calendar-month **chapters**. One active arc per user.
- **Habit types:** yesno, count (target + minimum), time (target time + minimum time), session, checklist.
- **Statuses:** done, minimum, missed, rest, sick, unlogged.
- **Points:** done 10, minimum 5, rest 10, missed 0, sick not counted (excluded from denominator).
- **Daily score** = round( sum(points) / (10 × counted habits) × 100 ).
- **Strong day:** score ≥ threshold (default 80).
- **Arc streak (never miss two):** strong → +1, state safe. First weak day → holds, state at_risk.
  Second consecutive weak day → reset to 0 (state broken) unless a shield is held → shield used, state
  shielded, streak holds. Sick day → frozen (not weak, not strong).
- **Shields:** +1 per 7 consecutive strong days, max 2 held.
- **Habit streak:** done/minimum = +1, rest holds, two missed in a row resets.
- **Cutoff:** a day is editable until 12:00 noon (arc timezone) the next day; then unlogged → missed,
  count below minimum → missed, between minimum and target → minimum; day snapshot is final.
- **Lock:** after end of Day 3, habit type/target/schedule are locked (rename + reminder only).
- **Sick days:** 3 per 92-day arc (1 per 30 days); only before cutoff.
- **Completion %** = (done + rest + 0.5 × minimum) / scheduled days so far.
- **Ranks (arc points):** Recruit 0, Fighter 1,000, Contender 2,500, Warrior 4,500, Champion 6,500, Legend 8,000.

## Default habits (Winter Arc template)

| # | Habit | Type | Category | Minimum |
| --- | --- | --- | --- | --- |
| 1 | 3L Water | count 3000 ml | body | 2000 ml |
| 2 | No Junk | yesno | body | one junk item |
| 3 | Phone Off by 12 AM | time 00:00 | discipline | 00:30 |
| 4 | MMA Training | session, Mon–Sat (Sun = rest) | body | 15 min shadow boxing |
| 5 | 10k Steps Outside | count 10000 | body | 6000 |
| 6 | Read 10 Pages | count 10 | mind | 3 |
| 7 | No Phone at Meals | yesno | discipline | 2 of 3 meals |
| 8 | Top 3 Tasks Done | checklist 3 | mind | 1 of 3 |
| 9 | Skin Care | yesno | body | face wash only |
| 10 | No P | yesno | discipline | none (done or missed only) |

## Design system ("Night Ice" — Winter Arc look)

Base: Swiss + minimal (strong grid, few colours). Futuristic accents only for game moments
(score ring, streak, rank-up). Dark theme for Winter Arc. Define these as Tailwind tokens in
`packages/ui`; never hard-code hex values in components.

| Token | Value | Use |
| --- | --- | --- |
| bg | #0B0F14 | page background |
| surface | #121821 | cards |
| surface-2 | #17212C | chips, inactive cells |
| line | #1F2A36 | borders, tracks |
| line-strong | #2C3A4A | input/outline borders |
| text | #E8EEF5 | primary text |
| text-muted | #93A1B2 | secondary text |
| text-faint | #6B7A8C | tertiary labels |
| accent (ice) | #6CC7FF | progress, done, active nav |
| accent-mid | #4A8DB5 / #2F5A75 / #1E3A4E | heatmap levels 3/2/1 |
| ember | #FF8A3D | streak, missed, weak |
| ember-soft | #FFB27D, bg #1A120C / #2A1A10, border #5C3418 | streak cards/pills |

- Fonts: **Archivo** (UI/headings), **JetBrains Mono** (numbers, labels in caps). Load via `next/font`.
- Radius: 6 (cells), 12–14 (buttons/rows), 16–20 (cards). Spacing: 8-pt scale.
- Grids: mobile 4 cols / 16 margin; web 12 cols / 80 margin / 24 gutter, 240 px sidebar.
- Accessibility: tap targets ≥ 44 px, status never by colour alone (icon/glyph + label),
  real `<button>`/`<a>`, text contrast ≥ 4.5:1.
- Heatmap levels: <40 = 0, 40–59 = 1, 60–79 = 2, 80–99 = 3, 100 = 4; sick = "S"; future = dashed.

## Conventions

- TypeScript strict, no `any`. Zod for validating form input.
- File names kebab-case; components PascalCase; hooks `useX`.
- Dates: store ISO dates (`YYYY-MM-DD`) for days; use `date-fns` + `date-fns-tz`; arc timezone is
  explicit everywhere.
- Commits: Conventional Commits (`feat(today): …`, `fix(engine): …`). Small commits per task.
- Branches: work on `dev`; feature branches `feat/<sprint>-<task>` when useful.

## How to work in this repo

1. Read `docs/SPRINT_PLAN.md`; work only on the current sprint's tasks, one task at a time.
2. For engine work: write tests first from the Master Doc test cases, then implement.
3. For UI work: match the mockups' look and the wireframes' structure/states. Build every state
   listed in Master Doc section 13 for that screen (empty, loading, error, edge states).
4. After finishing a task: run `pnpm lint`, `pnpm typecheck`, `pnpm test`; then tick it in
   `docs/SPRINT_PLAN.md` and summarise what changed.
5. Do not add new dependencies without saying why. Do not start Phase 2 (Supabase) unless asked.
