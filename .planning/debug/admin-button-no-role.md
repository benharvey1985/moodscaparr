---
status: resolved
trigger: Bug #10: Admin Button — no way to access admin panel
created: 2026-07-07
updated: 2026-07-07
---

## Current Focus

**Hypothesis:** All authenticated pages (Dashboard, History, Achievements, Calendar, Settings) omit `role` from the user object passed to `<Header>`. The admin link check `user?.role === "admin"` at `components/header.tsx:155` never matches, so admin users never see the nav entry to `/admin`.

**Test:** Scan every page that renders `<Header>` and check if `role` is passed.

**Expecting:** All pages pass `role: session.user.role` to Header, matching the Admin page pattern.

## Evidence

- `app/admin/page.tsx:66` — ✅ Has `role: session.user.role`
- `app/dashboard/page.tsx:90` — ❌ Missing `role`
- `app/history/page.tsx:70` — ❌ Missing `role`
- `app/achievements/page.tsx:47` — ❌ Missing `role`
- `app/calendar/page.tsx:115,150` — ❌ Missing `role` (both render paths)
- `app/settings/page.tsx:53` — ❌ Missing `role`

## Resolution

**Root cause:** 6 user objects across 5 files omitted the `role` field when constructing the prop for `<Header>`.

**Fix:** Added `role: session.user.role` to the user object in all 5 files (6 locations):
- `app/dashboard/page.tsx`
- `app/history/page.tsx`
- `app/achievements/page.tsx`
- `app/calendar/page.tsx` (2 render paths)
- `app/settings/page.tsx`

**Verification:** Admin users now see the "Admin" entry in the nav dropdown on every page.
