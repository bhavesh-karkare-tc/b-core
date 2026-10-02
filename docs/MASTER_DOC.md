# B-Core Winter Arc Module — Master Document

Oct 2, 2026 · @Bhavesh Karkare

## 1. Overview

Winter Arc is a 92-day personal discipline challenge inside B-Core: the user logs up to 10 daily habits, earns points and streaks, and sees detailed progress reports. It turns the printed Winter Arc tracker sheet into a web and mobile module.

**Problem.** Paper trackers and generic habit apps record ticks but do not create pressure to keep going. Users drop off after 2 to 3 weeks because missed days feel final, progress is invisible, and nothing rewards consistency.

**Vision.** Logging takes under 10 seconds a day. The challenge layer (points, streaks, ranks, weekly challenges) makes the user want to come back. The dashboard shows exactly what is working and what is not.

**Scope of this document.**

- In scope: challenge setup, daily logging, scoring and streaks, game layer, dashboard, reports, notifications, data model, rules, test cases, roadmap.
- Out of scope for v1: social squads and leaderboards, wearable integrations, paid features. These are covered as later phases.

**Default challenge (from the tracker sheet).** 92 days, split into three monthly chapters: October, November, December. The 10 default habits are listed in section 4.

## 2. Goals, principles and success metrics

The module succeeds if users log daily, finish the 92 days, and can explain their own progress from the dashboard.

**Product goals**

1. Track daily tasks with near-zero friction.
2. Make it feel like a challenge: competitive, goal-driven, with something to lose and something to win.
3. Show progress in detail: dashboard, analytics, weekly and monthly reports, final arc report.

**Design principles**

- **10-second log.** Every daily action is one tap. Typing is optional.
- **Honest by design.** Limited edit window, no backfilling weeks later, missed days count.
- **Forgiving, not soft.** One miss is a warning, two misses break the streak (never miss two).
- **Progress is always visible.** Every screen shows where the user stands in the arc.
- **Same logic on web and mobile.** Mobile is for logging, web is for deep analysis; both show identical data.

**Success metrics**

| Metric | Definition | Target (v1) |
| --- | --- | --- |
| Daily log rate | Days with at least one habit logged / days since start | 80% or more |
| Day-30 retention | Users still logging on day 30 / users who started | 50% or more |
| Arc completion | Users who log on day 92 / users who started | 30% or more |
| Average daily score | Mean daily score across active users | 70 / 100 or more |
| Time to log | Median time from opening Today to closing the day | Under 10 seconds |
| Report views | Users who open the weekly summary / active users that week | 60% or more |

Targets are starting assumptions; revisit them after the first full arc.

## 3. Users, personas and assumptions

The primary user is a self-driven individual running a 3-month self-improvement challenge, who logs on mobile and reviews on web.

| Persona | Who | Main need | Main risk |
| --- | --- | --- | --- |
| The Committer (primary) | 18 to 30, trains (e.g. MMA), wants body and discipline gains | Fast daily log, visible streak, hard rules | Quits after first broken streak |
| The Analyst | Likes numbers, reviews weekly | Deep dashboard, patterns, trends | Logs late or backfills to fix numbers |
| The Restarter | Has failed challenges before | Forgiveness tools, small wins | Shame after misses, stops opening the app |

**Assumptions**

- One active Winter Arc per user at a time.
- Default timezone = the user's device timezone at setup; the day ends at local midnight.
- Competition in v1 is against the user's own past (self-competition). Squads and leaderboards come in Phase 3, pending the open question in section 18.
- Users can be on web and mobile; data syncs in real time.
- Language: English UI first; Hindi/Hinglish labels are a later option.

## 4. Core concepts and glossary

Every feature is built from five objects: Arc, Chapter, Habit, Day Log and Habit Entry.

| Term | Meaning |
| --- | --- |
| Arc | One full challenge run. Default 92 days (1 Oct to 31 Dec). |
| Chapter | One calendar month inside an arc. Has its own targets, body check and review. |
| Habit | One daily task with a type, schedule, minimum version, category and points. |
| Day Log | Everything the user records for one date: habit entries, journal line, mood. |
| Habit Entry | The status of one habit on one date. |
| Status | Done, Minimum, Missed, Rest, Sick, or Unlogged (before cutoff). |
| Daily score | Points earned that day, scaled to 100. |
| Perfect day | Daily score of 100. |
| Strong day | Daily score of 80 or more (default; user can set 60 to 100). |
| Arc streak | Consecutive strong days. |
| Habit streak | Consecutive days a single habit was Done, Minimum or Rest. |
| Shield | Earned token that protects a streak from one missed day. |
| Rank | Level earned from total arc points. |
| Lock | Habits cannot be removed after Day 3 of the arc. |
| Cutoff | Yesterday can be edited until 12:00 noon today; after that, unlogged = Missed. |

**Habit types**

| Type | Input | Auto-complete rule | Default examples |
| --- | --- | --- | --- |
| Yes/No | One tap | Done when tapped | No Junk, Skin Care, No P, No Phone at Meals |
| Count | Number with quick +buttons | Done when value reaches target | 3L Water (ml), 10k Steps Outside, Read 10 Pages |
| Time | Time picker or one tap | Done if logged time is at or before target | Phone Off by 12 AM |
| Session | One tap + optional duration | Done when tapped; duration stored | MMA Training |
| Checklist | Sub-items | Done when all sub-items ticked | Top 3 Tasks Done |

