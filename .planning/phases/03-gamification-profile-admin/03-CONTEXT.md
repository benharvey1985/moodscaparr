# Phase 3 Context: Gamification, Profile & Admin

**Requirements**: PROF-01–PROF-10, ACHV-01–ACHV-07, ADMIN-01–ADMIN-14

## Current State
- Next.js 16, Prisma 7 (adapter-pg), Postgres (local Docker)
- Better Auth 1.6 with admin plugin, roles via `user.role` (string, "user"|"admin")
- User model: id, name, email, role, banned, banReason, banExpires
- UserProfile model: id (FK user), name, country, timezone (default "UTC"), streakGoal (Int, default 7), onboardingComplete (Boolean)
- MoodEntry with full context (activities, weather, sleep, energy, stress, reflections)
- Streak tracking via 02-01 lib/stats.ts
- Analytics with recharts (02-03)
- TanStack Query throughout

## Key Libraries Available
- recharts (for admin charts)
- lucide-react (icons)
- shadcn/ui (Table, Dialog, Card, Button, Badge, etc.)
- date-fns v4 (formatting)
- Zod v4.4.3 (validation)

## Phase 3 Plans

| Plan | Requirements | Wave |
|------|-------------|------|
| 03-01 | ACHV-01–ACHV-07 | 1 — Achievements |
| 03-02 | PROF-01–PROF-10, ADMIN-01–ADMIN-14 | 2 — Profile + Admin (parallel) |

## Design Decisions
- Achievement badge definitions stored as const in code, not DB
- Achievement progress serialized into Achievement model per user
- Unlock check triggered server-side after POST /api/mood-entries or streak change
- Confetti: canvas-confetti npm package (lightweight)
- Profile uses existing User + UserProfile models
- Data export/restore: JSON with version stamp, drag-and-drop file upload for restore
- Admin dashboard uses recharts (already installed)
- Admin user management: Table + inline actions, undo via soft-delete + timeout
- SSO: UI-only toggle for enabling/disabling providers (actual OAuth setup deferred)
- Invite codes: server-generated, time-limited, uses existing InviteCode model (defined in Phase 1 schema but not yet active)
