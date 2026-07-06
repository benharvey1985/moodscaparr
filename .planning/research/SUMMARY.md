# Project Research Summary

**Project:** Moodscaparr
**Domain:** Mood Diary / Journaling Web Application
**Researched:** 2026-07-06
**Confidence:** HIGH

## Executive Summary

Moodscaparr is a greenfield daily mood diary web app. Research confirms it follows a well-established pattern: a full-stack Next.js + PostgreSQL monolith with a 3-tier architecture (client → API routes → database), session-based auth, and server-side gamification. Five competitors (Daylio, Reflectly, Moodnotes, Bearable, Finch) validate the feature set and reveal the #1 risk: **friction kills the daily logging habit** — most users abandon mood apps within 7 days because the logging flow is too slow.

The recommended approach is a modern 2026 stack (Next.js 16 + React 19 + TypeScript + Better Auth + Neon PostgreSQL + Prisma 7 + Tailwind v4 + shadcn/ui) with an 8-phase build order that prioritizes the core logging experience above all else. The single non-negotiable constraint — visual unification of mood elements across every screen — must be enforced via a CSS custom property token system established before any UI is built. Analytics, export, gamification, and admin features are explicitly deferred until the core logging habit is validated.

## Key Findings

### Recommended Stack

The consensus 2026 stack for a new TypeScript full-stack project is Next.js 16 (active LTS with Turbopack as default bundler) + Better Auth (which has won the "best DX" slot for self-hosted auth, recommended over Auth.js for new projects) + Neon PostgreSQL (serverless, scale-to-zero, native Vercel integration) + Prisma 7 (pure-TypeScript + WASM engine, eliminating the old 15MB Rust binary for cold starts under 100ms) + Tailwind CSS v4 (CSS-first configuration, native cascade layers) + shadcn/ui (accessible Radix UI primitives themed via CSS variables that map directly to the 3-category color system).

**Core technologies:**
- **Next.js 16 + React 19**: Full-stack framework, built-in API routes, streaming SSR, React Compiler for auto-memoization
- **Better Auth + Neon PostgreSQL + Prisma 7**: Type-safe auth with SSO/2FA/roles, serverless Postgres with zero-idle cost, WASM-based ORM with typed SQL
- **Tailwind v4 + shadcn/ui**: Utility-first CSS with CSS variable theming, accessible component library, tree-shakeable
- **TanStack Query + Recharts + react-hook-form + Zod**: Server state caching, SVG-based charts, uncontrolled form state, schema validation

### Expected Features

The feature landscape is well-established with 11 table-stakes features (mood logging, activity context, free-text diary, calendar heatmap, streaks, basic stats, dark mode, history search, data export, daily reminders, PIN lock) and 16 differentiators.

**Must have (table stakes):**
- Mood logging (3-category x 19 moods x 1-10 intensity via wizard + quick log) — users expect this from every mood app
- Calendar heatmap with color-coded cells and month stats — "Year in Pixels" is a Daylio hallmark
- Streak tracking (current + longest) with progress — habit motivator present in Daylio, Finch, Reflectly

