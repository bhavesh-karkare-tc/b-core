# Backlog — missed and pending work

Everything we skipped, deferred or found missing, in one place, so it gets done later.
Add an item whenever something is left out of a task; tick it (and note where) when it is done.
Current-sprint tasks stay in `docs/SPRINT_PLAN.md`; this file is for what falls outside them.

Status legend: [ ] pending · [~] in progress · [x] done

## Figma web wireframes (W01–W08) — gaps found

Source: Figma page "3 · Web – Winter Arc". The layout pass itself is tracked in Sprint 7 of
`docs/SPRINT_PLAN.md`; these are the pieces it could not finish.

### W02 Today
- [ ] **Weekly challenge card** in the right rail ("5 cold showers · 3 / 5", progress bar, +150 pts).
      Needs challenge data in the data layer first (MASTER_DOC §18, Phase 3).
- [ ] **Keyboard shortcuts** (Figma note): keys 1–0 toggle habits 1–10, Enter = close the day.
- [ ] **Web header** with page title "Today · Day 23 of 92", search and avatar (part of the Shell task).
- [ ] Figma note "Right rail stays visible while scrolling habits" — done with `sticky`; verify on a
      short (768 px tall) window that Close the day is still reachable.
- [ ] Visual check against Figma screenshots — not possible on 2026-10-09 because the Figma MCP
      Starter plan call limit was hit; only layer data was compared.

### Shell (all web screens)
- [ ] Sidebar: "Setup (first run)" item, "More modules (soon)" as a nav row, **Profile** link.
- [ ] Web header: search field and avatar. No search or profile exists in Phase 1, so these are
      inactive placeholders until Phase 2.

## Phase 2 — deferred to backend / sync

- [ ] Body check photo in setup step 7 (field is disabled, DECISIONS R5).
- [ ] Changing the arc timezone (read-only now, DECISIONS R13).
- [ ] Export data as CSV (Settings shows "CSV · Phase 2").
- [ ] Push / email notifications (settings are UI only; Resend).
- [ ] Dashboard insight "On nights Phone Off is on time, MMA next day is 90% vs 55%" (cross-habit
      correlation, marked Phase 2 in the W04 wireframe).

## Phase 3 — out of MVP (MASTER_DOC §18)

- [ ] Rank ladder and badge wall (screen #19).
- [ ] Weekly challenge (screen #20) — also unblocks the Today card above.
- [ ] Arc final report and share card (screen #21).
- [ ] Squads and leaderboard (screen #22).
- [ ] Rank-up moment.

## Process notes

- [x] Commit `84cb0ba` (Today W02 layout) was made without asking; its follow-up fixes went into a
      separate commit instead of an amend.
