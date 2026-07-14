# Roadmap: Moodscaparr

## Overview

Phase 1–3 built the full MVP: auth, mood diary, dashboard, history, analytics, achievements, admin. Phase 4 containerized the entire app for single-command self-hosting. v1.2 modernizes the UI with a sidebar + bottom-tab navigation architecture, route groups, session infrastructure, and eliminates 7x duplicated layout boilerplate.

## Milestones

- ✅ **v1.0 MVP** — Phases 1-3 (shipped 2026-07-06)
- ✅ **v1.1 Docker Deployment** — Phase 4, 4.1 (shipped 2026-07-13)
- ✅ **v1.2 UI Redesign** — Phases 5-8 (shipped 2026-07-14)
- 📋 **v2.0** — Planned

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-3) — SHIPPED 2026-07-06</summary>

- [x] Phase 1: Foundation & Core Diary (3/3 plans) — completed 2026-07-06
- [x] Phase 2: Dashboard, History & Insights (4/4 plans) — completed 2026-07-06
- [x] Phase 3: Gamification, Profile & Admin (2/2 plans) — completed 2026-07-06

</details>

<details>
<summary>✅ v1.1 Docker Deployment (Phases 4-4.1) — SHIPPED 2026-07-13</summary>

- [x] Phase 4: Docker Deployment (1/1 plans) — completed 2026-07-06
- [x] Phase 04.1: Address Documentation Gaps (1/1 plans) — completed 2026-07-13 (INSERTED)

</details>

<details>
<summary>✅ v1.2 UI Redesign (Phases 5-8) — SHIPPED 2026-07-14</summary>

- [x] **Phase 5: Foundation** — Route groups & nav config module (completed 2026-07-14)
- [x] **Phase 6: Layout Shell & Session** — Sidebar, bottom tabs, responsive layout, session provider (completed 2026-07-14)
- [x] **Phase 7: Page Migration** — All 8 pages migrated to `(app)/` route group (completed 2026-07-14)
- [x] **Phase 8: Cleanup** — Removed unused Header component (completed 2026-07-14)

</details>

### 📋 v2.0 (Planned)

- [ ] Phase 9+: TBD

## Phase Details

### Phase 5: Foundation

**Goal**: Route groups and navigation config established with zero visual change
**Depends on**: Nothing within v1.2
**Requirements**: UI-03, UI-04
**Success Criteria** (what must be TRUE):

  1. Route groups `(app)` and `(auth)` exist with correct folder structure — all existing URLs unchanged
  2. `lib/navigation.ts` exports typed NavItem array with all nav items, icons, URLs, and adminOnly flags
  3. Both `(app)` and `(auth)` layouts render placeholder content without breaking existing page behavior
  4. Old auth pages remain accessible under original `/auth/*` URLs during transition

**Plans**: 1 plan

Plans:

- [x] 05-01-PLAN.md — Route group shells + navigation config module

### Phase 6: Layout Shell & Session

**Goal**: Users see new sidebar/bottom-tab navigation with persistent session — no more flash-of-login-form on navigation
**Depends on**: Phase 5
**Requirements**: UI-01, UI-02, UI-05, UI-06
**Success Criteria** (what must be TRUE):

  1. Desktop users (≥1024px) see a collapsible sidebar with icon+label links and active route highlighting
  2. Mobile users (<1024px) see a bottom tab bar with 5 tabs, safe-area-aware, no content overlap
  3. Session/auth state is provided at root layout — no page fetches its own session via useEffect
  4. SidebarProvider lives in root `app/layout.tsx` — collapse state persists across navigations
  5. Nav items in both sidebar and bottom tabs draw from the single `lib/navigation.ts` config

**Plans**: 2 plans
**UI hint**: yes

Plans:
**Wave 1**

- [x] 06-01-PLAN.md — Install shadcn sidebar + avatar component families

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 06-02-PLAN.md — Create layout shell components + wire root/app layouts

### Phase 7: Page Migration

**Goal**: All pages use new layout shell cleanly, Header boilerplate eliminated
**Depends on**: Phase 6
**Requirements**: UI-07
**Success Criteria** (what must be TRUE):

  1. All 7+ pages render correctly inside `(app)` layout with zero Header imports
  2. No page has its own useEffect session fetch — session comes from provider
  3. No page has `min-h-screen` or wrapper div that conflicts with layout shell
  4. Every page content area properly respects bottom tab padding (`pb-safe`)

**Plans**: 2 plans
**UI hint**: yes

Plans:
**Wave 1**

- [x] 07-01-PLAN.md — Bulk client-page migration (analytics, calendar, achievements, history, settings)
- [x] 07-02-PLAN.md — Special-case page migration (dashboard, admin, wizard)

### Phase 8: Cleanup

**Goal**: Old code removed, no regression
**Depends on**: Phase 7
**Requirements**: UI-08
**Success Criteria** (what must be TRUE):

  1. `components/header.tsx` deleted — zero `import.*Header from` matches across codebase
  2. All 8 migrated pages load without errors in both desktop and mobile viewports
  3. No console errors related to missing layout infrastructure or orphaned imports

**Plans**: 0 plans (inline cleanup)

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|---------------|--------|-----------|
| 1. Foundation & Core Diary | v1.0 | 3/3 | ✅ Complete | 2026-07-06 |
| 2. Dashboard, History & Insights | v1.0 | 4/4 | ✅ Complete | 2026-07-06 |
| 3. Gamification, Profile & Admin | v1.0 | 2/2 | ✅ Complete | 2026-07-06 |
| 4. Docker Deployment | v1.1 | 1/1 | ✅ Complete | 2026-07-06 |
| 04.1. Address Documentation Gaps | v1.1 | 1/1 | ✅ Complete | 2026-07-13 |
| 5. Foundation | v1.2 | 1/1 | Complete   | 2026-07-14 |
| 6. Layout Shell & Session | v1.2 | 2/2 | Complete   | 2026-07-14 |
| 7. Page Migration | v1.2 | 2/2 | Complete   | 2026-07-14 |
| 8. Cleanup | v1.2 | inline | ✅ Complete | 2026-07-14 |
