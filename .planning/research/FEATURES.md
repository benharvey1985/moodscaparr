# Feature Research

**Domain:** Mood diary / daily journaling apps
**Researched:** 2026-07-06
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Mood logging with emoji/scale picker | Core action — all competitors (Daylio, Reflectly, Moodnotes, Bearable) center on this | LOW | 3-category + intensity scale covers the need; Daylio uses 5-face scale |
| Activity/context tagging | Users want to see correlations between activities and mood (Daylio's core insight) | LOW | Multi-select from customizable list |
| Free-text diary / notes field | Traditional journaling expectation alongside quick mood taps | LOW | Optional reflection prompts (gratitude, challenges) add structure |
| Calendar view with mood colors | Visual summary — "Year in Pixels" is a Daylio hallmark | MEDIUM | Monthly grid with color-coded cells |
| Basic statistics (entry count, avg mood) | Users expect to see trends; Daylio free tier offers this | MEDIUM | Entry count, averages, simple charts |
| Streak tracking (current + longest) | Gamification to sustain daily habit — Finch, Daylio all have | LOW | Consecutive day tracking |
| History / entry list with search | Basic data retrieval; Daylio, Reflectly, Bearable all have | MEDIUM | Sorted by date, searchable |
| Dark mode | Users expect it for evening usage; all major apps support | LOW | Light/dark/system |
| PIN / biometric lock | Privacy concern is high for mood data (Moody reviews show this is a pain point without it) | MEDIUM | Local passcode or biometric |
| Daily reminder notifications | Habit formation — Daylio, Finch, Reflectly all nudge | LOW | Custom time + repeat |
| Data export (CSV/PDF) | Users want to share with therapists or keep backups | MEDIUM | Daylio offers PDF + CSV; Moodnotes offers both |
| Light/dark theme toggle | Expected visual comfort feature | LOW | System-follow or manual override |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| CBT-based thinking traps identification | Moodnotes' signature — helps users reframe negative patterns | HIGH | Requires clinical psychology content; pre-written trap library + guided prompts |
| Gamified virtual pet / companion | Finch's core differentiator — $30M ARR, #8 US Health & Fitness | HIGH | Warm, shame-free motivation; doubles engagement |
| Cross-category health correlations | Bearable's differentiator — sleep × mood × medication × symptoms correlation engine | HIGH | Requires enough data density to produce meaningful correlations |
| AI-powered insight/pattern recognition | Reflectly/Therma's pitch — "AI that learns your patterns" | MEDIUM | Pattern matching on mood + activity data; no LLM needed |
| Clinical screening scales (PHQ-9, GAD-7) | Rohy AI — bridges mood tracking with clinical utility | MEDIUM | Standardized questionnaires; liability considerations |
| Year in Pixels overview | Daylio's popular annual visual summary | MEDIUM | 365-cell color grid; popular on social media sharing |
| PDF/printable report generation | Therapist-ready shareable summaries — Bearable, Daylio offer | MEDIUM | Aggregated trends + entry samples for appointments |
| Voice journaling / dictation | Reflection.app — lowers friction for non-writers | MEDIUM | Speech-to-text integration |
| Self-awareness educational articles | Moodnotes — expert-curated mental health content | MEDIUM | Content library requiring expert authors |
| Reflective prompts (gratitude, challenges, etc.) | Reflectly — guided journaling reduces blank-page anxiety | LOW | Structured prompts (what went well, what challenged you, grateful for) |
| Customizable mood names and icons | Daylio power users value deep personalization | MEDIUM | Custom activity icons, mood labels |
| Seed/test data generator | Not common in competitors — lowers activation energy | LOW | Toggle to generate sample entries for exploring analytics |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Social / sharing features | "Share streaks with friends" (Daylio has limited version) | Privacy risk — mood data is sensitive; turns diary into social media | Local PDF export for manual sharing |
| AI therapist / chatbot mental health advice | Users want on-demand support | Liability — cannot claim clinical value without FDA/regulatory clearance | Curated articles + crisis hotline resources |
| Multiple daily check-ins (3+ per day) | "More data = better insights" | User fatigue and abandonment (research shows 2-4 check-ins optimal but most users can't sustain) | Single daily log with optional multiple entries |
| Complex onboarding / personality quiz | Finch has personality quizzes | Overwhelming first-time users causes drop-off | Simple 3-step wizard (per brief) |
| Real-time sync across devices | Users with multiple devices | Overengineering for a single-user diary; adds auth + conflict resolution complexity | Manual backup/restore via JSON file |
| Native mobile apps (iOS/Android) at launch | Users prefer native feel | Scope creep — responsive web covers both platforms immediately | Responsive web-first, native later |
| Gamification overload (leaderboards, XP) | "Make it more like a game" | Encourages gaming the system over genuine self-reflection | Streaks + achievements (14 badges per brief) |
| Wearable / smartwatch integration | Trend in health tracking (Oura, Apple Watch) | Platform lock-in, dev cost, maintenance burden | Do not build v1; revisit post-validation |

## Feature Dependencies

```
Mood Logging (Wizard)
    └──requires──> Authentication (user identity to persist entries)
                        └──requires──> Database / persistence layer

Analytics / Charts
    └──requires──> Mood Logging (data to analyze)
    └──enhances──> Calendar Heatmap (both use same data)

Achievement Badges
    └──requires──> Streak Tracking (streak badges)
    └──requires──> Mood Logging (milestone badges: 1/10/50/100 entries)

Data Export (CSV/PDF)
    └──requires──> Mood Logging (entries to export)
    └──enhances──> Analytics (PDF report includes analytics summary)

Reminders / Notifications
    └──enhances──> Streak Tracking (reminders help maintain streak)

Dashboard KPI Cards
    └──requires──> Mood Logging (entry count, avg mood)
    └──requires──> Streak Tracking (current streak)

Admin Panel
    └──requires──> Authentication (role-based access)
    └──requires──> Mood Logging (user data for admin KPIs)

Seed / Test Data Generator
    └──enhances──> Analytics (pre-populates charts for new users)
    └──enhances──> Calendar Heatmap (shows visual immediately)

Feedback System (FAB)
    └──requires──> Authentication (identify reporter)
    └──requires──> Github integration (issue creation)

CSV Export ──conflicts──> PDF Export (different format, same data pipeline but separate rendering)

PIN Lock ──conflicts──> Social sharing features (privacy model incompatible)
```

### Dependency Notes

- **All features require Authentication:** Mood data is personal; every feature operates on user-scoped data.
- **Analytics + Calendar Heatmap share the same query layer:** Both pull aggregated mood data by date range — build once, use in two views.
- **Achievements depend on Streaks + Mood Logging:** Badges cannot unlock until the underlying behavior is tracked.
- **Seed data is a multiplier:** It makes onboarding feel rich without requiring the user to produce 60 days of data manually.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [x] Authentication (email/password) — required for all features
- [x] Mood logging (3-step wizard + quick log) — the core action
- [x] Dashboard (greeting, today's status, KPI cards, recent entries, streak) — home screen
- [x] Entry history (list, search, filter) — data retrieval
- [x] Calendar heatmap — visual summary
- [x] Streak tracking (current + longest) — habit motivator
- [x] Light/dark/system theme — visual comfort
- [x] User profile (name, theme, timezone, streak goal, reminders) — personalization
- [x] Achievements (14 badges) — gamification without over-engineering

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Analytics (overview + trends + reflections tabs + PDF report) — deeper insights draw on accumulated data
- [ ] Data export (CSV base, PDF later) — user data ownership
- [ ] Reflective prompts (gratitude, challenges, what went well) — deeper journaling
- [ ] Seed/test data generator — improves new-user experience
- [ ] Onboarding tour (3-step modal) — reduces first-use confusion
- [ ] Feedback system — user input for iteration

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] AI-powered pattern insights — needs data volume and user trust
- [ ] Clinical screening scales (PHQ-9, GAD-7) — liability and accuracy concerns
- [ ] Custom mood names/activities — Daylio-level customization; dev cost
- [ ] Voice journaling — speech-to-text integration complexity
- [ ] Native mobile apps — responsive web covers launch; native is polish

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Mood logging (wizard + quick log) | HIGH | LOW | P1 |
| Dashboard with KPI cards | HIGH | MEDIUM | P1 |
| Entry history with search/filter | HIGH | MEDIUM | P1 |
| Calendar heatmap | HIGH | MEDIUM | P1 |
| Streak tracking | HIGH | LOW | P1 |
| Authentication | HIGH | MEDIUM | P1 |
| Achievements (14 badges) | MEDIUM | MEDIUM | P1 |
| User profile + settings | MEDIUM | MEDIUM | P1 |
| Light/dark theme | MEDIUM | LOW | P1 |
| Analytics (overview + trends + reflections) | HIGH | HIGH | P2 |
| Data export (CSV + PDF) | MEDIUM | MEDIUM | P2 |
| Seed/test data generator | MEDIUM | LOW | P2 |
| Onboarding tour | MEDIUM | LOW | P2 |
| Feedback system | LOW | MEDIUM | P2 |
| PDF report in analytics | MEDIUM | HIGH | P2 |
| Admin panel | MEDIUM | HIGH | P2 |
| AI-powered insights | HIGH | HIGH | P3 |
| Voice journaling | MEDIUM | HIGH | P3 |
| Custom mood names/icons | MEDIUM | MEDIUM | P3 |
| Clinical screening scales | MEDIUM | HIGH | P3 |
| Wearable integration | HIGH | HIGH | P3 |
| Native mobile apps | HIGH | VERY HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Daylio | Reflectly | Moodnotes | Bearable | Finch | Our Approach |
|---------|--------|-----------|-----------|----------|-------|--------------|
| Mood logging | 5-face scale + custom moods | Emoji + AI-guided prompts | Face scanning + mood picker | Multi-factor mood + severity | Mood check-in + emoji | 3-category × 19 moods × 1-10 intensity (wizard) |
| Quick log | Widget on main screen | Guided daily check-in | Tap mood → save | Tap mood → save | Part of daily checklist | Category pick → mood pick → save (dashboard) |
| Context/activities | Multi-select custom activities | Activity tags | Notes only | Full factor tracking (sleep, food, meds, etc.) | Custom goals | Activities, weather, sleep, energy, stress |
| Reflection prompts | Optional note | AI-guided structured prompts | Thinking traps + articles | Optional notes + gratitude | Journaling prompts | 4 optional prompts (went well, challenging, grateful, on mind) |
| Analytics | Rich stats (paid), basic (free) | Mood graphs, correlations | Charts + insights (paid) | 30+ reports, cross-category correlations | Mood trends | Overview + Trends (charts) + Reflections tabs + PDF |
| Calendar | Year in Pixels, monthly grid | Monthly calendar view | Monthly view | Calendar view | Streak view | Monthly heatmap with color-coded cells |
| Gamification | Achievements, goals, streaks | Streaks | Streaks | Goals | Virtual pet + streaks + journeys | Streaks + 14 badge achievements |
| Data export | CSV, PDF (paid) | Export (premium) | PDF, Excel | Health reports (premium) | Journal export | CSV + PDF (analytics report) |
| Privacy model | Local + optional cloud backup | Cloud sync (account) | Local + iCloud | Encrypted cloud | Local + cloud | Local database + optional backup |
| Differentiator | Speed + customization | AI-guided prompts | CBT thinking traps | Health correlation engine | Gamified pet companion | Visual unification + structured reflections + admin panel |

## Sources

- **Daylio** — daylio.net, App Store listing, mwm.ai analysis, heypsych.com review
- **Reflectly** — reflectly.app, reflection.app comparison, macaron.im review, App Store listing
- **Moodnotes** — App Store listing, kidshelpline.com.au review, appshunter.io analysis
- **Bearable** — bearable.app, healthify.nz clinical review, selfpause.com comparison
- **Finch** — finchcare.com, blogs about ADHD/self-care, autonomous.ai review, lifehacker review
- **Industry analysis** — rohy.ai comparison (6 apps), verywellmind.com guide, clustox.com roundup, mindfulsuite.com review, therma.one comparison
- **UAT criteria** — PROJECT-BRIEF.md (full feature specification)
- **Project context** — PROJECT.md (core value, constraints, decisions)

---

*Feature research for: Moodscaparr mood diary application*
*Researched: 2026-07-06*