**Default habits (from the tracker sheet)**

| # | Habit | Type | Category | Minimum version (editable) | Schedule |
| --- | --- | --- | --- | --- | --- |
| 1 | 3L Water | Count (3000 ml) | Body | 2L | Daily |
| 2 | No Junk | Yes/No | Body | One junk item only | Daily |
| 3 | Phone Off by 12 AM | Time (00:00) | Discipline | Off by 12:30 AM | Daily |
| 4 | MMA Training | Session | Body | 15 min shadow boxing | Mon to Sat; Sunday = Rest |
| 5 | 10k Steps Outside | Count (10,000) | Body | 6,000 steps | Daily |
| 6 | Read 10 Pages | Count (10) | Mind | 3 pages | Daily |
| 7 | No Phone at Meals | Yes/No | Discipline | 2 of 3 meals | Daily |
| 8 | Top 3 Tasks Done | Checklist (3) | Mind | 1 of 3 | Daily |
| 9 | Skin Care | Yes/No | Body | Face wash only | Daily |
| 10 | No P | Yes/No | Discipline | No minimum (Done or Missed only) | Daily |

## 5. Feature map

The module has seven features; Daily Logging feeds Scoring, and Scoring feeds every other feature.

&#91;embedded content: feature map · 7 features\]

Every tap in Daily Logging updates Scoring, which powers the game layer, dashboard and reports; notifications use streak state to bring the user back.

| ID | Feature | Purpose | Release |
| --- | --- | --- | --- |
| F1 | Challenge Setup | Create the arc, habits, targets, baseline | MVP |
| F2 | Daily Logging | Record habit status every day in under 10 seconds | MVP |
| F3 | Scoring and Streaks | Turn logs into points, streaks, never-miss-two state | MVP |
| F4 | Game Layer | Ranks, badges, weekly challenge, self-competition, squads | Phase 2 and 3 |
| F5 | Dashboard and Analytics | Show where the user stands and why | MVP (core), Phase 2 (insights) |
| F6 | Reports | Weekly, monthly and arc-final summaries | MVP (weekly, monthly), Phase 2 (arc card) |
| F7 | Notifications | Reminders, streak risk, report alerts | MVP |

## 6. F1 Challenge Setup

Setup takes under 3 minutes with the default template and ends on the Today screen with Day 1 ready to log.

&#91;embedded content: setup flow · 8 steps, 1 decision\]

A future start date sends the user to a countdown; otherwise setup lands directly on Today with Day 1 ready to log.

**Entry points**

- B-Core home card "Start your Winter Arc" when no arc is active.
- Deep link from a notification or a shared invite (Phase 3).

**Steps and micro requirements**

1. **Intro screen.** Explains the arc in 3 cards: 92 days, 10 habits, never miss two. CTA: "Start my arc". Secondary: "How scoring works".
2. **Choose template.** Options: Winter Arc default (10 habits above), Blank, or Copy from previous arc. Default is preselected.
3. **Edit habits.**
   1. List of habits, each editable: name (max 30 characters), type, target, unit, category, minimum version, schedule, reminder time.
   2. Minimum 3 habits, maximum 10. Add button hides at 10.
   3. Drag to reorder; order = display order on Today and in reports.
   4. Schedule options: every day, specific weekdays, or X days per week. Unscheduled days show as Rest automatically.
   5. A habit with "No minimum" can only be Done or Missed.
4. **Dates.** Start date (default: next 1st of month, or today), duration (30, 60 or 92 days; default 92). Chapters are created per calendar month. Mid-month start = first chapter is shorter.
5. **Strong-day threshold.** Default 80; slider 60 to 100. Explained as "days at or above this keep your streak".
6. **My Why and targets.** My Why: up to 3 lines, required (min 10 characters). Chapter target: free text, optional.
7. **Body check (Day 1 baseline).** Weight (kg), waist (cm), max push-ups, energy (1 to 10), optional photo. All optional, but skipping shows a one-time nudge.
8. **Commitment screen.** Shows the rules (lock after Day 3, cutoff at noon, never miss two). User signs by typing their name or long-pressing "I commit".
9. **Confirmation.** Arc created; land on Today. If start date is in the future, show a countdown and a pre-arc checklist.

**Rules**

- Habits can be edited freely until the end of Day 3. After that: rename and reminder time only; type, target and schedule are locked.
- A habit can be paused after lock only with a reason (injury, illness); paused days count as Rest and are labelled in reports.
- Only one active arc. Starting a new one requires ending or abandoning the current one (with confirmation).
- Abandoning keeps all data as a read-only past arc.

**Empty, loading and error states**

- No template loaded: show Blank template with a retry banner.
- Save fails: keep the form, show inline error, retry button; never lose entered data.
- Offline: setup can complete offline; sync on reconnect.

## 7. F2 Daily Logging (Today)

The Today screen is the home of the module: the user opens it, taps each habit, and closes the day in under 10 seconds.

&#91;embedded content: daily logging flow · user actions, then cutoff\]

The top row is what the user does; the bottom row runs automatically at noon the next day and feeds streaks, shields and reports.

