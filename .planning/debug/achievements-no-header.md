---
status: resolved
trigger: Bug #6: Achievements screen - no header bar
created: 2026-07-07
updated: 2026-07-07
---

## Current Focus

**Hypothesis:** The Achievements page (`app/achievements/page.tsx`) is a server component that renders only `<h1>Achievements</h1>` and `<AchievementList />` without including the `<Header>` component. Every other authenticated page renders `<Header>` with user session data.

**Test:** Scan all authenticated page files for Header import/usage:
- Dashboard: ✅ Has `<Header user={...} />`
- History: ✅ Has `<Header user={...} />`
- Analytics: ✅ Has `<Header user={...} />`
- Calendar: ✅ Has `<Header user={...} />`
- Settings: ✅ Has `<Header user={...} />`
- Admin: ✅ Has `<Header user={...} />`
- Wizard: ❌ No Header (same pattern — server component)
- Achievements: ❌ No Header

**Expecting:** Achievements page should render Header at the top of the page, consistent with all other authenticated pages.

## Evidence

- `app/achievements/page.tsx` (server component, 12 lines):
  - Imports: `requireAuth`, `AchievementList`
  - Renders: `<div className="..."><h1>Achievements</h1><AchievementList /></div>`
  - No `<Header>` import or usage

- `app/achievements/layout.tsx` — passthrough layout, no Header there either

- All other authenticated pages (`app/dashboard/page.tsx`, `app/history/page.tsx`, etc.):
  - Client components with `useState` session management
  - Import `Header` and render `<Header user={...} />`
  - Wrapped in `<div className="flex min-h-screen flex-col">`

## Elimination Log

- Hypothesis: "Header is in root layout" — Eliminated. `app/layout.tsx` does not include Header.
- Hypothesis: "Header is in achievements layout" — Eliminated. `app/achievements/layout.tsx` is a passthrough.
- Hypothesis: "AchievementList includes Header" — Eliminated. `components/achievements/achievement-list.tsx` just renders the list.

## Resolution

**Root cause:** `app/achievements/page.tsx` is a server component that does not import or render the `<Header>` component. The user session is obtained server-side via `requireAuth()` but the page never creates a `Header` wrapper with navigation bar, user avatar dropdown, and theme toggle.

**Fix:** Convert `app/achievements/page.tsx` to use a client component pattern consistent with other pages (Dashboard, History, Analytics, Calendar, Settings, Admin). The inner component manages session state via `authClient.getSession()` and renders `<Header>` with user data at the top of a `flex min-h-screen flex-col` wrapper.

**Files changed:**
- `app/achievements/page.tsx` — Rewritten to client component with Header

**Verification:** The page now renders the navigation bar with logo, nav links (Dashboard, New Entry, History, Calendar, Analytics, Achievements), theme toggle, and user avatar dropdown — identical to every other authenticated page.
