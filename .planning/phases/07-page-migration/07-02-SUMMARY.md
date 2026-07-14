---
phase: 07-page-migration
plan: 02
subsystem: ui
tags: [route-group-migration, layout-refactoring, requireAdmin, server-component-migration]

# Dependency graph
requires:
  - phase: 06-layout-shell-session
    provides: app/(app)/ route group with requireAuth() and AppLayoutClient
  - phase: 07-page-migration
    plan: 01
    provides: 5 client pages migrated to app/(app)/ with standard 4-step pattern
provides:
  - Dashboard page migrated under (app)/ with greeting and onboarding tour special handling
  - Admin page migrated under (app)/ with NEW requireAdmin() server-side layout
  - Wizard server component migrated under (app)/ with layout stripped
  - All 3 old flat directories deleted — no route conflicts
affects: [08-cleanup]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Admin role enforcement via server-side requireAdmin() layout (not per-page useEffect)"
    - "Server component pages (wizard) keep requireAuth() call — redundant with layout but harmless"
    - "Error/loading boundaries under (app)/ must not use min-h-screen or nested <main>"

key-files:
  created:
    - app/(app)/dashboard/page.tsx — Migrated dashboard with greeting-only and unconditional onboarding tour
    - app/(app)/admin/page.tsx — Migrated admin with tab state (no session/useEffect)
    - app/(app)/admin/layout.tsx — NEW server-side admin role guard using requireAdmin()
    - app/(app)/wizard/page.tsx — Migrated wizard server component, layout stripped
  modified:
    - app/(app)/admin/error.tsx — Removed min-h-screen and flex-col wrappers
    - app/(app)/admin/loading.tsx — Replaced full-page emulation with content-only skeleton
  deleted:
    - app/dashboard/ (entire directory)
    - app/admin/ (entire directory)
    - app/wizard/ (entire directory)
    - app/(app)/wizard/layout.tsx (passthrough layout deleted)

key-decisions:
  - "Dashboard greeting simplified to just time-of-day greeting — no user.name since session variable removed"
  - "Onboarding tour fetch made unconditional (auth guaranteed by layout), dependency changed to []"
  - "Admin role enforcement via server-side requireAdmin() layout — replaces per-page client-side useEffect + router.push"
  - "Wizard layout (passthrough with min-h-screen) deleted entirely — no metadata to preserve"
  - "Wizard page keeps requireAuth() call — redundant with (app)/layout.tsx but harmless (per research A2)"
  - "Admin error.tsx and loading.tsx boundaries stripped of min-h-screen and nested <main> — they render inside AppLayoutClient"

patterns-established:
  - "Route group nested pages must not use min-h-screen wrappers or nested <main> tags"
  - "Error/loading boundaries under (app)/ render inside AppLayoutClient — should be content-only, not full-viewport"
  - "Server components inside (app)/ can keep redundant requireAuth() without side effects"

requirements-completed: [UI-07]

# Metrics
duration: 4 min
completed: 2026-07-14
---

# Phase 07: Page Migration — Plan 02 Summary

**3 special-case pages (dashboard, admin, wizard) migrated from flat `app/*/` into `app/(app)/` route group with page-specific handling — dashboard greeting simplified, onboarding tour made unconditional, admin gets server-side requireAdmin() layout, wizard layout stripped, all old directories deleted**

## Performance

- **Duration:** 4 min
- **Started:** 2026-07-14T08:49:07Z
- **Completed:** 2026-07-14T08:52:29Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Dashboard page migrated — greeting simplified to time-of-day only, onboarding tour made unconditional (auth guaranteed by layout)
- Admin page migrated with NEW `app/(app)/admin/layout.tsx` — server-side `requireAdmin()` guard replaces per-page client-side useEffect + role check
- Wizard server component migrated — Header removed, `<main>` replaced with `<div>`, fragment wrapper removed, layout.tsx deleted entirely
- All 3 old flat directories (`app/dashboard/`, `app/admin/`, `app/wizard/`) deleted — no route conflicts
- Admin error.tsx and loading.tsx boundaries cleaned up — removed `min-h-screen` and nested `<main>` that conflicted with AppLayoutClient
- TypeScript compilation passes with zero errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate dashboard page with special-case handling** — `fbf88be` (feat)
2. **Task 2: Migrate admin page and create requireAdmin layout** — `ed07f19` (feat)
3. **Task 3: Migrate wizard server component and strip layout** — `ad9dfe3` (feat)

**Fix commit:** `4ad8abe` (fix — strip min-h-screen from admin error/loading boundaries)

**Plan metadata:** *(to be committed)*

## Files Created/Modified