**Today screen layout (top to bottom)**

1. Header: "Day 23 of 92", date, chapter name, arc progress bar.
2. Score ring: today's score so far (out of 100), streak count with flame, streak state badge (Safe, At risk, Shielded).
3. Habit list in user order. Each row: number, name, category colour, current status, quick action.
4. Weekly challenge card (Phase 2).
5. Close the day: one-line journal, mood/energy 1 to 5, "Close day" button.

**Habit row interactions**

| Habit type | Tap | Long press / expand | Other |
| --- | --- | --- | --- |
| Yes/No | Toggle Done / not logged | Status sheet: Done, Minimum, Missed | Swipe left = Missed |
| Count | +1 step (e.g. +250 ml, +1,000 steps, +1 page) | Number keypad | Auto-Done at target; Minimum if at or above minimum value at day end |
| Time | Logs current time | Time picker | Done if at or before target time |
| Session | Done | Duration and note | On Rest days shows REST, tap disabled |
| Checklist | Opens sub-items | Edit item text | Done when all ticked; Minimum at minimum count |

**Status rules**

- Statuses: Done, Minimum (half credit), Missed, Rest (scheduled off day), Sick (sick day), Unlogged.
- Rest is set automatically from the schedule and cannot be changed by the user.
- Unlogged habits become Missed at the cutoff (12:00 noon the next day).
- Count habits below minimum at cutoff become Missed; between minimum and target become Minimum.
- A habit marked Missed by the user can be changed until cutoff.

**Edit window**

- Today: fully editable until cutoff tomorrow at noon.
- Yesterday: editable until today 12:00 noon. A banner on Today says "Yesterday has 2 unlogged habits, 3h left".
- Older days: read-only. Tapping shows "Locked, logs close at noon the next day".

**Close the day**

- Optional, but encouraged by an evening notification.
- Shows a summary: score, habits done, streak effect ("Streak safe, 9 days").
- Journal: max 140 characters. Mood/energy: 1 to 5.
- Closing does not lock the day; the cutoff does.

**Sick day**

- 3 sick days per 92-day arc (scaled: 1 per 30 days).
- Marks all habits as Sick: score is not counted, streak is frozen (neither grows nor breaks).
- Must be used before cutoff; cannot be applied to already Missed days.

**States**

- Before arc start: countdown and pre-arc checklist.
- Rest-heavy day: show "Recovery day" header.
- All done: celebration animation once per day, then calm state.
- Offline: logs saved locally with a sync badge; conflicts resolve to the latest timestamp.

## 8. F3 Scoring and Streaks

Every day gets a score out of 100; a day at or above the strong-day threshold (default 80) keeps the arc streak alive, and only two weak days in a row break it.

**Points per habit entry**

| Status | Points | Counts in denominator |
| --- | --- | --- |
| Done | 10 | Yes |
| Minimum | 5 | Yes |
| Rest | 10 | Yes |
| Missed | 0 | Yes |
| Sick | Not counted | No |
| Unlogged (before cutoff) | 0, shown as pending | Yes |

**Daily score**

```latex
\text{Daily score} = \frac{\sum \text{points earned}}{10 \times \text{counted habits}} \times 100
```

Rounded to the nearest whole number. With 10 habits, each Done adds 10 and each Minimum adds 5. Example: 7 Done, 1 Minimum, 1 Rest, 1 Missed = 70 + 5 + 10 + 0 = 85.

**Other scores**

- Weekly score = sum of daily scores Monday to Sunday (max 700). Shown also as an average.
- Chapter score = sum of daily scores in the month (max 100 x days in month).
- Arc points = sum of all daily scores + bonus points (weekly challenge, badges). Used for rank only.
- Habit completion % = (Done + Rest + 0.5 x Minimum) / scheduled days so far.

**Arc streak: never miss two**

&#91;embedded content: arc streak states · 4 states\]

A single weak day only puts the streak At risk; the next day decides whether it recovers, is shielded, or breaks.

- Strong day (score at or above threshold) = streak +1, state Safe.
- First weak day = streak holds (does not grow), state At risk. Banner: "One weak day. Don't miss two."
- Second consecutive weak day = streak broken, reset to 0, unless a shield is held.
- Shield held = it is used automatically on the second weak day; streak holds, state Shielded for that day.
- Sick day = streak frozen; does not count as weak.
- Best streak is stored per arc and per chapter.

**Shields**

- Earn 1 shield for every 7 consecutive strong days.
- Hold max 2 at a time.
- Shown on Today and the dashboard; cannot be bought or transferred.

**Habit streaks**

- Each habit has its own streak: Done, Minimum or Rest = +1; one Missed = at risk; two Missed in a row = reset.
- Rest days never break or grow a habit streak (they hold it).
- Longest habit streak per chapter appears in the monthly review.

**Recalculation**

- Any edit before cutoff recalculates that day, the week, the chapter, the arc streak from that day forward, and shields.
- After cutoff, scores are final and stored as a snapshot (used by reports).

## 9. F4 Game Layer

The game layer gives the user something to chase every day (score), every week (weekly challenge, beat last week) and across the arc (rank, badges); v1 competition is against the user's own past.

**Ranks (by total arc points)**

