# MVP screen audit (Phase 1)

Every MVP screen from `docs/MASTER_DOC.md` §13 (screens 1–18) and each state it lists, with how to reach it
on mock data. Load a demo scenario with `?demo=<id>` on any Winter Arc page (or **Demo controls** at the bottom
of the page); scenario ids are in `apps/web/data/mock/scenarios.ts`. "Clock" means moving the pinned demo
clock in Demo controls, or `?clock=<ISO instant>` in the URL (e.g. `?clock=2026-11-01T12:30:00%2B05:30`
opens the October review).

Last verified: Sprint 6, in Chrome at 390 px and 1440 px, no console errors.

| # | Screen | Route / entry | State | How to see it |
| --- | --- | --- | --- | --- |
| 1 | Winter Arc intro | `/winter-arc/setup` | Default | `no-arc`, then open setup |
| | | | Returning user ("Welcome back") | `returning`, then open setup |
| 2 | Choose template | setup step 2 | Default (Winter Arc preselected) | `no-arc` |
| | | | Previous arc available | `returning` (Copy from previous arc) |
| 3 | Edit habits list | setup step 3 | 3 habits / 10 (max, Add hidden) / validation error | Default template = 10; remove to 2 → "Add at least 3 habits" |
| 4 | Habit editor sheet | setup step 3, Arc settings | Each habit type | Edit any habit, switch Type |
| | | | Locked fields after Day 3 | `day23` → Arc settings → edit a habit |
| 5 | Dates and threshold | setup step 4 | Future start | Pick "1st" or a later date |
| | | | Mid-month start | Pick "Today" (23 Oct) → shorter first chapter note |
| 6 | My Why and targets | setup step 5 | Empty (error) / filled | Continue with < 10 characters |
| 7 | Body check | setup step 6; monthly review | Day 1 | Setup step 6 |
| | | | Chapter end | Monthly review → end-of-chapter body check |
| | | | Skipped | "Skip for now" → one-time nudge → "Skip anyway" |
| 8 | Commitment | setup step 7 | Default | Type a name, or hold "Hold to commit" 1.5 s |
| 9 | Today | `/winter-arc/today` | Pre-arc countdown | `countdown` |
| | | | Empty | `day-1` |
| | | | Partial | `day23` |
| | | | All done | `all-done` |
| | | | At risk / shielded / broken | `at-risk` / `shielded` / `broken` |
| | | | Rest day | `sunday` (MMA Rest); all-Rest day shows "Recovery day" |
| | | | Sick day | `sick-today`, or "Use a sick day" |
| | | | Offline | Turn the network off → "Offline · saved on this device" |
| | | | Yesterday open (banner) | `yesterday-unlogged` → "Log yesterday" |
| 10 | Status sheet | Tap a habit row | Each habit type | Yes/no, count keypad, time, session, checklist; No P shows Done/Missed only |
| 11 | Close the day | Today → "Close the day" | Strong / weak / streak broken | `all-done` (strong); `day23` (weak); `at-risk` then leave weak (broken) |
| 12 | Month tracker | `/winter-arc/tracker` | Current month / past month / locked days | `day23`; clock to 2 Nov for a past October; days before yesterday are locked |
| 13 | Day Detail | Tap a tracker row or heatmap day | Editable / locked / sick | `yesterday-unlogged` → 22 Oct; `day23` → 22 Oct; `day23` → 9 Oct |
| 14 | Dashboard | `/winter-arc/dashboard` | Day 1–6 (insights locked) | `day-1` |
| | | | Normal | `day23` |
| | | | Chapter filter | Arc / October / November / December |
| 15 | Habit Detail | Dashboard → tap a habit bar (`?habit=`) | Each habit type | Count and time habits add a chart |
| 16 | Weekly summary | `/winter-arc/reports` → a week | Reflection empty / filled | `day23` → Week 3 → save win and fix |
| 17 | Monthly review | `/winter-arc/reports` → October review | Body check pending / complete | `day23`, clock to 1 Nov 12:00 → save the end check |
| 18 | Notification settings | Arc settings → Notifications | Default | Any scenario with an arc |

Out of MVP (Phase 2/3, MASTER_DOC §18): rank ladder and badge wall (#19), weekly challenge card (#20), arc final
report and share card (#21), squads and leaderboard (#22).