| Action | File | Purpose |
|--------|------|---------|
| Created | `app/(app)/dashboard/page.tsx` | Migrated dashboard — no Header, no session fetch, greeting-only, unconditional onboarding tour (166 lines) |
| Created | `app/(app)/admin/page.tsx` | Migrated admin — no Header, no useEffect, no session/loading states (46 lines) |
| Created | `app/(app)/admin/layout.tsx` | NEW server-side admin role guard with `requireAdmin()` and metadata title (10 lines) |
| Created | `app/(app)/wizard/page.tsx` | Migrated wizard server component — no Header, no fragment, `<div>` not `<main>` (14 lines) |
| Modified | `app/(app)/admin/error.tsx` | Removed `min-h-screen flex-col` wrapper (renders inside AppLayoutClient) |
| Modified | `app/(app)/admin/loading.tsx` | Replaced full-page layout emulation with content-only skeleton matching page pattern |
| Moved | `app/(app)/dashboard/error.tsx` | As-is migration |
| Moved | `app/(app)/dashboard/loading.tsx` | As-is migration |
| Moved | `app/(app)/wizard/wizard-edit.tsx` | As-is migration (no changes needed) |
| Moved | `app/(app)/wizard/loading.tsx` | As-is migration |
| Deleted | `app/dashboard/*` | Old flat directory (3 files) |
| Deleted | `app/admin/*` | Old flat directory (4 files — page, layout, error, loading) |
| Deleted | `app/wizard/*` | Old flat directory (4 files — page, layout, loading, wizard-edit) |
| Deleted | `app/(app)/wizard/layout.tsx` | Passthrough layout deleted entirely (no metadata to preserve) |

## Decisions Made

- **Dashboard greeting simplified:** Changed from `{greeting}, {session?.user?.name || "there"}` to just `{greeting}` — session variable no longer exists post-migration. Time-of-day greeting is sufficient.
- **Onboarding tour made unconditional:**
  - Before: `useEffect(() => { if (session) { fetch(...) } }, [session])`
  - After: `useEffect(() => { fetch(...) }, [])` — auth is guaranteed by `(app)/layout.tsx`, no need for session guard
- **Admin role enforcement via server layout:** New `app/(app)/admin/layout.tsx` calls `requireAdmin()` which first checks auth then admin role — replaces the old per-page client-side `useEffect` that did `authClient.getSession()` + `router.push("/dashboard")` for non-admins
- **Wizard layout deleted:** The old passthrough layout with `min-h-screen` wrapper was not recreated under `(app)/wizard/`. No metadata to preserve — eliminated entirely.
- **Wizard keeps requireAuth():** The server component's `await requireAuth()` is redundant with `(app)/layout.tsx` but kept per research finding A2 (harmless, ~5ms overhead per request, changing it offers no security benefit)
- **Admin error/loading boundaries cleaned:** These files (carried over from old admin directory) still emulated the pre-migration full-page layout with Header. Stripped to content-only since they render inside AppLayoutClient.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Admin error.tsx and loading.tsx had remaining min-h-screen and nested `<main>` from old pattern**
- **Found during:** Plan-level verification (success criterion #3)
- **Issue:** `app/(app)/admin/error.tsx` and `app/(app)/admin/loading.tsx` still had `min-h-screen` wrappers and nested `<main>` tags from the old pre-migration pattern. These files were moved as-is from `app/admin/` but need updating since they render inside AppLayoutClient's `<main>`.
- **Fix:** error.tsx: removed `min-h-screen flex-col` wrapper (content-only div). loading.tsx: replaced full-page emulation (Header skeleton + `<main>`) with content-only skeleton matching the new `page.tsx` pattern.
- **Files modified:** `app/(app)/admin/error.tsx`, `app/(app)/admin/loading.tsx`
- **Verification:** `grep -r "min-h-screen" app/(app)/admin/` returns zero matches
- **Committed in:** `4ad8abe` (fix commit, after Task 3)

---

**Total deviations:** 1 auto-fixed (1 bug — admin boundaries needed cleanup)
**Impact on plan:** Minor — boundaries rendered inside AppLayoutClient but had conflicting layout wrappers. Fixed inline during verification.

## Issues Encountered

- None — all tasks executed cleanly with no blockers.

## Known Stubs

None identified.

## Threat Flags

None — T-07-03 (admin role elevation) mitigated by NEW `app/(app)/admin/layout.tsx` with `requireAdmin()`. T-07-04 (spoofing via old routes) mitigated by deleting all 3 old directories. T-07-05 (redundant requireAuth in wizard) accepted per plan. T-07-SC (packages) not applicable.

## Next Phase Readiness

All 8 existing app pages now migrated to `app/(app)/` route group:
- Plan 01: Analytics, Calendar, Achievements, History, Settings (5 client pages)
- Plan 02: Dashboard, Admin, Wizard (3 special-case pages)

Ready for Phase 8 cleanup — delete `components/header.tsx`, remove old imports, remove `@base-ui/react`, clean up auth pages in flat `app/auth/`.

## Self-Check: PASSED

- ✅ SUMMARY.md exists at `.planning/phases/07-page-migration/07-02-SUMMARY.md`
- ✅ All 5 key files created/migrated (`dashboard/page.tsx`, `admin/page.tsx`, `admin/layout.tsx`, `wizard/page.tsx`, `wizard/wizard-edit.tsx`)
- ✅ All 4 old/deleted files/directories confirmed GONE (`app/dashboard/`, `app/admin/`, `app/wizard/`, `app/(app)/wizard/layout.tsx`)
- ✅ All 6 commits verified in git history (`fbf88be`, `ed07f19`, `ad9dfe3`, `4ad8abe`, `cbbb2f8`, `269b060`)
- ✅ Zero Header imports, zero authClient.getSession, zero min-h-screen across all 3 migrated directories
- ✅ TypeScript compilation passes with zero errors

---

*Phase: 07-page-migration*
*Completed: 2026-07-14*