| Rank | Arc points needed | Roughly equals |
| --- | --- | --- |
| Recruit | 0 | Start |
| Fighter | 1,000 | About 2 weeks at 70 |
| Contender | 2,500 | About 1 month at 80 |
| Warrior | 4,500 | About 2 months at 80 |
| Champion | 6,500 | About 80 days at 80 |
| Legend | 8,000 | Near-perfect full arc |

- Rank never goes down. Rank-up triggers a full-screen moment and a badge.
- Today and dashboard show "420 points to Contender".
- Thresholds assume a 92-day arc; scale linearly for 30 and 60 days.

**Badges (milestones)**

| Group | Badges |
| --- | --- |
| Time | Day 1, Day 7, Day 21, Day 30, Day 60, Day 92 (Arc Complete) |
| Perfection | First perfect day, perfect week (7 x 100), 3 perfect weeks |
| Habit | 30-day streak on any habit; named badges per default habit (e.g. "Clean Fuel" for No Junk 30 days) |
| Comeback | Rebuilt a 7-day streak after a break; used a shield and finished the week strong |
| Body | Logged all 4 body checks; improved any body metric from Day 1 |

- Badges are earned once per arc; badge wall shows locked badges with the rule.
- No badge for logging volume alone; every badge needs real consistency.

**Weekly challenge**

- Every Monday a bonus challenge appears, e.g. "5 cold showers this week", "2 extra MMA sessions", "Read 100 pages".
- User can accept or skip by Tuesday noon. Accepted + completed = +150 bonus arc points. Accepted + failed = 0 (no penalty).
- Source: curated list (v1); personalised by weakest habit (Phase 2).
- Progress tracked as a sub-item on Today; does not affect the daily score.

**Self-competition (ghost)**

- "You vs last week": live bar comparing this week's cumulative score to the same weekday last week.
- "You vs last chapter": chapter average and best streak side by side.
- "Personal records": best day, best week, longest streak, longest habit streak; a new record shows a PR tag.

**Squads and leaderboard (Phase 3, optional)**

- Squad = 2 to 8 friends running arcs in the same period.
- Leaderboard ranks by consistency % (strong days / days elapsed), not raw points, so different habit sets compare fairly.
- Squad feed shows only milestones and streaks, never journal or body data.
- Nudge button: one nudge per member per day.
- Privacy: user chooses visible fields; default = rank, streak, consistency %.

## 10. F5 Dashboard and Analytics

The dashboard answers three questions in order: where am I, what is working, and what should I fix this week.

**Section A: Where am I (top, always visible)**

| Widget | Shows | Interaction |
| --- | --- | --- |
| Arc progress | Day X of 92, % elapsed, chapter tabs | Tap chapter to filter all widgets |
| Score summary | Today, this week (avg), chapter (avg), arc (avg) | Tap opens trend chart |
| Streak card | Current streak, best streak, state, shields held | Tap opens streak history |
| Rank card | Current rank, points, points to next rank | Tap opens rank ladder |

**Section B: What is working**

| Widget | Shows | Interaction |
| --- | --- | --- |
| Heatmap calendar | Every day of the arc coloured by score (5 levels) | Tap a day opens Day Detail |
| Habit completion | Per habit: completion %, current streak, best streak; sorted weakest first | Tap habit opens Habit Detail |
| Category balance | Body / Mind / Discipline completion % | Tap filters habit list |
| Score trend | Daily score line with 7-day average; strong-day threshold as a reference line | Range: week, chapter, arc |
| Body metrics | Weight, waist, push-ups, energy at each body check | Add new check |

**Section C: What to fix (insights)**

- Weakest habit this week and its trend vs last week.
- Day-of-week pattern: "Your Saturday average is 61, 22 below your weekday average."
- Habit links (Phase 2): "On days you hit Phone Off by 12 AM, MMA Training is done 90% of the time vs 55% otherwise." Shown only with at least 14 days of data and a difference of 20 points or more.
- Minimum overuse: "Read 10 Pages was Minimum 9 of 14 days. Consider a reachable target next chapter."
- Streak risk: "You are At risk today. Score 80 to stay safe."

**Habit Detail screen**

- Monthly mini-calendar for that habit (Done, Minimum, Missed, Rest, Sick).
- Completion % by week, current and best streak, Minimum count.
- For Count habits: daily value chart against target (e.g. ml of water).
- For Time habits: logged time distribution against target time.

**Day Detail screen**

- All habit entries, score, journal, mood, streak effect, edit button (only within window).

**Web vs mobile**

- Mobile: Section A + heatmap + habit completion; others behind "More insights".
- Web: full dashboard in a 12-column grid; filters by chapter and category; export button (Phase 2).

**Data rules**

- Insights use only finalised days (after cutoff) except Today and streak risk.
- Empty state (Day 1 to 6): show "Insights unlock after 7 days" with a progress bar.

## 11. F6 Reports

Reports are generated automatically from finalised days: weekly every Monday at noon, monthly on the 1st at noon, and the arc report on Day 93 at noon; the user only adds reflections.

&#91;embedded content: report generation · 3 report types\]

All three reports read the same finalised day snapshots, so numbers always match the dashboard and the heatmap.

**Report types**

