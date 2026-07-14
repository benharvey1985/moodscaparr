# Domain Pitfalls

**Domain:** Next.js 16 layout restructure — sidebar + mobile bottom tabs + glassmorphism
**Researched:** 2026-07-13

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: SidebarProvider in Wrong Layout

**What goes wrong:** If `SidebarProvider` is placed in `(app)/layout.tsx` instead of root `app/layout.tsx`, sidebar collapse state resets whenever the user navigates to an auth page or any route outside the `(app)` group. More critically, if any nested layout needs to read sidebar state, it can't access the context.

**Why it happens:** It seems logical to put the provider next to the sidebar consumer. Route groups make it feel self-contained.

**Consequences:** Collapse state resets mid-session. Context unavailable to admin layout sub-pages. Need to refactor to move provider up.

**Prevention:** Always place `SidebarProvider` in `app/layout.tsx` (root). It wraps the entire app. The sidebar itself only renders in `(app)/layout.tsx` but its context lives at the root.

**Detection:** If sidebar state resets when navigating from `/admin/users` to `/dashboard`, the provider is too low.

### Pitfall 2: Route Group URL Breakage

**What goes wrong:** Moving existing pages into route groups accidentally changes URLs. `app/dashboard/page.tsx` → `app/(app)/dashboard/page.tsx` should NOT change the URL, but if the route group name includes a segment that becomes part of the path, URLs break. Bookmarks and direct links 404.

**Why it happens:** Route groups are `(name)` — the parens prevent them from becoming URL segments. But if someone forgets the parens (`app/app/dashboard` instead of `app/(app)/dashboard`), the URL becomes `/app/dashboard`.

**Consequences:** All existing bookmarks, shared links, and the root redirect break.

**Prevention:** 
- Double-check folder naming: `(app)` not `app`, `(auth)` not `auth`
- After migration, manually visit `/dashboard`, `/history`, `/calendar` etc. to confirm they resolve
- Test that `app/page.tsx` still correctly redirects
- The old `app/auth/` folder can coexist with `app/(auth)/` — the route group doesn't conflict with existing routes

**Detection:** 404 errors on existing URLs after migration. Root redirect sends user to 404.

### Pitfall 3: Glassmorphism Performance Disaster

**What goes wrong:** Applying `backdrop-filter: blur(20px)` to large areas (sidebar, top bar, every card) causes severe frame drops. `backdrop-filter` requires the browser to rasterize the entire background behind the element on every repaint. On low-end devices or with complex backgrounds, this drops to 10-15fps.

**Why it happens:** Glassmorphism looks great in Figma demos. Developers apply it everywhere without considering the rendering cost.

**Consequences:** Scroll jank, stuttering animations, 60% battery drain on mobile. Users uninstall.

**Prevention:**
- Limit glass elements to 2-3 per page (sidebar + top bar = 2, plus maybe one hero card)
- Use smaller blur radii on large elements (8px not 20px for sidebars)
- Never animate `backdrop-filter` — animate `opacity` or `background-color` instead
- Add `will-change: backdrop-filter` only on elements that need it, and remove after mount
- Test on low-end device (or Chrome DevTools CPU throttling 4x slowdown)

**Detection:** Open DevTools Performance tab, record a scroll, check Frames section for long frames (>16ms).

### Pitfall 4: Bottom Tabs Overlapping Content

**What goes wrong:** Fixed bottom tab bar covers the last 64px of page content. Users can't see the bottom of long lists, settings forms, or admin tables. The last "Save" button is hidden behind tabs.

**Why it happens:** Fixed positioning removes the element from document flow. Pages don't account for the bottom nav height.

**Consequences:** Unclickable buttons, frustration, users thinking features are broken.

**Prevention:**
- Add `pb-[calc(64px+env(safe-area-inset-bottom))]` to `<main>` in `(app)/layout.tsx`
- Or apply padding to the main content wrapper
- Test each page variant: dashboard (scroll), settings (form at bottom), history (infinite list), admin (tables)

**Detection:** Scroll to bottom of any page. Can you see and click the last interactive element?

### Pitfall 5: Mobile Sheet + Bottom Tab Confusion

**What goes wrong:** On mobile, the shadcn sidebar auto-converts to a Sheet that slides in from the left. But there's ALSO a bottom tab bar. Users see both and get confused — they tap a bottom tab and a Sheet also opens. They don't know which navigation to use.

**Why it happens:** The sidebar trigger button is still visible on mobile (hamburger icon in top bar). Users tap it, a Sheet opens with the same items as the bottom tabs.

**Consequences:**
- Confusing dual-navigation pattern
- Sheet's close requirement (tap overlay or close button) adds friction compared to bottom tabs' instant navigation

