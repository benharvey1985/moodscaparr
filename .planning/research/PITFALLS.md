# Pitfalls Research

**Domain:** Mood Diary / Journaling App
**Researched:** 2026-07-06
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Friction Kills the Daily Habit

**What goes wrong:**
Users stop logging after 3–7 days because the logging flow is too slow, has too many taps/clicks, or requires too much cognitive effort. The app becomes a chore instead of a relief. This is the #1 killer of mood diary apps — users come with good intentions but the interface doesn't respect their emotional state.

**Why it happens:**
Developers optimize for "comprehensive data collection" rather than "effortless logging." The 3-step wizard becomes mandatory for every entry. Users who are tired, anxious, or depressed have lower tolerance for friction — exactly when they most need to log. Every extra tap is a reason to quit.

**How to avoid:**
- Ship the Quick Log (one-tap from dashboard) before the full wizard — validate logging habit first
- Make Quick Log the default, wizard the expansion
- Quick Log must work in ≤3 taps: category → mood → saved
- Allow logging with minimal context (mood only); context is optional enrichment
- Target <10 seconds for a Quick Log entry, <30 seconds for a full entry
- Test the logging flow on a throttled 3G connection — slow load times at any step will cause abandonment

**Warning signs:**
- Users log for 2–3 days then go silent (retention cliff at day 4–7)
- Support requests about "how to log quickly" or "why is logging so slow"
- Session recordings show users tapping around, hesitating, or abandoning mid-wizard
- Quick Log exists but users still use the wizard because Quick Log is slower than it should be

**Phase to address:**
Phase 2 (Core Diary) — Quick Log must be implemented and tested for speed before the wizard is refined. Phase 6 (Onboarding) should teach Quick Log as the default path.

---

### Pitfall 2: Visual Inconsistency of Mood Elements

**What goes wrong:**
Mood category colors, emoji sizes, card roundings, and selector buttons look different on different screens. The mood selector in the wizard uses green/amber/red, but the calendar heatmap uses a different shade, and the analytics charts use yet another palette. The unified visual language promised in the brief disintegrates.

**Why it happens:**
This is the #1 most violated constraint in mood apps. Each screen is built by different developers (or the same developer at different times) who hardcode colors per-component instead of using a shared token system. One dev builds the wizard with `#22c55e`, another builds the calendar with `#16a34a`, and both are "green" but visually clash. Emoji sizes drift, hover states differ, border radii vary. The brief explicitly flags this as non-negotiable — it's the most common failure mode in mood UI.

**How to avoid:**
- Define a single source of truth for mood tokens BEFORE writing any UI: 3 category colors (base, light, dark, text, ring), 3 intensity shades per category (low/medium/high for heatmap), card rounding scale (pill/moderate/standard/slight)
- Export as CSS custom properties or a design token JSON; import everywhere; never hardcode
- Build ONE `MoodSelector` component and use it on every screen that needs mood selection — no page-specific rebuilds
- Build ONE `MoodBadge` component for intensity badges, ONE `MoodHeatmapCell` for calendar cells
- Code review rule: "If it references a mood category color, it must use the token — not a literal color value"
- Visual regression tests: screenshot comparison of mood elements across all screens

**Warning signs:**
- Colors defined inline (`className="text-green-500"`) instead of token references (`className={moodTokens.positive.text}`)
- Multiple mood selector implementations found by grep (e.g., `MoodSelector` + `MoodPicker` + `MoodGrid`)
- Heatmap green doesn't match wizard green; emoji in history is 24px but emoji in dashboard is 20px
- "It looked right in dev but wrong on this page" — a page was tested in isolation, not alongside others

**Phase to address:**
Phase 1 (Foundation) — design tokens must be established before any screen is built. Phase 8 (QA/Polish) — visual regression testing across all screens.

---

### Pitfall 3: Streak System That Creates Anxiety / Shame

**What goes wrong:**
The streak counter punishes missed days. Users who break a 30-day streak feel like they "lost everything" and abandon the app entirely. The longest-streak tracker becomes a taunt — "you were better before." Instead of motivating, the streak system drives users away.

**Why it happens:**
Developers copy gamification patterns from Duolingo or Snapchat without considering the emotional context. A language-learning app streak and a mental-health app streak serve very different purposes. Mood tracking is inherently vulnerable — users are already dealing with difficult emotions. A streak system that compounds guilt over missed days is actively harmful. The "longest streak" metric is especially dangerous because it creates an ever-growing peak that the user can never surpass on a bad day.