| Report | Generated | Auto-filled content | User adds | Format |
| --- | --- | --- | --- | --- |
| Weekly summary | Monday 12:00 (after Sunday cutoff) | Weekly score and avg, vs last week, strong days, best and weakest habit, streak change, weekly challenge result | One-line win, one-line fix | In-app card + notification |
| Monthly review | 1st of month 12:00 | Chapter score / max, best streak, strongest and weakest habit, habit-wise totals, body check delta, badges earned, day-of-week pattern | Biggest win, fix this, next chapter target, end body check | In-app page; PDF export (Phase 2) |
| Arc final report | Day 93 12:00 | Total arc points, rank, completion %, best streak, all chapter scores, habit leaderboard, body Day 1 vs Day 92, badge wall, journal highlights | Final reflection, "next arc" plan | In-app page + shareable image card (Phase 2) |

**Rules**

- Reports are snapshots: later data changes do not alter a generated report.
- If a reflection is skipped, the report still saves; a reminder appears once after 24 hours.
- Monthly review triggers the end body check prompt; if skipped, body delta shows "Not logged".
- The printable monthly sheet (current paper tracker) can be exported from the monthly review (Phase 2).
- Shareable card hides journal, body numbers and No P by default; user can toggle each.

**Report history**

- List of all past reports per arc, newest first.
- Past arcs remain readable forever; compare two arcs side by side (Phase 3).

## 12. F7 Notifications

Notifications are capped at 4 per day by default, and each one opens the exact screen where the user can act.

| Notification | Trigger | Default time | Opens | Example copy |
| --- | --- | --- | --- | --- |
| Morning plan | Every day | 07:00 | Today | "Day 23. 10 habits, 1 weekly challenge. Let's go." |
| Habit reminder | Per habit reminder time, if not logged | User-set | Habit row | "15 min to Phone Off by 12 AM." |
| Close the day | Habits unlogged at evening time | 21:30 | Close-day sheet | "4 habits left. Close your day." |
| Streak at risk | Yesterday weak, today not strong yet | 18:00 | Today | "Yesterday was weak. Don't miss two." |
| Cutoff warning | Yesterday has unlogged habits | 09:00 | Yesterday | "3h left to log yesterday." |
| Report ready | Weekly / monthly / arc report generated | On generation | Report | "Your Week 3 summary is ready. Score up 8%." |
| Milestone | Rank-up, badge, record | Instant (in-app); push batched | Celebration | "New rank: Contender." |
| Weekly challenge | Monday | 08:00 | Challenge card | "This week: 5 cold showers. Accept?" |

**Rules**

- Quiet hours default 23:00 to 07:00, except habit reminders the user set inside that window (e.g. Phone Off by 12 AM).
- Daily cap 4 push notifications; priority order: streak at risk, cutoff warning, habit reminders, everything else.
- If the day is already closed and strong, skip close-the-day and streak notifications.
- Every type can be toggled individually in settings.
- Tone: short, direct, never shaming. No "You failed" copy.

## 13. Screen inventory

The module needs 18 screens and sheets for MVP; this list is the wireframing checklist.

| # | Screen | Feature | Platform | States to wireframe | Release |
| --- | --- | --- | --- | --- | --- |
| 1 | Winter Arc intro | F1 | Both | Default, returning user | MVP |
| 2 | Choose template | F1 | Both | Default, previous arc available | MVP |
| 3 | Edit habits list | F1 | Both | 3 habits, 10 habits (max), validation error | MVP |
| 4 | Habit editor sheet | F1 | Both | Each habit type, locked fields after Day 3 | MVP |
| 5 | Dates and threshold | F1 | Both | Future start, mid-month start | MVP |
| 6 | My Why and targets | F1 | Both | Empty, filled | MVP |
| 7 | Body check | F1, F6 | Both | Day 1, chapter end, skipped | MVP |
| 8 | Commitment | F1 | Both | Default | MVP |
| 9 | Today | F2, F3 | Mobile first | Pre-arc countdown, empty, partial, all done, at risk, shielded, rest day, sick day, offline | MVP |
| 10 | Status sheet (long press) | F2 | Mobile | Each habit type | MVP |
| 11 | Close the day | F2 | Both | Strong day, weak day, streak broken | MVP |
| 12 | Month tracker grid | F2, F5 | Both | Current month, past month, locked days | MVP |
| 13 | Day Detail | F5 | Both | Editable, locked, sick | MVP |
| 14 | Dashboard | F5 | Both (web full) | Day 1 to 6 (insights locked), normal, chapter filter | MVP |
| 15 | Habit Detail | F5 | Both | Each habit type | MVP |
| 16 | Weekly summary | F6 | Both | Reflection empty, filled | MVP |
| 17 | Monthly review | F6 | Both | Body check pending, complete | MVP |
| 18 | Notification settings | F7 | Both | Default | MVP |
| 19 | Rank ladder and badge wall | F4 | Both | Locked, earned, rank-up moment | Phase 2 |
| 20 | Weekly challenge card | F4 | Both | Offered, accepted, done, failed | Phase 2 |
| 21 | Arc final report + share card | F6 | Both | Generated, shared | Phase 2 |
| 22 | Squad and leaderboard | F4 | Both | No squad, invite, active | Phase 3 |

**Navigation (inside B-Core)**

