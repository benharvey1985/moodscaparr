# Moodscaparr

## Current Milestone: v1.2 UI Redesign

**Goal:** Modernize Moodscaparr's UI with a glassmorphism/frosted aesthetic, full site-wide layout refresh, and restructured navigation (sidebar + mobile bottom tabs).

**Target features:**
- Glassmorphism/frosted design system (translucent cards, blurred backdrops, depth layers)
- Full site-wide layout restructure with new spacing hierarchy
- Desktop sidebar navigation replacing top nav
- Mobile bottom tab bar for touch navigation
- Responsive redesign across all pages (dashboard, wizard, history, analytics, profile, admin)

## What This Is

A self-hostable daily mood diary web app that helps users track their emotional wellbeing over time. Users log how they feel each day with optional context (activities, weather, sleep, wellbeing, reflections), and visualize patterns through history, calendar heatmap, analytics/charts, achievement badges, and streak tracking. Includes an admin panel for user/instance management. Anyone can deploy with a single `docker compose up` command.

## Core Value

Make mood tracking effortless enough to do daily, rewarding enough to sustain as a habit, and insightful enough to reveal personal emotional patterns.

## Requirements

### Validated

- ✓ User can register and log in with email/password (v1.0)
- ✓ User can log mood via 3-step wizard, quick-log, edit/delete entries (v1.0)
- ✓ Dashboard with KPI cards, streak progress, recent entries (v1.0)
- ✓ Entry history with search, filter, CSV export (v1.0)
- ✓ Calendar heatmap with color-coded cells (v1.0)
- ✓ Analytics with overview, trends, reflections, PDF report (v1.0)
- ✓ 14 achievement badges with confetti/toast unlock (v1.0)
- ✓ User profile/settings with data export/import (v1.0)
- ✓ Admin panel with KPIs, user management, SSO, invite codes (v1.0)
- ✓ All mood visual elements unified via CSS custom property tokens (v1.0)
- ✓ Light/dark/system theme, onboarding tour, feedback system (v1.0)
- ✓ Multi-stage Dockerfile (Alpine, non-root user, standalone output) (v1.1)
- ✓ docker-compose.yml with app + postgres:16-alpine + named volume + health check (v1.1)
- ✓ Auto-migrate entrypoint (prisma migrate deploy on start, fail-fast) (v1.1)
- ✓ /api/health endpoint (200/503 with DB connectivity) (v1.1)
- ✓ .env.example + README with full Docker setup guide (v1.1)
- ✓ .dockerignore for lean build context (v1.1)

### Active

- [ ] Glassmorphism design system with frosted cards, blurred backdrops, and depth layers
- [ ] Desktop sidebar navigation with icon + label links
- [ ] Mobile bottom tab bar navigation
- [ ] Full site-wide layout restructure (all pages)
- [ ] Responsive layout with consistent spacing hierarchy

### Out of Scope

- Real-time sync / multiplayer features — single-user diary
- Native mobile apps (iOS/Android) — responsive web first
- Third-party API integrations (calendar, health, etc.) — core diary experience only
- Cloud deployment (Vercel, Railway) — Docker self-hosting is sufficient for self-hosted users
- CI/CD pipeline — image building is manual for this scale

## Context

Shipped v1.1 Docker Deployment with 168 TypeScript files, 42 commits across 7 days. Tech stack: Next.js 16, Better Auth, Prisma 7 with Neon/Postgres, TanStack Query, shadcn/ui, recharts. The app is fully containerized with multi-stage Dockerfile, docker-compose.yml (app + postgres:16-alpine), auto-migration entrypoint, health endpoint, and comprehensive README. All 13 v1.1 requirements verified against 6/6 UAT tests and 18/18 closed security threats.

Known deferred items: middleware proxy deprecation warning (low), email sending for password reset (low).

## Constraints

- **Visual Unification**: Every mood category color, card rounding, and mood selector button must be identical across every screen (non-negotiable per brief)
- **Dev Owns Architecture**: Stack choice, persistence, design interpretation, and component library are developer's choice
- **First user is admin**: Role-based access with auto-admin for first registered user
- **Postgres in Docker**: Postgres runs inside the compose stack via docker-compose.yml

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Greenfield project | No existing codebase | ✓ Good |
| Responsive web first | Cross-platform reach without native overhead | ✓ Good |
| Docker self-hosting (v1.1) | Users deploy via `docker compose up` — simple, portable, locally hostable | ✓ Shipped |
| Decimal phase numbering | Phase 4.1 inserted after Phase 4 avoids renumbering existing phases | ✓ Good |
| Shell entrypoint (not Node.js) | Fail-fast error handling, explicit migration control | ✓ Good |
| Host port 8080 | Avoids conflict with local dev on port 3000 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-13 after starting v1.2 milestone*