**Prevention:**
- Hide `SidebarTrigger` on mobile (`className="hidden md:inline-flex"`)
- The sidebar still auto-converts to Sheet internally, but without the trigger button visible, users won't accidentally open it
- If users need settings/admin on mobile: add a gear icon in the top bar or as a 6th bottom tab (if it fits)
- Or override shadcn's mobile behavior: the sidebar can be prevented from becoming a Sheet by not having a mobile trigger

## Moderate Pitfalls

### Pitfall: Nav Item Config Duplication

**What goes wrong:** Nav items defined in `app-sidebar.tsx` and again in `mobile-bottom-nav.tsx`. Adding a "Journal" feature means editing two files. One gets missed → inconsistent nav.

**Prevention:** Single `lib/navigation.ts` config. Both components import from it. Use TypeScript types so the config structure is enforced.

### Pitfall: Client-Side Session Flash

**What goes wrong:** If pages keep doing `useEffect(() => { authClient.getSession().then(...) })`, every navigation shows a flash of empty/loading state while the session re-fetches.

**Prevention:** Use `requireAuth()` in the server component layout. Pass user data via `SessionProvider` context. Pages consume the context instead of triggering their own fetch.

### Pitfall: Breaking the FAB Button

**What goes wrong:** The existing FABButton (fixed bottom-right feedback button) conflicts with the new mobile bottom tab bar. Both are `fixed` at the bottom. They overlap or the FAB is hidden.

**Prevention:** Move FAB to top bar as an icon button (in the actions area next to ThemeToggle). Or relocate it to a settings page. Or remove it (feedback can be an email link in footer). Decision needed before mobile bottom tab implementation.

### Pitfall: `@base-ui/react/drawer` Leftover

**What goes wrong:** After deleting `header.tsx`, the `@base-ui/react/drawer` import is dead code. But it's still in `package.json` and `node_modules`. Increases bundle size unnecessarily (~8KB gzipped).

**Prevention:** After verifying no other components use `@base-ui/react`, remove it from `package.json` and run `npm uninstall @base-ui/react`.

### Pitfall: Sidebar Import in Every Page

**What goes wrong:** Instead of using the route group layout, someone imports `<AppSidebar>` directly into a page component to "fix" it temporarily. Now the sidebar renders twice.

**Prevention:** Code review gate — if any page outside `(app)/layout.tsx` imports a sidebar component, flag it. This shouldn't survive code review.

## Minor Pitfalls

### Pitfall: Bottom Tab Icons Without Labels

Screen reader users get no context. Icon-only nav fails accessibility. Always include `<span>` labels that are `sr-only` on desktop but visible on mobile.

### Pitfall: Forgetting `sidebar` CSS Classes

shadcn's sidebar uses `group-data-[collapsible=icon]` selectors. If custom elements inside the sidebar don't use these, they won't hide/show correctly when collapsed.

### Pitfall: Hardcoding Sidebar Width

shadcn defaults to `16rem`. If glass styling or content needs more space, use the `--sidebar-width` CSS variable or update `SIDEBAR_WIDTH` constant. Don't hardcode Tailwind widths.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Route group creation | URL breakage (#2) | Test every URL after migration |
| shadcn sidebar install | CSS variable conflicts with existing sidebar tokens | Verify global.css sidebar vars align with v4 shadcn sidebar component |
| Page migration | Missed Header import in one page | Grep for `import.*Header from` after migration; should be 0 results |
| Glass CSS tokens | Performance disaster (#3) | Limit glass elements; test on CPU-throttled browser |
| Mobile bottom nav | Content overlap (#4) | Add pb-16 + safe-area to main content wrapper |
| Session context | Circular dependency or hydration mismatch | Keep it simple — stringify user data server-side, pass as prop to context provider |

## Sources

- [shadcn Sidebar documentation](https://ui.shadcn.com/docs/components/base/sidebar) — Component behavior reference
- [CSS Glassmorphism performance guide](https://nineproo.com/blog/css-glassmorphism-guide) — backdrop-filter performance analysis, fallback patterns
- [Glassmorphism v2: Physics of Refraction](https://lucky.graphics/learn/glassmorphism-v2-physics/) — Performance optimization for backdrop-filter
- [9 Best Next.js 16 Admin Dashboards](https://adminlte.io/blog/build-admin-dashboard-shadcn-nextjs/) — Route group + sidebar layout patterns
- [Production Next.js route groups pitfalls](https://nextjs.org/docs/app/getting-started/layouts-and-pages) — Official docs on route group behavior
- Existing codebase analysis: 7 pages with duplicate `<Header>` + session fetch pattern