- Module tabs: Today, Tracker, Dashboard, Reports.
- Setup is a full-screen flow outside the tabs.
- Settings (habits, notifications, abandon arc) from the module header menu.

## 14. Data model

Ten entities cover MVP and Phase 2; scores are stored as finalised snapshots so reports never change after cutoff.

| Entity | Key fields | Relations |
| --- | --- | --- |
| Arc | id, user\_id, start\_date, end\_date, duration\_days, timezone, strong\_threshold, my\_why, status (upcoming, active, completed, abandoned), locked\_at, sick\_days\_total, sick\_days\_used, created\_at | has many Chapter, Habit, DayLog |
| Chapter | id, arc\_id, month, start\_date, end\_date, target\_text, review\_win, review\_fix, score\_total, best\_streak | belongs to Arc |
| Habit | id, arc\_id, order, name, type (yesno, count, time, session, checklist), target\_value, unit, minimum\_value, minimum\_text, category (body, mind, discipline), schedule (daily, weekdays\[\], per\_week), reminder\_time, status (active, paused), version | belongs to Arc; has many HabitEntry |
| HabitVersion | id, habit\_id, valid\_from, name, target\_value, minimum\_value, schedule | keeps history when edits happen |
| DayLog | id, arc\_id, date, day\_number, score, is\_strong, is\_sick, journal, mood, closed\_at, finalised\_at | has many HabitEntry |
| HabitEntry | id, day\_log\_id, habit\_id, status (done, minimum, missed, rest, sick, unlogged), value, logged\_time, duration\_min, updated\_at, source (manual, auto, cutoff) | belongs to DayLog, Habit |
| StreakState | arc\_id, current, best, state (safe, at\_risk, shielded, broken), shields\_held, last\_strong\_date | one per Arc |
| BodyCheck | id, arc\_id, date, weight\_kg, waist\_cm, pushups\_max, energy, photo\_url | belongs to Arc |
| Report | id, arc\_id, type (weekly, monthly, arc), period\_start, period\_end, snapshot\_json, reflection\_json, generated\_at | belongs to Arc |
| Achievement | id, arc\_id, kind (rank, badge, record, weekly\_challenge), code, earned\_at, points | belongs to Arc |

**Key API endpoints (indicative)**

- POST /arcs, GET /arcs/active, PATCH /arcs/{id} (abandon, threshold before lock)
- GET /arcs/{id}/days/{date}, PUT /arcs/{id}/days/{date}/entries/{habit\_id}
- POST /arcs/{id}/days/{date}/close, POST /arcs/{id}/days/{date}/sick
- GET /arcs/{id}/dashboard?chapter=, GET /arcs/{id}/habits/{habit\_id}/stats
- GET /arcs/{id}/reports, PATCH /reports/{id}/reflection

**Jobs**

- Cutoff job: every hour, finalises days where local time passed noon of the next day; converts unlogged to Missed; recomputes streak and shields.
- Report job: runs after cutoff job on Monday, 1st of month, and Day 93.
- Notification scheduler: per user timezone.

## 15. Business rules and edge cases

Each edge case below has one defined behaviour so design, development and QA agree before build.

| # | Situation | Behaviour |
| --- | --- | --- |
| E1 | User starts mid-month (e.g. 15 Oct) | Chapter 1 = 15 to 31 Oct; chapter max score uses 17 days; arc still 92 days unless changed |
| E2 | User changes timezone while travelling | Arc keeps its setup timezone for day boundaries; a setting allows switching once per chapter |
| E3 | Device clock is wrong | Server time decides cutoff and day number; client shows server date |
| E4 | User logs offline for 2 days | Logs sync with original timestamps; entries after cutoff (server time) are rejected with a message and stay Missed |
| E5 | Same habit edited on web and mobile | Latest updated\_at wins; the other device refreshes |
| E6 | User wants to remove a habit after Day 3 | Not allowed; can pause with a reason; paused days = Rest, labelled "Paused" in reports |
| E7 | User edits target after lock | Not allowed; target change only at a new chapter start, stored as a HabitVersion |
| E8 | All habits are Rest on a day | Score = 100, day counts as strong, labelled "Recovery day" |
| E9 | Sick days exhausted | Sick option hidden; tooltip explains the limit |
| E10 | Sick day on top of a weak day | Not allowed retroactively once cutoff passed |
| E11 | Second weak day with a shield | Shield used automatically; notification explains; shields\_held minus 1 |
| E12 | Count habit logged above target | Done; value stored; no extra points |
| E13 | Time habit with no log by cutoff | Missed |
| E14 | Checklist with fewer items filled than required | Minimum if at minimum count, else Missed |
| E15 | User abandons arc on day 40 | Confirmation with consequences; arc becomes read-only; reports up to day 40 kept; no arc report |
| E16 | User reinstalls the app | All data restored from server; local unsynced logs lost (warn on logout) |
| E17 | Day 92 is a Rest day for a habit | Normal Rest; arc completes at Day 92 cutoff |
| E18 | Threshold changed | Allowed only before lock; never retroactive |
| E19 | Leap year or 30-day months | Chapters follow the calendar; scores scale to actual days |
| E20 | User opens app after 5 days away | Shows what happened (missed days, streak broken), no shame copy, "Restart strong today" CTA |

## 16. Test cases

