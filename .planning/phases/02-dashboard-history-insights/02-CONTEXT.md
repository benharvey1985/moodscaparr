# Phase 2 Context: Dashboard, History & Insights

**Requirements**: DASH-01–DASH-06, HIST-01–HIST-06, CAL-01–CAL-07, ANAL-01–ANAL-06, STRK-01–STRK-05, ONBRD-01–ONBRD-03, FDBK-01–FDBK-04

## Current State
- Next.js 16, Prisma 7 (adapter-pg), Postgres (local Docker)
- Better Auth 1.6 with email/password, admin plugin
- MoodEntry model in DB with: userId, category, moodIndex, intensity, date, activities, weather, sleepHours, sleepQuality, energyLevel, stressLevel, reflection1-4
- UserProfile model linked to user (name, country, timezone, streakGoal, onboardingComplete)
- TanStack Query with optimistic updates for mood entries
- 19 moods across 3 categories (POSITIVE/NEUTRAL/NEGATIVE)

## Phase 2 Plans

| Plan | Requirements | Files | Wave |
|------|-------------|-------|------|
| 02-01 | DASH-01–DASH-06, STRK-01–STRK-05 | app/dashboard/*, components/dashboard/*, hooks/use-streak.ts, lib/stats.ts | 1 |
| 02-02 | HIST-01–HIST-06, CAL-01–CAL-07 | app/history/*, app/calendar/*, components/history/*, components/calendar/* | 2 |
| 02-03 | ANAL-01–ANAL-06 | app/analytics/*, components/analytics/* | 3 |
| 02-04 | ONBRD-01–ONBRD-03, FDBK-01–FDBK-04 | components/onboarding/*, components/feedback/* | 4 |

## Key Decisions
- Dashboard (Phase 1 placeholder `/dashboard`) gets full rewrite with KPI cards, streak, Quick Log, recent entries
- Streak tracking via server-side computation (timezone-aware, 1-2 rest days/month)
- Calendar heatmap: custom CSS grid (no library) for performance
- Analytics charts: recharts library
- Onboarding: local state check (UserProfile.onboardingComplete)
- Feedback: simple dialog form → opens GitHub issue URL
- CSV export: client-side generation with date-fns formatting
- PDF report: deferred to use browser print-to-PDF (instead of heavy lib)
- All new pages need loading.tsx + error.tsx wrappers per Phase 1 pattern