**Should have (competitive):**
- 14 achievement badges across milestones, streaks, exploration, and special categories — gamification without over-engineering
- Analytics with overview, trends (charts), reflections tab, PDF report — deeper insights (Bearable's differentiator)
- Structured reflection prompts (gratitude, challenges, what went well) — guided journaling reduces blank-page anxiety

**Defer (v2+):**
- AI-powered pattern insights — needs data volume and user trust
- Native mobile apps — responsive web covers launch
- Custom mood names/icons — Daylio-level customization; significant dev cost
- Voice journaling — speech-to-text integration complexity

### Architecture Approach

Standard monolith-first full-stack architecture: Next.js App Router serving both pages (server components by default) and API routes, with a thin service layer calling Prisma ORM directly (no repository abstraction — premature for this scope). The critical architectural pattern is the "Unlock-Then-Award" gamification flow: every mood entry mutation triggers server-side streak recalculation and achievement checking, returning `newAchievements[]` in the response so the frontend can show confetti/toast. Server state is managed by TanStack Query (automatic caching, background refetching, optimistic updates); only pure client state (sidebar, wizard drafts) lives in Zustand.

**Major components:**
1. **Mood Wizard + Quick Log** — multi-step form with progressive disclosure; Quick Log is default (≤3 taps), wizard is expansion
2. **Gamification Engine** — server-side service triggered on entry mutations; streak recalculation + achievement detection + notification collection
3. **Analytics + Calendar Heatmap** — share the same aggregation query layer; analytics gated on retention data, not built first

### Critical Pitfalls

1. **Friction kills the daily habit** — users abandon after 3-7 days if logging takes >10 seconds. Mitigation: Quick Log as default (≤3 taps), wizard with progressive disclosure, target <10s for quick entry, <30s for full entry.

2. **Visual inconsistency of mood elements** — the #1 violated constraint in mood apps. Colors, emojis, card rounding drift across screens when hardcoded. Mitigation: CSS custom property token system (3 categories x 3 intensity shades) established before any UI is built; single `MoodSelector` component used everywhere; grep-verify no hardcoded color values.

3. **Streak system that creates anxiety** — broken streaks drive abandonment, especially in mental health context. Mitigation: 1-2 "rest days" per month, never show countdown timers, frame as "entries this week" not "days in a row," neutral messaging on streak breaks.

4. **Context fatigue** — the 3-step wizard's optional fields feel mandatory when all displayed at once. Mitigation: progressive disclosure (Step 2/3 collapsed behind "Add more detail"), one random reflection prompt per day, compact context chips.

5. **Over-building analytics before PMF** — charts look great in demos but are wasted if users don't log consistently. Mitigation: analytics explicitly gated on retention data (deferred to Phase 4), blank states shown gracefully, PDF export is last priority.

6. **Insecure mood data storage** — mood entries and reflections are intimate data but often stored in plaintext. Mitigation: encrypt entries at rest (AES-256-GCM), user-scoped API queries, sanitize reflection text before logging.

## Implications for Roadmap

Based on research, suggested 8-phase build order with rationale derived from architecture dependencies, feature prioritization, and pitfall prevention:

### Phase 1: Foundation
**Rationale:** Must be first — auth, database, and theme architecture are prerequisites for every feature. Design tokens prevent visual inconsistency before it starts. Dark mode is an architectural decision, not a late addition.
**Delivers:** Next.js 16 project scaffold, Prisma schema (users, sessions), Better Auth integration (email/password + admin detection), CSS variable token system for mood colors (3 categories x 3 intensity shades, dark mode variants), root layout with theme provider, middleware for auth guard
**Uses:** Next.js 16, TypeScript, Better Auth, Prisma 7, Neon PostgreSQL, Tailwind v4, shadcn/ui, next-themes
**Avoids:** Pitfall 2 (visual inconsistency — tokens established before UI), Pitfall 6 (insecure data — auth + encryption from day one), Pitfall 9 (dark mode retrofit — both palettes defined upfront)

### Phase 2: Core Diary
**Rationale:** The primary user action. Must ship Quick Log before wizard refinement (Pitfall 1: friction). Progressive disclosure prevents context fatigue (Pitfall 4). Offline buffer prevents data loss (Pitfall 10).
**Delivers:** Entry model + mood service (CRUD), API routes for entries, 3-step wizard component (with collapsed Step 2/3), Quick Log component (≤3 taps from dashboard), localStorage draft buffer + pending sync indicator, Zod validation schemas, Entry type definitions
**Uses:** react-hook-form + Zod (wizard), TanStack Query (mutation + cache invalidation)
**Implements:** Architecture Pattern 2 (Service → Repository), Pattern 1 (Server Component → Client Island)
**Avoids:** Pitfall 1 (friction — Quick Log is default), Pitfall 4 (context fatigue — progressive disclosure), Pitfall 10 (offline data loss — localStorage buffer)

### Phase 3: Dashboard + History
**Rationale:** Consumes data from Phase 2. Dashboard is the home screen users see most; entry history is primary data retrieval. Calendar heatmap starts from first entry and defaults to 4-week view to avoid "wall of shame" (Pitfall 7).
**Delivers:** Dashboard page (server component with client islands: greeting, today's status, KPI cards, recent entries, streak bar), entry history page (paginated, searchable, filterable), calendar heatmap (color-coded cells, month stats, 4-week default, muted empty cells), entry detail dialog, entry edit/delete
**Uses:** Recharts (mini charts on dashboard), date-fns (date math, timezone handling), TanStack Query (useMoodEntries hook pattern)
**Implements:** Data Flow 2 (Dashboard load — parallel Prisma queries)
**Avoids:** Pitfall 7 (calendar shame — new-user-first-entry start, muted empty cells)

### Phase 4: Analytics
**Rationale:** Requires accumulated data from Phase 2+3. Gated on retention — build the containers (blank states) but defer complex rendering until users are logging consistently for 30+ days (Pitfall 5). PDF export is explicitly last within this phase (<5% of users use it even in mature apps).
**Delivers:** Analytics page (Overview + Trends + Reflections tabs), mood timeline (LineChart), day-of-week comparison (BarChart), wellbeing trends (LineChart), activity impact (BarChart), mood distribution (PieChart), word cloud (top 50 words, server-side frequency), PDF report generation (jsPDF + html2canvas), blank states for insufficient data
**Uses:** Recharts (6 chart types), date-fns (date range filtering 7d/30d/90d), jsPDF + html2canvas (PDF report)
**Implements:** Data Flow 4 (Chart data — aggregation queries on server)
**Avoids:** Pitfall 5 (over-building analytics — blank states, deferred PDF, gated on retention)

### Phase 5: Gamification
**Rationale:** Depends on entry data from Phase 2 for streak calculation and achievement criteria. Streak forgiveness (rest days) and perverse-incentive review (Pitfall 11) must be built in from the start, not retrofitted. Achievement notifications deferred to next dashboard load (don't interrupt logging).
**Delivers:** Streak service (current + longest, 1-2 rest days/month, timezone-aware, positive-only framing), achievement engine (14 badges checked on entry mutations), badge definitions (milestone, streak, exploration, special categories), confetti system (canvas-confetti), unlock notification (Sonner toast on next dashboard load), streak progress bar component
**Uses:** canvas-confetti (celebrations), Sonner (toast notifications)
**Implements:** Architecture Pattern 3 (Unlock-Then-Award — gamification triggered on every entry mutation)
**Avoids:** Pitfall 3 (streak anxiety — rest days, no countdown, positive framing), Pitfall 11 (perverse incentives — remove "log all 19 moods," reward consistency over quantity)

### Phase 6: Profile + Settings
**Rationale:** Requires streak and achievement data from Phase 5 for profile display. Onboarding tour (Pitfall 12) must be skippable and contextual — single welcome card, not forced tutorial. Theme toggle in navbar (not buried in settings). Reminder notifications requested after habit is forming (not on day 1).
**Delivers:** Profile page (name, country, theme, timezone, streak goal, daily reminder), settings form, onboarding tour (single welcome card + tooltip hints, skippable), reminder notification system (Web Push API), theme toggle in header, data export (CSV client-side generation)
**Uses:** react-joyride (onboarding tour), next-themes (theme toggle), react-csv or custom CSV hook
**Avoids:** Pitfall 12 (onboarding overload — skippable, contextual, single-welcome-card approach)

### Phase 7: Admin Panel
**Rationale:** Explicitly deferred (Pitfall 8). At launch, the single admin can manage users via database directly. Only build admin features when user base exceeds 50 or multiple admins exist. MVP admin = single protected route with user count + delete user button.
**Delivers:** Admin dashboard (user count, basic KPIs), user management table (list, search, delete), instance settings (SSO toggles, invite code system), role management, registration trend chart
**Uses:** shadcn/ui Table, Dialog, Tabs, Badge components
**Avoids:** Pitfall 8 (admin panel over-built — MVP only, advanced features gated on need)

### Phase 8: Theme + Polish
**Rationale:** Final quality pass. Visual regression testing across all screens ensures the token system from Phase 1 hasn't drifted. Dark mode audit ensures all 3 category colors pass WCAG AA on dark backgrounds. Performance testing at scale boundaries.
**Delivers:** Visual regression test suite (screenshot comparison of mood elements across screens), dark mode audit (WCAG AA contrast verification), animation polish (micro-interactions, transitions), performance optimization (composite indexes, pagination verification), security audit (penetration test targeting mood data endpoints), "Looks Done But Isn't" checklist verification
**Uses:** Playwright (visual regression tests), Vitest (unit + integration tests)
**Avoids:** Pitfall 9 (dark mode — audit verifies both palettes), integrates all pitfall prevention verification steps from the Pitfall-to-Phase Mapping

### Phase Ordering Rationale

- **Auth + Tokens first (Phase 1):** Every feature requires authentication. Design tokens must exist before any UI component is built. Dark mode palettes are an architectural decision, not a retrofit. This prevents the three most expensive pitfalls (visual inconsistency, insecure data, dark mode retrofit) from day one.
- **Core logging before everything else (Phase 2):** The app lives or dies on the logging experience. Quick Log as default, wizard with progressive disclosure. Nothing else matters if users stop logging after 3 days. This directly addresses the #1 killer (friction).
- **Dashboard + history next (Phase 3):** Users need to see their data to feel the app is working. KPI cards, calendar heatmap, entry list — all consume Phase 2 data. Calendar heatmap design must account for new-user experience (no empty cells, no "wall of shame").
- **Analytics deferred (Phase 4):** Analytics look great in demos but require consistent data to be useful. Blank states for insufficient data prevent empty chart syndrome. PDF export is the lowest priority within this phase.
- **Gamification after core habits (Phase 5):** Streaks and achievements depend on entry data. Building them too early risks designing incentives that reward quantity over authenticity. Streak forgiveness must be built in from the start.
- **Profile + admin last (Phase 6-7):** Profile settings and admin panel are infrastructure, not value. The admin panel in particular is a solution to a scaling problem that doesn't exist at launch. MVP admin = one route with user count.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Gamification):** Badge criteria need user-testing for perverse incentives. The "recovery" badges (logged after a 3+ day gap) need validation that they encourage returning rather than reminding of absence.
- **Phase 4 (Analytics):** PDF report generation with jsPDF + html2canvas needs spike testing — rendering React components to canvas for PDF embedding has edge cases with chart image quality and page breaks.
- **Phase 2 (Core Diary):** Offline buffer implementation (localStorage queue + pending sync indicator) needs edge-case testing for queue conflicts and data integrity when sync fails partially.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Well-documented, established patterns for Next.js + Prisma + Better Auth + shadcn/ui. Framework documentation covers all decisions.
- **Phase 3 (Dashboard + History):** Standard CRUD UI patterns. Pagination, search, filter are well-understood.
- **Phase 7 (Admin Panel):** Standard CRUD admin patterns. User management tables, invite codes, role toggles are well-documented in Better Auth docs.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Verified against official docs (Next.js 16, Prisma 7, shadcn/ui 4.13, Zod 4, date-fns 4) and multiple 2026 sources. Better Auth confirmed as new-project default over Auth.js. |
| Features | HIGH | Validated against 5 competing products (Daylio, Reflectly, Moodnotes, Bearable, Finch) plus industry analysis (rohy.ai, verywellmind.com, clustox.com). MVP definition aligns with project brief. |
| Architecture | HIGH | Conventional full-stack monolith pattern with well-established Next.js App Router conventions. Service-layer pattern verified against DailyMood case study and multiple Next.js reference architectures. |
| Pitfalls | HIGH | Derived from app store reviews (15+ apps), post-mortems, HCI research on gamification in mental health, and personal analysis of 10+ mood diary apps. Recovery strategies validated against known patterns from indie developer communities. |

**Overall confidence:** HIGH

### Gaps to Address

- **Offline buffer edge cases:** localStorage queue implementation needs spike testing for concurrent tab conflicts, quota limits (especially with reflection text), and partial sync failure recovery. Address during Phase 2 planning.
- **PDF report quality:** jsPDF + html2canvas conversion of Recharts charts may produce low-resolution or layout-broken PDFs. Needs a spike in Phase 4 planning to validate approach or identify alternative (e.g., server-side PDF with puppeteer).
- **Badge criteria validation:** The 14 badges defined in the brief need review against perverse-incentive criteria before implementation. "Log all 19 moods" badge is explicitly flagged as harmful. Badge set must be finalized during Phase 5 planning with user feedback.
- **Timezone handling complexity:** Entry dates for streak calculation must use the user's profile timezone, not server timezone. Edge cases (DST transitions, timezone changes mid-streak, entries at 11:59pm vs 12:01am) need explicit test cases. Address during Phase 2 planning.

## Sources

### Primary (HIGH confidence)
- nextjs.org/blog — Next.js 16.x release cycle, active LTS confirmed (GA Oct 2025)
- ui.shadcn.com/docs/changelog — shadcn/ui 4.13.0 with Base UI as default (July 2026)
- prisma.io/docs/guides/upgrade-prisma-orm/v7 — Prisma 7 GA, WASM engine, typed SQL stable
- versions.dev/modernize/nextjs — Next.js 16.x active LTS confirmation
- npm registry — Recharts 3.9.1, TanStack Query 5.101.2, react-hook-form 7.81.0, Zod 4.4.3, date-fns 4.4.0 version verification

### Secondary (MEDIUM confidence)
- cadence.withremote.ai/blog/prisma-2026-guide — Prisma 7 cold-start improvements (800ms → <100ms)
- Better Auth vs Auth.js comparison — Multiple 2026 sources confirm Better Auth as new-project default
- Neon vs Supabase comparison — Multiple 2026 sources confirm Neon for pure-Postgres on Vercel
- DailyMood case study (dev.to) — Real Next.js 15 + Supabase + Recharts mood tracker; validated architecture patterns
- Competitor analysis (Daylio, Reflectly, Moodnotes, Bearable, Finch) — Feature validation from app listings, reviews, and comparison articles
- rohy.ai comparison (6 apps) — Industry landscape overview

### Tertiary (LOW confidence)
- None — all findings confirmed by multiple sources

---
*Research completed: 2026-07-06*
*Ready for roadmap: yes*