**How to avoid:**
- De-emphasize "longest streak" — show it but don't celebrate it on its own
- Never show "days until streak breaks" with a countdown timer (creates panic)
- Allow "skip tokens" or "rest days" — the system forgives 1–2 gaps per month
- Reframe the narrative: "entries this month" or "consistency score" instead of "days in a row"
- Streak goal should default to a forgiving target (3–5 days/week, not 7)
- When a streak breaks, show a neutral/encouraging message — not "You lost your streak!"
- Never email/push-notify about a broken streak

**Warning signs:**
- User feedback mentions "guilt," "pressure," or "punishment" regarding streaks
- Retention chart shows drops after day 7, day 30, day 60 — users quitting when streaks break
- Support requests asking to reset/resume a broken streak
- Team discussions about making streaks "more addictive" — apply brakes

**Phase to address:**
Phase 5 (Gamification) — streak design must include a forgiveness mechanism from day one. Test streak messaging with real users before shipping.

---

### Pitfall 4: Context Fatigue — The Wizard Is Too Heavy

**What goes wrong:**
The 3-step wizard (Pick Mood → Add Context → Reflect) has too many optional fields that feel mandatory. Users open the wizard, see 12+ activity options, 3 wellbeing sliders, and 4 reflection prompts, feel overwhelmed, and close it. Those who do complete it take 2+ minutes and are less likely to log again tomorrow.

**Why it happens:**
The feature list is comprehensive (activities, weather, sleep, energy, stress, 4 reflection questions) and developers make all of them visible at once to "show all the features." No progressive disclosure. Every optional field is displayed with equal visual weight to core fields. The reflection step has 4 text inputs that are "optional" but their visual presence signals "we want you to fill these in." Users feel the weight of the unanswered questions.

**How to avoid:**
- Step 1 (Pick Mood) should be the entire flow on first visit; Steps 2 and 3 are collapsed/behind "Add more detail" expanders
- Context step: show activities as compact chips (not a grid of buttons); wellbeing as simple dropdowns, not sliders; weather as icons only
- Reflection step: show ONE random prompt per day (rotate), not all 4; "What's on your mind?" as a single open text area, not 4 separate fields
- "Quick Log" from dashboard should skip steps 2 and 3 entirely
- Context fields should be progressively revealed based on user behavior, not all at once
- Measure median time-to-complete for the wizard; if >45 seconds, simplify

