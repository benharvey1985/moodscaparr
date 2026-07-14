---
phase: 07-page-migration
plan: 01
subsystem: ui
tags: [route-group-migration, layout-refactoring, boilerplate-removal]

requires:
  - phase: 06-layout-shell-session
    provides: app/(app)/ route group with requireAuth() and AppLayoutClient
provides:
  - 5 pages migrated from flat app/*/ into app/(app)/ route group
  - Zero Header imports, zero per-page session fetches
  - Removed min-h-screen wrappers, nested <main> tags, pb-12 padding
  - Old flat directories deleted — no route conflicts
affects: [08-cleanup]

tech-stack:
  added: []
  patterns:
    - "Page content renders inside AppLayoutClient's <main> — no per-page wrappers"
    - "Auth inherited from (app)/layout.tsx requireAuth() — no per-page session fetch"

key-files:
  created:
    - app/(app)/analytics/page.tsx
    - app/(app)/calendar/page.tsx
    - app/(app)/achievements/page.tsx
    - app/(app)/history/page.tsx
    - app/(app)/history/loading.tsx
    - app/(app)/history/error.tsx
    - app/(app)/settings/page.tsx
    - app/(app)/settings/layout.tsx
  modified: []
  deleted:
    - app/analytics/ (entire directory)
    - app/calendar/ (entire directory)
    - app/achievements/ (entire directory)
    - app/history/ (entire directory)
    - app/settings/ (entire directory)

key-decisions:
  - "All 5 client pages follow the same 4-step boilerplate removal: delete Header, delete useEffect session fetch, delete min-h-screen wrapper, convert <main> to <div> and remove pb-12"
  - "Settings layout metadata (export const metadata) preserved under (app)/settings/layout.tsx"
  - "history/loading.tsx and history/error.tsx moved as-is — route groups don't change URLs"
  - "Analytics: useRouter was only used for session redirect — removed entirely"
  - "Calendar: useRouter kept for /wizard navigation in empty state"
  - "History: useRouter was only used for session redirect — removed entirely"
  - "Settings: useRouter was only used for session redirect, Separator import was unused — both removed"
  - "Achievements: No remaining state management — page renders AchievementList directly"
  - "Passthrough layouts (analytics/layout.tsx, calendar/layout.tsx, achievements/layout.tsx, history/layout.tsx) deleted — not created under (app)/"

requirements-completed: [UI-07]

duration: 3 min
completed: 2026-07-14
---

# Phase 07: Page Migration — Plan 01 Summary

**5 client pages migrated from flat `app/*/` into `app/(app)/` route group with standard 4-step boilerplate removal — Header, session fetch, min-h-screen wrapper, and nested `<main>` tag all eliminated**

## Performance

- **Duration:** 3 min
- **Started:** 2026-07-14T08:42:53Z
- **Completed:** 2026-07-14T08:46:39Z
- **Tasks:** 3
- **Files modified:** 25 (8 created, 14 deleted, 3 renamed)

## Accomplishments

- Analytics page migrated — no Header, no session fetch, no min-h-screen, no `<main>` tag
- Calendar page migrated — keeps `useRouter` for `/wizard` navigation, both empty/main return paths cleaned
- Achievements page migrated — minimal page, renders AchievementList directly
- History page migrated — keeps TanStack Query data fetching, pagination remains functional
- History loading.tsx and error.tsx migrated as-is — `<Link href="/dashboard">` URLs preserved
- Settings page migrated with metadata preserved via `app/(app)/settings/layout.tsx`
- All 5 old flat directories (`app/analytics/`, `app/calendar/`, `app/achievements/`, `app/history/`, `app/settings/`) deleted — no route conflicts

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate analytics and calendar pages** — `9215550` (feat)
2. **Task 2: Migrate achievements and history pages** — `037fdf5` (feat)
3. **Task 3: Migrate settings page** — `a16691a` (feat)

**Plan metadata:** *(to be committed)*

## Files Created/Modified

| Action | File | Purpose |
|--------|------|---------|
| Created | `app/(app)/analytics/page.tsx` | Migrated analytics — 91 lines, no boilerplate |
| Created | `app/(app)/calendar/page.tsx` | Migrated calendar — 138 lines, dual return paths cleaned |
| Created | `app/(app)/achievements/page.tsx` | Migrated achievements — 21 lines, minimal wrapper |
| Created | `app/(app)/history/page.tsx` | Migrated history — 84 lines, pagination retained |
| Moved | `app/(app)/history/loading.tsx` | As-is migration |
| Moved | `app/(app)/history/error.tsx` | As-is migration, Link URLs preserved |
| Created | `app/(app)/settings/page.tsx` | Migrated settings — 51 lines, no unused imports |
| Renamed | `app/(app)/settings/layout.tsx` | Metadata preserved as-is |
| Deleted | `app/analytics/*` | Old flat directory with 4 files |
| Deleted | `app/calendar/*` | Old flat directory with 4 files |
| Deleted | `app/achievements/*` | Old flat directory with 4 files |
| Deleted | `app/history/*` | Old flat directory with 3 files (page, layout, error — loading renamed) |
| Deleted | `app/settings/*` | Old flat directory with 4 files |

## Decisions Made

- **Analytics/History useRouter removal:** Both pages only used `useRouter` for the session redirect (to `/auth/login`). Since `requireAuth()` in `(app)/layout.tsx` handles this server-side, the redirect was dead code. Removed entirely.
- **Calendar useRouter retention:** Used for navigation to `/wizard` in the empty state button — legitimate use, retained.
- **Settings useRouter/Separator removal:** `useRouter` only used for auth redirect (removed). `Separator` imported but never rendered (removed).
- **Passthrough layouts deleted:** 4 old passthrough layouts (analytics, calendar, achievements, history) deleted. Not recreated under `(app)/`.
- **Settings metadata preserved:** `export const metadata` in settings/layout.tsx kept as-is — provides page title "Settings - Moodscaparr".

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

- Stale Next.js type cache in `.next/types/validator.ts` referenced old file paths — expected after deleting directories. Cleared with `rm -rf .next/types`, fresh `tsc --noEmit` passes cleanly.

## Known Stubs

None identified.

## Threat Flags

None — threat model T-07-01 (spoofing via old routes) mitigated by deleting all 5 old directories. T-07-02 (settings metadata info disclosure) accepted as no PII. T-07-SC (tampering via packages) not applicable — zero packages installed.

## Next Phase Readiness

All 5 "simple" client pages migrated. Ready for Plan 02 (dashboard + wizard + admin migration) or Phase 8 cleanup (delete header.tsx, remove old imports).

---

*Phase: 07-page-migration*
*Completed: 2026-07-14*
