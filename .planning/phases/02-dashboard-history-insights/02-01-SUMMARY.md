# 02-01: Enhanced Dashboard & Streak — Summary

**Status**: ✅ Complete  
**Build**: ✅ Passed (Next.js 16.2.10, zero errors)

## Files Created

| File | Purpose |
|------|---------|
| `lib/stats.ts` | Server-side stats library: `computeStreak`, `getAverageMoodScore`, `getMoodBalance`, `getEntriesThisWeek` |
| `app/api/streak/route.ts` | `GET /api/streak` — returns `{ current, longest }` for auth'd user |
| `app/api/stats/route.ts` | `GET /api/stats` — returns `{ totalEntries, avgMoodScore, moodBalance, entriesThisWeek, currentStreak, longestStreak, streakGoal }` |
| `lib/api/streak.ts` | Client fetch wrappers `fetchStreak()` and `fetchStats()` with types |
| `hooks/use-streak.ts` | TanStack Query hooks `useStreak()` and `useStats()` |
| `app/dashboard/page.tsx` | Rewritten enhanced dashboard (see below) |
| `app/dashboard/error.tsx` | Next.js error boundary with reset/home actions |

## Dashboard Features

1. **Time-aware greeting** — "Good morning/afternoon/evening, {name}"
2. **Today's status** — mood emoji + label if logged; "No entry yet today" if not
3. **KPI cards** — 4-card responsive grid: Total Entries, Avg Mood Score, Current Streak, Entries This Week
4. **Streak progress bar** — `{current}/{goal}` with gradient progress bar; "Goal reached!" messaging
5. **Quick Log section** — reuses existing `QuickLog` component
6. **Recent entries** — last 5 via `EntryCard` + `DeleteDialog`
7. **Empty state** — "Log your first mood!" → /wizard
8. **Loading** — `DashboardSkeleton` during initial fetch
9. **Error** — route-level error.tsx + component-level ErrorBoundary

## Streak Logic

- Timezone-aware via `Intl.DateTimeFormat` with user's profile timezone
- `computeStreak` walks sorted unique dates; counts consecutive days allowing up to `restDaysAllowed` (default 2) gap days
- Current streak requires most recent entry within rest day allowance of today
- Longest streak found by scanning full history

## API Endpoints

- `GET /api/streak` — authenticated, timezone-aware streak computation
- `GET /api/stats` — aggregated stats from user's entries
