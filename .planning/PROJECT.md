# Moodscaparr

## Current Milestone: v1.1 Docker Deployment

**Goal:** Make Moodscaparr deployable and shareable with a simple Docker setup.

**Target features:**
- Dockerfile (Next.js multi-stage build)
- docker-compose.yml (app + Postgres 16 with persistent volumes)
- Environment variable configuration (.env.example)
- Updated README with Docker installation instructions

## What This Is

A daily mood diary web/mobile app that helps users track their emotional wellbeing over time. Users log how they feel each day with optional context (activities, weather, sleep, wellbeing, reflections), and visualize patterns through history, calendar heatmap, analytics/charts, achievement badges, and streak tracking. Includes an admin panel for user/instance management.

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

### Active

<!-- Current scope — building toward these. -->

- [ ] Dockerfile for the Next.js app (multi-stage build)
- [ ] docker-compose.yml with app + Postgres 16 + persistent volumes
- [ ] Environment variable configuration (.env.example)
- [ ] README updated with Docker installation / self-hosting guide

### Out of Scope

- Real-time sync / multiplayer features — single-user diary
- Native mobile apps (iOS/Android) — responsive web first
- Third-party API integrations (calendar, health, etc.) — core diary experience only
- Cloud deployment (Vercel, Railway) — Docker self-hosting only for this milestone

## Context

Moodscaparr v1.0 shipped all 3 MVP phases. 33 routes, auth, mood diary, dashboard, history, analytics, achievements, admin panel — all built and working. The app currently requires a Postgres database running outside the app (Docker container `moodscaper-db` at localhost:5432). This milestone containers the app itself so anyone can self-host with a single command.

## Constraints

- **Visual Unification**: Every mood category color, card rounding, and mood selector button must be identical across every screen (non-negotiable per brief)
- **Dev Owns Architecture**: Stack choice, persistence, design interpretation, and component library are developer's choice
- **First user is admin**: Role-based access with auto-admin for first registered user
- **Keep adapter-pg**: Postgres runs inside the compose stack — no Neon/cloud adapter needed

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Greenfield project | No existing codebase | ✓ Good |
| Responsive web first | Cross-platform reach without native overhead | — Pending |
| Docker self-hosting (v1.1) | Users deploy via `docker compose up` — simple, portable, locally hostable | — Pending |

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
*Last updated: 2026-07-06 after v1.1 milestone start*