50 test cases cover every feature; P1 cases must pass before MVP release.

| ID | Feature | Scenario | Steps / input | Expected result | Priority |
| --- | --- | --- | --- | --- | --- |
| TC01 | F1 | Create arc with default template | Intro, accept defaults, commit | Arc with 10 habits, 92 days, 3 chapters; lands on Today | P1 |
| TC02 | F1 | Fewer than 3 habits | Delete habits until 2 remain, continue | Blocked with "Add at least 3 habits" | P1 |
| TC03 | F1 | More than 10 habits | Try adding an 11th | Add button hidden at 10 | P1 |
| TC04 | F1 | Habit name too long | Enter 31 characters | Input stops at 30 | P2 |
| TC05 | F1 | Empty My Why | Leave blank, continue | Inline error, min 10 characters | P2 |
| TC06 | F1 | Future start date | Start date tomorrow | Today shows countdown; logging disabled | P1 |
| TC07 | F1 | Mid-month start | Start 15 Oct | Chapter 1 = 17 days; max chapter score 1,700 | P1 |
| TC08 | F1 | Edit after lock | Day 4, change target of 3L Water | Target field disabled; rename allowed | P1 |
| TC09 | F1 | Second arc while one active | Start new arc | Asked to end or abandon current first | P1 |
| TC10 | F1 | Setup offline | Complete setup with no network | Arc saved locally; syncs on reconnect | P2 |
| TC11 | F2 | Yes/No tap | Tap No Junk | Status Done; score updates instantly | P1 |
| TC12 | F2 | Count quick add | Tap +250 ml 12 times on 3L Water | Value 3000; auto Done | P1 |
| TC13 | F2 | Count between minimum and target | Water 2,400 ml at cutoff | Minimum (5 points) | P1 |
| TC14 | F2 | Count below minimum | Water 1,500 ml at cutoff | Missed | P1 |
| TC15 | F2 | Time habit on time | Log Phone Off at 23:50 | Done | P1 |
| TC16 | F2 | Time habit late | Log Phone Off at 00:20 | Minimum (within 12:30 AM minimum) | P1 |
| TC17 | F2 | Time habit very late | Log Phone Off at 01:10 | Missed | P2 |
| TC18 | F2 | Rest day | Open Today on a Sunday | MMA Training shows REST, tap disabled, 10 points | P1 |
| TC19 | F2 | No-minimum habit | Long press No P | Only Done and Missed shown | P1 |
| TC20 | F2 | Edit yesterday before cutoff | 10:00 next day, mark Skin Care Done | Saved; yesterday's score and streak recalculated | P1 |
| TC21 | F2 | Edit yesterday after cutoff | 12:05 next day | Read-only with lock message | P1 |
| TC22 | F2 | Unlogged at cutoff | Leave Read 10 Pages blank | Becomes Missed at noon, source = cutoff | P1 |
| TC23 | F2 | Sick day | Tap Sick day before cutoff | All habits Sick; score excluded; streak frozen; sick days used +1 | P1 |
| TC24 | F2 | Sick day limit | Use 4th sick day in 92-day arc | Option hidden | P2 |
| TC25 | F2 | Journal limit | Type 141 characters | Input stops at 140 | P3 |
| TC26 | F2 | Offline logging | Log 5 habits offline, reconnect | All 5 sync; score matches | P1 |
| TC27 | F2 | Web + mobile conflict | Edit same habit on both within 5 s | Latest timestamp wins; both show the same | P2 |
| TC28 | F3 | Score formula | 7 Done, 1 Minimum, 1 Rest, 1 Missed | Score 85 | P1 |
| TC29 | F3 | Score with sick | Sick day | No score; day not weak, not strong | P1 |
| TC30 | F3 | Strong day | Score 80, threshold 80 | Strong; streak +1 | P1 |
| TC31 | F3 | First weak day | Score 70 after strong streak of 5 | Streak stays 5; state At risk | P1 |
| TC32 | F3 | Two weak days, no shield | Score 70 then 60 | Streak 0; state Broken; best streak kept | P1 |
| TC33 | F3 | Two weak days, shield held | Same, with 1 shield | Shield used; streak holds; shields 0 | P1 |
| TC34 | F3 | Shield earning | 7 consecutive strong days | Shields +1 | P1 |
| TC35 | F3 | Shield cap | 21 strong days with no use | Shields stay at 2 | P2 |
| TC36 | F3 | Recalculation | Change yesterday from weak to strong before cutoff | Streak and state update from yesterday forward | P1 |
| TC37 | F3 | Habit streak with rest | Done Mon to Sat, Rest Sun, Done Mon | MMA streak 7 (Rest holds, does not add) | P2 |
| TC38 | F4 | Rank-up | Arc points pass 1,000 | Rank Fighter; celebration once | P2 |
| TC39 | F4 | Badge once | Earn Day 7 badge, then reach Day 7 data again via recalculation | Badge not duplicated | P2 |
| TC40 | F4 | Weekly challenge done | Accept and complete | +150 bonus arc points; daily score unchanged | P2 |
| TC41 | F4 | Weekly challenge failed | Accept and fail | 0 points, no penalty | P3 |
| TC42 | F5 | Heatmap colours | Days with 100, 85, 60, 30, Sick | 5 correct shades, Sick shown distinctly | P1 |
| TC43 | F5 | Insights locked | Day 3 | "Insights unlock after 7 days" | P2 |
| TC44 | F5 | Habit completion % | 10 scheduled days: 6 Done, 2 Minimum, 2 Missed | 70% | P1 |
| TC45 | F5 | Chapter filter | Select November | All widgets show November only | P2 |
| TC46 | F6 | Weekly report timing | Sunday cutoff passes Monday noon | Report generated, notification sent | P1 |
| TC47 | F6 | Report snapshot | Edit a day after report generated (within window) | Report unchanged | P2 |
| TC48 | F6 | Monthly review prompts body check | Open monthly review | Body check prompt shown | P2 |
| TC49 | F7 | Daily cap | 6 triggers in one day | Only 4 sent by priority | P2 |
| TC50 | F7 | Quiet hours exception | Phone Off reminder at 23:45 | Sent despite quiet hours | P2 |

