# Roadmap: Moodscaparr

## Overview

Phase 1–3 built the full MVP: auth, mood diary, dashboard, history, analytics, achievements, admin. Phase 4 containers the entire app so anyone can self-host with a single Docker command.

## Phases

- [x] **Phase 1: Foundation & Core Diary** - Auth, mood logging wizard, quick log, edit/delete, visual theme system, and design tokens
- [x] **Phase 2: Dashboard, History & Insights** - Dashboard home, entry history, calendar heatmap, analytics, streak tracking, onboarding, and feedback system
- [x] **Phase 3: Gamification, Profile & Admin** - User profile and settings, achievement badges, and admin panel
- [ ] **Phase 4: Docker Deployment** - Dockerfile, docker-compose, persistent volumes, health endpoint, env config, README

## Phase Details

### Phase 1: Foundation & Core Diary
**Goal**: Users can securely access their accounts and log daily moods via a fast, consistent interface
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01–AUTH-09, MOOD-01–MOOD-10, QUICK-01–QUICK-02, EDIT-01–EDIT-03, THEME-01–THEME-04, VISUAL-01–VISUAL-05, SEED-01–SEED-02
**Success Criteria** (what must be TRUE):
  1. User can register with email/password, log in, and stay logged in across browser refreshes; first registered user is admin
  2. User can log a mood via a 3-step wizard with all context options (activities, weather, sleep, energy, stress, reflection prompts) using progressive disclosure
  3. User can quick-log a mood in ≤3 taps from the dashboard with sensible defaults
  4. User can edit and delete existing entries with confirmation dialog
  5. All mood visual elements (3 category colors, card rounding, mood selector buttons) are identical across every screen via CSS custom property tokens
**Plans**: 3 plans
**UI hint**: yes

Plans:
- [x] 01-01-PLAN.md — Foundation (scaffolding, auth, database, design tokens, theme)
- [x] 01-02-PLAN.md — Core Diary (wizard, quick log, edit/delete)
- [x] 01-03-PLAN.md — Polish & Seed (seed data, edge cases, error states)

### Phase 2: Dashboard, History & Insights
**Goal**: Users can view their mood patterns, explore history, gain insights, and receive onboarding guidance
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: DASH-01–DASH-06, HIST-01–HIST-06, CAL-01–CAL-07, ANAL-01–ANAL-06, STRK-01–STRK-05, ONBRD-01–ONBRD-03, FDBK-01–FDBK-04
**Success Criteria** (what must be TRUE):
  1. User sees a personalized dashboard with time-aware greeting, today's status, quick log, KPI cards, recent entries, and streak progress toward goal
  2. User can browse, search, and filter entry history, view full details in a dialog, edit/delete from history view, and export entries as CSV
  3. User can navigate a color-coded calendar heatmap with month stats, click days for entry details, with muted empty cells before first entry
  4. User can view analytics with Overview (KPIs, mood balance, wellbeing stats), Trends (mood timeline, day-of-week, weather, wellbeing, activity charts), and Reflections tabs, filtered by date range, with PDF report download
  5. User sees current/longest streak with visual progress bar, completes a skippable 3-step onboarding tour on first login, and can submit feedback via a FAB button
**Plans**: 4 plans
**UI hint**: yes

Plans:
- [x] 02-01-PLAN.md — Enhanced Dashboard & Streak (KPI cards, streak tracking, today's status)
- [x] 02-02-PLAN.md — History & Calendar Heatmap (search, filter, detail dialog, CSV export, calendar grid)
- [x] 02-03-PLAN.md — Analytics Suite (overview, trends charts, reflections, date range filtering)
- [x] 02-04-PLAN.md — Onboarding & Feedback (3-step tour, FAB button, GitHub issue integration)

### Phase 3: Gamification, Profile & Admin
**Goal**: Users can personalize their experience, earn achievements for consistent logging, and admins can manage the instance
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: PROF-01–PROF-10, ACHV-01–ACHV-07, ADMIN-01–ADMIN-14
**Success Criteria** (what must be TRUE):
  1. User can edit full profile (name, country, theme, timezone, date format, streak goal, daily reminder), view achievement summary, and export/restore data as JSON
  2. User earns 14 achievement badges across milestone, streak, exploration, and special categories with progress bars, confetti animation, and toast notification on unlock
  3. Admin can view dashboard KPIs (users, entries, streaks), mood/registration trends and charts, manage users (search, promote, suspend, delete with undo), configure SSO providers, and generate/revoke invite codes
  4. Admin can export dashboard data as CSV and toggle seed data for development/testing
**Plans**: 2 plans
**UI hint**: yes

Plans:
- [x] 03-01-PLAN.md — Achievements (14 badges, progress bars, confetti unlock, toast notifications)
- [x] 03-02-PLAN.md — Profile & Admin (profile editing, data export/import, admin dashboard, user management, SSO, invite codes)

### Phase 4: Docker Deployment
**Goal**: Anyone can self-host Moodscaparr with a single `docker compose up` command, with data persisting across container updates
**Mode**: mvp
**Depends on**: Phase 3 (requires full app to exist)
**Requirements**: DOCK-01–DOCK-05, COMP-01–COMP-04, CONF-01–CONF-02, QUAL-01–QUAL-02
**Success Criteria** (what must be TRUE):
  1. User can clone repo, run `docker compose up`, and access the app at localhost:3000
  2. Database data persists when container is stopped, restarted, or the image is updated
  3. Prisma migrations run automatically on container startup
  4. `/api/health` returns 200 with DB connectivity status
  5. `.env.example` documents all required variables; README explains the Docker setup
**Plans**: 1 plan
**UI hint**: no

Plans:
- [ ] 04-01-PLAN.md — Docker Deployment (Dockerfile, compose, entrypoint, health endpoint, docs)

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Core Diary | 3/3 | Complete | 2026-07-06 |
| 2. Dashboard, History & Insights | 4/4 | Complete | 2026-07-06 |
| 3. Gamification, Profile & Admin | 2/2 | Complete | 2026-07-06 |
| 4. Docker Deployment | 0/1 | Not started | — |