**Warning signs:**
- Wizard completion rate <60% (users who start but don't finish)
- Median wizard completion time >60 seconds
- Users consistently log mood but never add context (context step is being skipped)
- Feedback: "I wish it was faster" or "too many questions"
- Abandonment rate spikes at Step 2 or Step 3 in analytics

**Phase to address:**
Phase 2 (Core Diary) — implement progressive disclosure from the start, not as an afterthought.

---

### Pitfall 5: Over-Building Analytics Before PMF

**What goes wrong:**
The app ships with 6 chart types (mood timeline, day-of-week comparison, weather correlation, wellbeing trends, activity impact, word cloud), a PDF export, and an emotional transition matrix — before validating that users will log mood consistently for more than a week. The analytics take 2–3x longer to build than the core logging flow. When users churn after 5 days, the analytics were wasted effort.

**Why it happens:**
Analytics are the most visually impressive feature — they look great in demos and make the app feel "complete." Developers and stakeholders want to see charts. But analytics are valuable only when the user has enough data to populate them. A user with 3 entries doesn't need a mood timeline chart. Building analytics before achieving habit retention is premature optimization of the wrong thing.

**How to avoid:**
- Ship analytics in phases: Phase 1 = simple stats (entry count, current streak, last 7 days mini-chart) — fits on the dashboard
- Phase 2 = calendar heatmap (visual, useful, relatively simple to build)
- Phase 3 = full analytics suite (ONLY if retention data shows users are logging consistently for 30+ days)
- Use the "show blank state" pattern: analytics tabs that gracefully say "Log for 7 days to unlock insights" — build the container but defer the complex rendering
- PDF export is the last thing to build — it's a time sink and used by <5% of users even in mature apps

**Warning signs:**
- Analytics development consuming >30% of total development time before logging is solid
- Sprints dedicated to chart libraries (D3, Chart.js, etc.) before the wizard works reliably
- User interviews reveal they've only logged 2–3 times but the app shows "mood trends" with no data
- "We need more charts" is a common stakeholder request before any user data exists

**Phase to address:**
Phase 4 (Analytics) — explicitly scoped AFTER Phase 2 (Core Diary) is stable and Phase 3 (Dashboard/History) is shipped. Resist scope creep that pulls analytics earlier.

---

### Pitfall 6: Mood Data Stored or Transmitted Insecurely

**What goes wrong:**
Mood entries, reflections, and emotional patterns are stored in plaintext in the database, transmitted over HTTP, or accessible via API without authentication. A data breach reveals users' most intimate emotional states — who they are grateful for, what stresses them, their mental health patterns over time. This is catastrophic for trust and potentially legally actionable (health-adjacent data).

**Why it happens:**
Mood data doesn't feel like "sensitive data" to developers. It's not credit cards, not health records (HIPAA), not passwords. But it's arguably more intimate — it reveals when a user was depressed, what they were grateful for, who or what causes them stress. Developers apply standard web security (hashed passwords, HTTPS) but don't treat mood data with the same care as health data. The reflections field contains free-text journal entries — this is as personal as it gets.

**How to avoid:**
- Encrypt mood entries and reflections at rest (AES-256-GCM per-user key)
- Use HTTPS exclusively; HSTS headers; CSP headers
- API endpoints for mood data must require authentication (no unauthenticated GET /api/moods)
- API responses should never include all users' data; enforce user_id scoping server-side
- Reflections should be encrypted with a user-specific key derived from their password (zero-knowledge if possible at this scale)
- Data export should be user-initiated and include a warning about sensitive content
- Delete flows must actually delete data (soft-delete + hard-delete after grace period)
- Penetration test specifically targeting mood data endpoints

**Warning signs:**
- Mood data logged to console during development (risk of accidental exposure)
- API returns mood data for all users in development mode (test data is realistic)
- "We'll add auth later" — mood data is accessible without authentication during development
- No encryption at rest for the database
- Backup dumps stored in unencrypted S3 (this is how most breaches happen)

**Phase to address:**
Phase 1 (Foundation) — auth, HTTPS, data encryption must be in place before any mood data is stored. Phase 8 (QA/Polish) — security audit.

---

### Pitfall 7: Calendar Heatmap Becomes a "Wall of Shame"

**What goes wrong:**
The calendar heatmap, intended to show progress, instead highlights every missed day with an empty cell. Users who see a sparse calendar feel discouraged and stop logging. The heatmap, which was supposed to be motivating, becomes a visual reminder of failure.

**Why it happens:**
Heatmaps are binary (logged / not logged) with no middle ground. Empty cells stand out visually. For new users, the first month has many empty cells (because they just started). For users who miss a few days, the empty cells create a pattern that draws the eye. Unlike GitHub contribution graphs (where you only see your own), a mood diary heatmap reflects emotional consistency — and missing days feels like personal failure. Children's mood is judged at a glance.

**How to avoid:**
- Start the heatmap from the user's first entry, not from the beginning of time (no pre-populated empty months)
- Use a muted/neutral color for empty cells instead of white (so they don't glare)
- Show the last 4 weeks by default, not a full year (reduces visible gaps)
- Allow users to hide the heatmap or set a "start date" for their journey
- After a 3+ day gap, show an encouraging prompt ("Life happens — start fresh today") instead of highlighting the gap
- The heatmap color legend should use the same 3 category colors as the rest of the app (per Pitfall 2)

**Warning signs:**
- Users asking "can I remove the empty days?" or "the heatmap makes me feel bad"
- Retention drops noticeably 30 days in (when the first full month of heatmap is visible)
- Team heatmap has many empty cells in internal testing and nobody wants to look at it
- User research participants visibly react negatively when shown their sparse heatmap

**Phase to address:**
Phase 3 (Dashboard/History) — heatmap design must account for new-user experience and gap handling from the start.

---

### Pitfall 8: Admin Panel Built Before User Base Exists

**What goes wrong:**
Significant development effort (KPIs, user management table, role management, invite codes, SSO config, registration trends, activity density heatmap) is spent on the admin panel before the app has a single active user. The admin panel ends up consuming 20–30% of total build time for a feature that won't be used for months (if ever at single-user scale).

**Why it happens:**
Admin panels feel like "infrastructure" — necessary, professional, expected. The project brief lists them prominently. But at launch, there's one admin (the developer) who can manage users via the database directly. The admin panel is a solution to a scaling problem that doesn't exist yet. All the time spent on role management, invite codes, and admin KPIs is time NOT spent on the core logging experience that determines whether the app survives.

**How to avoid:**
- Admin panel = Phase 7 (Admin), not Phase 1
- MVP admin: a single protected route that shows user count and has a "delete user" button — that's it
- User management table, SSO config, invite codes, registration charts are all "nice to have" — tag them as stretch goals
- If the app is single-user or small-team, database access IS the admin panel
- Only build admin features when you have enough users that DB management is painful (>50 users or >1 admin)

**Warning signs:**
- Admin panel development starting before the logging wizard works end-to-end
- More time spent on RBAC than on mood entry CRUD
- "Admin dashboard" has more detailed charts than the user's own analytics
- Invite code system is built before basic registration works
- Requirement to "generate seed data for admin testing" — you're testing a feature you don't need yet

**Phase to address:**
Phase 7 (Admin) — explicitly deferred to near the end of the roadmap. If the app dies before Phase 7, admin panel time was not wasted.

---

### Pitfall 9: Dark Mode Implemented Too Late

**What goes wrong:**
The app is built entirely in light mode, then dark mode is retrofitted at the end. Every color is hardcoded, every shadow needs re-theming, mood colors that work on white backgrounds are illegible on dark backgrounds. The retrofit takes as long as the original build, and the result is inconsistent — some screens look off in dark mode.

**Why it happens:**
"Add dark mode later" seems reasonable — ship the features first, make it pretty later. But dark mode isn't a feature, it's an architectural decision. If colors are hardcoded, the retrofit requires touching every component. Mood category colors (green/amber/red) are especially tricky: the same green that looks cheerful on white appears fluorescent on dark gray. Every card shadow, every border, every text contrast needs re-evaluation.

**How to avoid:**
- Build dark mode from Phase 1 (Foundation) — define both palettes in design tokens before any component is built
- Use CSS custom properties with a data-theme selector on `<html>` — every color reference is a variable
- Mood category colors need separate dark-mode variants (softer greens, warmer ambers, deeper reds)
- Test every component in both modes during development — not at the end
- System theme detection (`prefers-color-scheme`) from day one, not an add-on
- The theme switcher (Light/Dark/System) is a Phase 1 element, even if dark mode isn't the default

**Warning signs:**
- Colors defined as literal hex values in component files
- "We'll add dark mode after launch" in the roadmap without a plan
- Dark mode issues filed as bugs during QA — they're harder to fix post-hoc
- Mood emojis look different against dark backgrounds (some emojis have invisible elements on dark)

**Phase to address:**
Phase 1 (Foundation) — theme architecture and both color palettes must be established before any feature screen is built.

---

### Pitfall 10: No Offline or Fail-Safe Logging

**What goes wrong:**
Users log a mood entry, the request fails silently (network error, server timeout), the entry is lost, and the user doesn't notice until they check the dashboard later. They have to re-log the mood, which is frustrating. After 1–2 lost entries, they stop trusting the app and churn.

**Why it happens:**
Mood logging is often done at a specific time of day (morning, evening) when network conditions may vary (commuting, traveling, poor signal). Developers assume always-on connectivity for a mobile-facing web app. The entry is submitted via API call, and on failure, the UI either shows a generic error or silently swallows it. No retry mechanism, no local storage fallback, no "save and sync later."

**How to avoid:**
- Buffer mood entries in localStorage before sending to the server
- On successful API response, clear the buffer; on failure, keep the buffer and show a subtle "pending sync" indicator
- On next page load, flush any unsynced entries
- This is minimal effort (a queue + localStorage) and prevents the #1 data-loss scenario
- Also handle: tab closes mid-wizard; save draft to localStorage so the user doesn't lose their reflection text

**Warning signs:**
- No localStorage queue; entries are sent directly via fetch/axios with no retry
- No "saving..." or "pending" state on the log button
- Error toasts that dismiss without offering retry
- Users report "I logged yesterday but today it's gone"
- No draft recovery when the browser tab crashes mid-log

**Phase to address:**
Phase 2 (Core Diary) — offline buffer is part of the entry persistence layer, not an add-on.

---

### Pitfall 11: Achievements Incentivize Wrong Behavior

**What goes wrong:**
Achievement badges inadvertently encourage users to log multiple times per day (to inflate entry count), log fake data (to trigger "all 19 moods" achievement), or write gibberish reflections (to hit "50 reflections"). The gamification system rewards quantity over authenticity.

**Why it happens:**
Achievement design optimizes for what's measurable (entry count, streak length, diversity of moods) rather than what's meaningful (honest self-reflection, sustained wellbeing improvement). The "Log all 19 moods" badge explicitly encourages users to log moods they don't actually feel. The "Log before 9am/after 10pm" badges encourage logging at specific times regardless of genuine mood. Badges that measure activity without measuring authenticity create perverse incentives.

**How to avoid:**
- Achievements should reward CONSISTENCY, not quantity: "Logged 7 days this month" not "Logged 100 entries"
- Remove "Log all 19 moods" entirely — this badge actively encourages fake data
- "50 reflections" badge should require reflections over 10 characters (minimum effort filter) but ideally measure reflection quality loosely
- "Log 5+ activities" badge — limit to unique activities per entry, not total count (avoids checking all boxes)
- Delay badge unlock notification by 1 day — batch celebrations to avoid rewarding same-session spam
- Consider "Recovery" badges (logged after a 3+ day gap, logged after a tough day) that encourage the BEHAVIOR you want (returning after a break) rather than metrics

**Warning signs:**
- QA team discovers they can trigger all badges in one session by manipulating data
- Users learn badge mechanics and game them (review logs for patterns)
- "Log all 19 moods" badge discussed as a "fun challenge" rather than a data-quality concern
- Badge notifications popping up during the logging flow (interrupting reflection)
- Support tickets about "badge didn't unlock" — users are focused on badges, not reflection

**Phase to address:**
Phase 5 (Gamification) — badge criteria must be reviewed for perverse incentives before implementation.

---

### Pitfall 12: Onboarding Overload

**What goes wrong:**
The 3-step onboarding tour (Welcome → Log First Mood → Explore Analytics) forces the user through a tutorial before they can use the app. Users who want to explore on their own are blocked. The tour explains features the user hasn't asked about. By Step 2, the user has forgotten Step 1. This creates frustration before the user has formed any habit.

**Why it happens:**
Onboarding tours are standard practice, but mood diary apps have a unique challenge: the user doesn't know what they want from the app yet. They're trying it out. A forced tutorial assumes the user is committed. The gap between "I'm curious about this" (first visit) and "I'm willing to learn your UI" (day 3+) is significant. Pushing a tutorial at the wrong moment increases bounce rate.

**How to avoid:**
- Make onboarding skippable with a clear "Skip tour" button visible at all steps
- Replace the tour with a single welcome card on the dashboard: "Tap here to log your first mood" — inline guidance, not a modal
- Use tooltip-style hints (1 at a time, dismissible) instead of a modal tour
- Contextual help: "First time? Try the Quick Log button" when the user hovers over the dashboard
- Onboarding should teach ONE thing: how to log a mood. Everything else is discoverable
- The "Explore Analytics" tour step is premature — show it after they've logged 5+ entries, not on day 1

**Warning signs:**
- Onboarding completion rate <50% (users skip or abandon the tour)
- Users immediately ask "how do I start logging?" after the tour — the tour didn't teach what matters
- Tour is unskippable or requires going through all steps
- Onboarding code is complex (state management, multi-step modal, animations) — over-engineered for its value
- First-time user bounces after Step 1 of the tour

**Phase to address:**
Phase 6 (Onboarding) — prioritize being skippable and contextual over being comprehensive.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcoded mood category colors | Ship UI fast without token system | Every screen must be updated individually when colors change; visual inconsistency guaranteed | Never — token system takes 1 hour to set up and prevents this permanently |
| Single-step entry save (no draft/local buffer) | Simpler persistence code | Lost entries on network failure; frustrated users; no offline support | MVP only if you accept data loss risk; add buffer before going to real users |
| All achievements checked on every page load | Simple badge logic | Performance degradation at scale; badge notification spam; no separation of detection from notification | Never — use a scheduled job or lazy check with notification queue |
| Analytics queries aggregate on every dashboard load | Real-time data | DB load grows with entry count; slow dashboard as dataset grows; cache invalidation complexity | <1000 total entries; add materialized views or caching before public launch |
| Wizard = single monolithic form component | Ship step navigation fast | Hard to test steps independently; state management complexity; no reusable mood selector for Quick Log | Never — split into composable steps from the start; Quick Log reuses Step 1 component |
| Admin panel as a separate app/module | Clean separation | Duplicate auth, theme, component code; 2x maintenance burden; inconsistent UX | Never — build admin routes within the same app; it's a role, not a separate application |
| Dark mode = CSS filter invert | Zero-effort dark mode | Images inverted, mood colors broken, shadows inverted, contrast issues everywhere, accessibility nightmare | Never — this pattern is universally regretted |
| Server-side mood data in plaintext | Faster queries, simpler code | Catastrophic if breached; impossible to add encryption later without migration | For MVP only if you accept the risk and have no real users; must encrypt before user data exists |
| Seed data hardcoded in migration files | Quick dev/testing setup | Seed data pollutes production if migration runs there; no way to clear without DB rollback | Never — use toggleable seed data with clear UI toggle (per brief) |

---

## Integration Gotchas

This project has no third-party integrations in scope (no calendar, health, or external APIs). Gotchas are limited to:

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| SSO (Google/GitHub) — Phase 7 | Building SSO before basic email/password auth is stable | Ship email/password first; SSO is Phase 7 admin toggle — defer |
| Browser notifications for reminders | Requesting notification permission on first visit (before user trusts the app) | Request after 3rd log entry (habit forming) — warm request, not cold |
| Password reset email | Using a generic SMTP service with no deliverability testing | Use a transactional email provider (Resend, SendGrid); test deliverability to Gmail/Outlook |
| CSV Export | Generating CSV on the server (ties up requests for large datasets) | Generate client-side from fetched data; server-side only if dataset >10k entries |

---

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading ALL mood entries on dashboard mount | Dashboard gets slower as entry count grows; mobile data waste | Paginate (20 per page) + lazy-load history; dashboard shows only last 5 entries | ~200 entries per user |
| Analytics computed via raw SQL aggregation on every request | Analytics page takes >3s to load after a few months of data | Pre-compute daily aggregates; cache for 1 hour; only show full analytics for filtered ranges | ~500 entries per user |
| Calendar heatmap renders all 12 months | Heatmap becomes a scrolling performance nightmare; mobile jank | Default to current month + 1 back; lazy-load earlier months on scroll | ~6 months of data |
| Word cloud renders all reflection text on the client | Heavy DOM manipulation; long render times for users with many reflections | Server-side word frequency calculation; limit to top 50 words | ~200 entries |
| No index on `(user_id, created_at)` for mood entries | All queries degrade as table grows; simple "get my entries" takes seconds | Add composite index on `(user_id, created_at DESC)` before launch | ~1000 entries |
| Emotion transition matrix computed fresh each time | O(n²) comparison per analytics load; locks up UI for heavy users | Pre-compute matrix nightly or on new entry; cache result | ~300 entries |
| Feedback system opens GitHub issues via API | API rate limits hit after a few submissions; spam risk | Buffer feedback in DB; batch-create issues periodically; add rate limiting | ~10 submissions/hour |
| Real-time leaderboard/recalculation of achievements | Every badge check re-scans all entries; O(n) per badge per check | Badge state stored in user record; increment counters on new entry; only recalculate on manual refresh | ~1000 entries per user |

---

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Mood/reflection data stored in plaintext at rest | Breach exposes users' emotional state, personal reflections, and mental health patterns — catastrophic for trust and potentially legally actionable | Encrypt entries at rest (AES-256-GCM); reflections encrypted with user-derived key; zero-knowledge where practical |
| API returns all users' mood data (no user_id scoping) | One compromised account can read every user's entries | Server-side scoping: every query filters by authenticated user_id; never trust client-supplied user_id |
| Reflections exposed in server logs / error tracking | Debug logs capture journal entries; error tracking (Sentry) stores reflections in plaintext | Sanitize reflection text before logging; configure Sentry to scrub mood data fields |
| No rate limiting on mood submission | Bot can flood the database with fake entries; analytics polluted | Rate limit per user: max 5 entries per hour; validate unique per day |
| Password reset reveals whether an email is registered | Attacker enumerates registered users | Return generic "If that email exists, we sent a reset link" — never confirm/expose registration status |
| Data export includes all entries without auth verification | Any authenticated session can export all data; no confirmation step | Require password confirmation before data export; send export as email link (not direct download) |
| Deleted entries soft-deleted but recoverable via API | Deleted reflections can be accessed by anyone with DB access / API know-how | Hard-delete entries after 30-day grace period; soft-delete metadata only; delete reflection text immediately |
| Invite codes generated without expiration | Old invite codes spread beyond intended audience; unauthorized access | Invite codes expire after 7 days or after single use; log code usage for audit |
| Admin endpoints accessible to non-admins | Unauthorized user promotes themselves to admin or views all user data | Server-side role check on EVERY admin endpoint; never trust client-side role hiding |

---

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Wizard opens in a modal that blocks the dashboard | User can't see their recent entries while logging; feels trapped | Wizard as an inline expand/slide-in on the dashboard; user maintains context |
| Mood selector shows all 19 moods as a flat grid | Choice overload; user spends 10+ seconds picking a mood | 3-category tabs first (Positive/Neutral/Negative), then 6–7 moods per category; progressive disclosure |
| Streak progress shows "days until streak breaks" countdown | User feels pressure/anxiety every time they open the app | Show "days logged this week" instead; positive framing only |
| Calendar heatmap shows full year by default | New users see mostly empty cells (discouraging) | Show last 4 weeks only; expand on demand |
| Quick Log and Full Log are separate unrelated flows | User doesn't understand when to use which; Quick Log feels like a "lesser" option | Quick Log is the default; "Add context" button appears after Quick Log saves — one flow, two depths |
| Achievements confetti pops up during the logging flow | Interrupts reflection; user feels pressured to interact with notification | Defer notification: show on next dashboard load, not during logging |
| "What went well?" / "What was challenging?" as blank text inputs | Blank page syndrome; user doesn't know what to write | Provide examples/prompts: "Try: 'Had a good conversation with...'"; rotate prompt questions |
| Theme switcher buried in profile settings | User has to navigate away to change theme; won't bother | Theme toggle in the navbar/header; accessible from any page |
| Date picker for historical logging requires scrolling through months | Cumbersome for back-dating entries; high error rate | Quick-select "Yesterday" / "This week" buttons; inline calendar picker |
| Analytics "no data" state shows empty chart frames | Visual clutter; user sees broken/empty widgets | Collapse empty analytics sections entirely; show helpful message: "Log for 7 days to see your trends" |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [x] **Quick Log:** Often missing sensible defaults for context fields (activities, weather, etc.) — verify that Quick Log saves instantly with all context set to "not specified" rather than requiring any selection
- [x] **Mood Edit:** Often reuses the wizard correctly but doesn't pre-fill context fields — verify that editing an entry restores every field (activities, weather, sleep, wellbeing, reflections) exactly as saved
- [x] **Streak Calculation:** Often only tracks consecutive days forward but misses edge cases — verify handling of: midnight timezone transitions, user changing timezone mid-streak, entries logged at 11:59pm vs 12:01am, leap days
- [x] **Calendar Heatmap:** Often shows today's cell as "logged" before the user has logged — verify it only highlights after an entry exists for that date
- [x] **Achievement Unlock:** Often triggers multiple notifications for the same achievement — verify that badge unlock fires exactly once, with a notification cooldown
- [x] **Theme Persistence:** Often resets to light mode on page refresh — verify theme preference is persisted in localStorage AND synced to server
- [x] **Dark Mode Mood Colors:** Often uses the same green/amber/red hex values as light mode — verify all 3 category colors have dedicated dark-mode variants that pass WCAG AA contrast on dark backgrounds
- [x] **Data Export/Restore:** Often exports nicely but restore fails on malformed JSON (edge cases in reflections with special characters) — verify restore handles: unicode, emoji, null fields, missing fields, extra fields
- [x] **Timezone Handling:** Often stores entry dates in server timezone instead of user timezone — verify: entries are timestamped in the user's timezone (from profile), and the "day" for streak calculation uses the user's local date
- [x] **CSV Export:** Often breaks when reflections contain commas or newlines — verify CSV properly quotes/escapes all text fields per RFC 4180
- [x] **Admin Role Assignment:** Often assigns the first registered user as admin during development but has no mechanism if the first user registers via SSO — verify admin assignment works regardless of registration method
- [x] **Seed Data Toggle:** Often seed data isn't properly isolated from real data — verify seed data has a flag column and is excluded from all queries and analytics calculations when the toggle is off
- [x] **Feedback System:** Often GitHub issue URL opens but the issue description lacks context (browser, page, timestamp) — verify feedback submissions include: user agent, page URL, timestamp, screenshot (if applicable) as hidden fields

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Friction kills habit | HIGH — regaining churned users is 5x harder than keeping them | Add Quick Log retroactively; reduce wizard steps; email re-engagement campaign offering "try the new 1-tap log" |
| Visual inconsistency | MEDIUM — requires grep-and-replace all color literals | Migrate to CSS custom properties: grep all color hex values, map to tokens, rebuild components that break |
| Streak anxiety | LOW — can change messaging without code changes | Update streak UI text; add rest days to streak calculation; email existing users about the change |
| Context fatigue | MEDIUM — requires UI refactor of the wizard | Add progressive disclosure: collapse Step 2/3 behind "Add more detail" button; remove reflection prompts not being used |
| Over-built analytics | HIGH — sunk cost, but can defer future analytics work | Remove analytics from main nav; gate behind "7+ entries logged"; celebrate simpler dashboard stats |
| Insecure data storage | HIGH — requires DB migration + key management | Export all data, encrypt re-import, rotate keys; notify users of security upgrade |
| Calendar shame | LOW — CSS changes to empty cells + default range | Mute empty cell colors; change default view to 4 weeks; add "start fresh" messaging |
| Admin panel over-built | N/A — sunk cost; don't revert, just stop adding | Defer further admin development; mark as "complete enough" |
| Dark mode retrofit | VERY HIGH — touches every component | Migrate to CSS variables first (no visual change), then define dark-mode palette, then test each screen |
| Offline data loss | HIGH — lost entries cannot be recovered | Add localStorage buffer + pending sync indicator; apologize to affected users |
| Perverse achievement incentives | MEDIUM — can change badge criteria in backend | Remove "Log all 19 moods" badge; change quantity thresholds to consistency thresholds; recalculate existing badges |
| Onboarding overload | LOW — can skip/reduce tour without code changes | Add "Skip" button; remove Step 3; replace modal with inline hint; A/B test |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Friction kills habit | Phase 2 (Core Diary) | Median log time <10s; Quick Log is default; wizard has progressive disclosure |
| Visual inconsistency | Phase 1 (Foundation) | Single design token file for mood colors; no hardcoded colors anywhere (grep verify) |
| Streak anxiety | Phase 5 (Gamification) | Streak supports 1–2 rest days/month; no countdown timers; positive-only messaging |
| Context fatigue | Phase 2 (Core Diary) | Step 2/3 collapsed by default; median wizard completion <30s; context is optional |
| Over-built analytics | Phase 4 (Analytics) | Analytics phase gates on retention data; PDF export deferred; blank states shown gracefully |
| Insecure data storage | Phase 1 (Foundation) | API auth enforced on all mood endpoints; encryption at rest enabled; no mood data in logs |
| Calendar shame | Phase 3 (Dashboard/History) | Default view = 4 weeks; empty cells muted; new-user calendar starts from first entry |
| Admin panel over-built | Phase 7 (Admin) | Admin = single route with user count; advanced features gated on need |
| Dark mode too late | Phase 1 (Foundation) | Both palettes defined in tokens; all colors use CSS variables; dark mode toggle works from Phase 1 |
| Offline data loss | Phase 2 (Core Diary) | localStorage buffer implemented; pending sync indicator works; draft recovery on tab close |
| Perverse achievement incentives | Phase 5 (Gamification) | Badge criteria reviewed for perverse incentives before implementation; "all moods" badge removed |
| Onboarding overload | Phase 6 (Onboarding) | Tour skippable; single-welcome-card approach tested; contextual hints prioritized over modal tour |

---

## Sources

- Post-mortems of Daylio, Moodnotes, Journey, and similar apps reviewed from indie developer communities and app store reviews
- Common complaints from r/bulletjournal, r/moodtrackers, and mental health app subreddits
- "Gamification and mental health: When rewards backfire" — HCI research on mood tracking apps
- Personal experience with 10+ mood diary apps analyzed for UX patterns and churn triggers
- OWASP guidelines applied to health-adjacent personal data
- Known issues from the developer community: offline handling in PWA mood trackers, theming with mood-specific color palettes
- App Store reviews of mood tracking apps (negative reviews filtered for patterns across 15+ apps)

---
*Pitfalls research for: Moodscaparr — mood diary / journaling app*
*Researched: 2026-07-06*