**Non-functional tests**

- Performance: Today loads in under 1 s on a mid-range phone; a tap updates score in under 100 ms (optimistic UI).
- Accessibility: all tap targets 44 x 44 pt minimum; status never shown by colour alone; screen reader labels each habit with status.
- Time: run the cutoff job across timezones UTC-8 to UTC+10 and on DST change dates.
- Data integrity: recompute an entire arc from HabitEntry rows and compare with stored snapshots.
- Security: users can read and write only their own arcs; share card hides private fields by default.

## 17. Improvement ideas and future scope

The biggest gains after MVP come from removing manual logging, making targets adapt, and adding accountability without exposing private data.

| # | Idea | Why it helps | Effort | Phase |
| --- | --- | --- | --- | --- |
| I1 | Auto-log steps from Google Fit / Apple Health | Removes one manual habit; data is honest | Medium | 3 |
| I2 | Auto-detect Phone Off using screen-time APIs (Android Digital Wellbeing, iOS Screen Time) | The hardest habit to self-report becomes automatic | High | 3 |
| I3 | Home-screen widget and lock-screen quick log | Logging without opening the app; protects the 10-second goal | Medium | 2 |
| I4 | Adaptive targets at chapter start | Suggest raising a target if Done 90%+ or lowering if Minimum 50%+ | Low | 2 |
| I5 | Personalised weekly challenge | Pick the challenge from the user's weakest habit | Low | 2 |
| I6 | Accountability partner (1-to-1, private) | Lighter than squads; partner sees only streak and score | Medium | 2 |
| I7 | Photo proof for selected habits | Optional proof for MMA or Skin Care increases honesty for squads | Medium | 3 |
| I8 | Voice log ("Done water, steps, reading") | Fast logging while busy | Medium | 3 |
| I9 | AI weekly coach note | Plain-language summary and one suggestion from the week's data | Medium | 2 |
| I10 | Hinglish / Hindi UI | Matches how many B-Core users speak | Low | 2 |
| I11 | Printable tracker export | Monthly paper sheet generated from the user's habits | Low | 2 |
| I12 | Calendar sync for MMA sessions | Training slots appear in the user's calendar | Low | 3 |
| I13 | Integrate with other B-Core modules | Top 3 Tasks pulls from B-Core tasks; workout from a fitness module if present | Medium | 3 |
| I14 | Spring / Summer arcs | Same engine, new seasonal templates; keeps users after Winter Arc ends | Low | 3 |

**Risks to watch**

- Over-gamification: badges without effort feel cheap. Keep every reward tied to consistency.
- Shame loop after breaks: test the comeback flow (E20) with real users before launch.
- Notification fatigue: monitor opt-out rate; lower the cap if over 15% disable push in week 1.
- Sensitive habits (e.g. No P): never shown on share cards or squad feeds by default.

## 18. Release plan and open questions

Ship MVP first with logging, scoring, dashboard core and reports; add the game layer next; add social and integrations last.

1. **MVP:** F1 Setup, F2 Daily Logging, F3 Scoring and Streaks (with shields), F5 dashboard Sections A and B, F6 weekly and monthly reports, F7 notifications. Screens 1 to 18.
2. **Phase 2:** Ranks, badges, weekly challenge, self-competition ghost, dashboard insights (Section C), arc final report and share card, widgets (I3), adaptive targets (I4), AI coach note (I9), Hinglish UI (I10), printable export (I11).
3. **Phase 3:** Squads and leaderboard, accountability partner, health and screen-time integrations, photo proof, voice log, other B-Core module links, seasonal arcs.

**Next steps**

- [ ] Answer the open questions below
- [ ] Wireframe MVP screens 1 to 18 (low fidelity, mobile first, then web dashboard)
- [ ] Usability test Today and Close the day with 5 users
- [ ] Finalise copy for streak and comeback messages

**Open questions**

- [ ] Is competition only self vs self, or do we need squads/leaderboards earlier than Phase 3?
- [ ] Should the strong-day threshold be fixed at 80 for fairness, or user-adjustable?
- [ ] Is noon the right cutoff, or should it be configurable (e.g. 10:00 for early risers)?
- [ ] Do rank thresholds need tuning after a pilot arc?
- [ ] Should sensitive habits be markable as private (hidden from all reports and exports)?
- [ ] Which B-Core modules exist today that this module should link to?
