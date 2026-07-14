# Project Research Summary

**Project:** Moodscaparr v1.2 UI Redesign
**Domain:** Next.js 16 App Router layout restructure — sidebar navigation, mobile bottom tabs, glassmorphism design system
**Researched:** 2026-07-13
**Confidence:** HIGH

## Executive Summary

Moodscaparr v1.2 is a layout infrastructure overhaul that replaces the current top-nav + hamburger drawer pattern with a modern sidebar + bottom-tab navigation architecture, dressed in a frosted-glass (glassmorphism) design system. Every authenticated page currently duplicates ~40 lines of boilerplate (Header import, client-side session fetch, wrapper div) across 7 pages. The research recommends a route-group-based restructuring: `(app)/layout.tsx` becomes a shared authenticated shell with AppSidebar, TopBar, and MobileBottomNav, while `(auth)/layout.tsx` stays as a centered card for login/register. This eliminates 280+ lines of duplicated code and the 500ms-1s "flash of login form" on every navigation.

The recommended stack additions are minimal and surgical: **shadcn Sidebar** (already configured shadcn ecosystem) for the desktop sidebar, a **custom MobileBottomNav** component (no library needed for 5 flat tabs), and **CSS custom properties + Tailwind utilities** for glassmorphism (no CSS-in-JS library). The existing stack — Next.js 16, Tailwind v4, lucide-react, recharts, TanStack Query, and the OKLCH-based design token system — remains unchanged. The architecture is grounded in official Next.js route group patterns, shadcn's built-in responsive sidebar behavior (auto-converts to Sheet on mobile), and production-tested layout patterns from multiple shadcn sidebar deployments.

**The top 3 risks are:** (1) placing `SidebarProvider` in the wrong layout (must go in root `app/layout.tsx`, not `(app)/layout.tsx`) which would reset collapse state on navigation; (2) glassmorphism performance disaster if `backdrop-filter` is applied to more than 2-3 elements per page — this is GPU-intensive and drops to 10-15fps on low-end devices; (3) mobile bottom tabs overlapping page content if `pb-[calc(64px+env(safe-area-inset-bottom))]` is not applied to the main content wrapper. All three have clear, documented mitigations.

## Key Findings

### Recommended Stack

The existing Next.js 16 + Tailwind v4 + shadcn ecosystem is well-suited for this redesign. Only surgical additions are needed — no new major frameworks or runtimes.

**Core additions:**

| Technology | Purpose | Why |
|------------|---------|-----|
| shadcn Sidebar (via CLI) | Desktop sidebar component | Built-in responsive Sheet behavior, collapsible states, keyboard nav, RTL support, active route highlighting — already in project's shadcn ecosystem |
| CSS Custom Properties | Glassmorphism design tokens | Integrates with existing OKLCH token system; no runtime overhead |
| Tailwind backdrop-blur utilities | Glass blur effects | Already in project; `backdrop-blur-lg`, `backdrop-blur-xl` available |
| `@supports` queries | Glassmorphism fallback | 96% browser support; graceful degradation to solid colors |
| shadcn Breadcrumb (optional) | Page hierarchy in top bar | Pairs with sidebar for breadcrumb context |

**Alternatives rejected:**
- Building sidebar from scratch (3+ days for accessible, responsive version — shadcn does it in one CLI command)
- Zustand for sidebar state (shadcn's SidebarProvider context is sufficient for a single boolean collapse state)
- CSS-in-JS for glassmorphism (plain CSS custom properties integrate cleanly with Tailwind v4's `@theme` system)
- shadcn Resizable (drag-to-resize is explicitly out of scope — adds complexity with low value for a mood diary)

**Dependency to remove:** `@base-ui/react` — only used by the old mobile drawer in `header.tsx`, which will be deleted.

See `.planning/research/STACK.md` for full details.

### Expected Features

**Must have (table stakes) — users expect these for a modern web app:**
- **Desktop sidebar navigation** — shadcn Sidebar with `collapsible="icon"` variant; replaces cramped top-nav
- **Active route highlighting** — `usePathname()` comparison with shared nav config
- **Mobile-responsive navigation** — shadcn auto-Sheet on mobile + bottom tab bar for one-thumb reachability
- **Cross-device state persistence** — sidebar collapse state persists via SidebarProvider in root layout
- **Consistent layout wrapper** — route group shared layout eliminates 7x duplicated Header + container patterns

**Should have (differentiators) — elevate the app's feel:**
- **Glassmorphism/frosted design system** — cohesive with mood tracking's introspective theme; CSS tokens + Tailwind utilities
- **Mobile bottom tab bar (icon + label)** — native-app feel, one-thumb reachability, 5 main tabs
- **Collapsible icon-mode sidebar** — frees content space for focus on dashboard content
- **Shared nav config (`lib/navigation.ts`)** — adding a nav item means editing one file, not two
- **Server-side auth check in layout** — eliminates 500ms flash-of-login-form on every page via `requireAuth()` in `(app)/layout.tsx`
- **Gradient ambient background** — visually interesting background behind glass elements

**Anti-features (explicitly NOT building):**
- Drag-resizable sidebar (complex, low value for mood diary)
- Animated backdrop-filter (causes frame drops and paint storms)
- Nested/collapsible sidebar menus (over-engineering for 5 flat nav items)
- Separate mobile hamburger menu (redundant with bottom tabs + sidebar Sheet)
- User avatar in sidebar (current inline dropdown works fine)

**Defer to v2+:** Admin-specific sidebar enhancements, glass surface polish on cards (apply `.glass` to cards in a separate pass).

See `.planning/research/FEATURES.md` for full feature dependency graph.

### Architecture Approach

The core architectural change is restructuring from a flat page tree (each page independently mounting `<Header>`) to a route-group-based hierarchy where `(app)/layout.tsx` provides a shared authenticated shell. This uses Next.js App Router route groups `(app)` and `(auth)` to keep existing URLs unchanged while enabling a single layout wrapper for all authenticated pages.

**Major components:**

1. **`lib/navigation.ts`** — Single TypeScript source of truth for all nav items (title, URL, icon, adminOnly flag). Consumed by both AppSidebar and MobileBottomNav. Prevents the duplication anti-pattern where adding a nav item requires touching two components.

2. **`(app)/layout.tsx`** (new) — Server component that calls `requireAuth()` server-side, passes serialized user data via `SessionProvider` context, and renders the shared shell: `<AppSidebar>` + `<TopBar>` + `<main>{children}</main>` + `<MobileBottomNav>`. Eliminates 7x duplicated session fetching and wrapper patterns.

3. **`AppSidebar`** — Desktop sidebar using shadcn Sidebar with `collapsible="icon"` variant. Contains logo/header, nav items from config with active highlighting, user footer with dropdown (settings, admin, logout). Auto-converts to Sheet on mobile < 768px.

4. **`MobileBottomNav`** — Fixed bottom tab bar (64px height, safe-area-aware), hidden on desktop via `md:hidden`. 5 tabs for main navigation, uses same `lib/navigation.ts` config. Icon + label layout with active state highlighting.

5. **`TopBar`** — Slim header bar: SidebarTrigger (hamburger, hidden on mobile), page title or breadcrumb, spacer, NewEntry button, ThemeToggle.

6. **Glassmorphism CSS** — Design tokens in `globals.css` as CSS custom properties (`--glass-bg`, `--glass-blur`, `--glass-border`, etc.) with light/dark variants. Reusable `.glass`, `.glass-sm`, `.glass-card` utility classes. Progressive enhancement via `@supports (backdrop-filter: blur(1px))` — solid color fallback for old browsers.

**Data flow:**
- Sidebar collapse state: `SidebarProvider` in root layout → context consumed by AppSidebar and SidebarTrigger
- Active page: Each nav component independently derives from `usePathname()` — no prop drilling
- Session: `(app)/layout.tsx` (server) → `requireAuth()` → serialized user props → `SessionProvider` (client context) → AppSidebar and TopBar via `useSession()`

**Responsive breakpoint: `md` (768px)**
- `< 768px`: Sidebar → hidden Sheet (slides in), bottom tabs visible, TopBar shows hamburger
- `>= 768px`: Sidebar → fixed (collapsible to icons), bottom tabs hidden

See `.planning/research/ARCHITECTURE.md` for complete component tree, build order, and dependency chain.

### Critical Pitfalls

1. **SidebarProvider in wrong layout** — If placed in `(app)/layout.tsx` instead of root `app/layout.tsx`, collapse state resets on navigation and nested layouts can't access context. **Prevention:** Always place `SidebarProvider` in root layout. Context lives at root; sidebar only renders in `(app)/layout.tsx`.

2. **Route group URL breakage** — Forgetting parentheses in folder names (`app` vs `(app)`) changes URLs from `/dashboard` to `/app/dashboard`, breaking all bookmarks. **Prevention:** Double-check folder naming. Test every existing URL after migration. The old `app/auth/` folder can coexist with `app/(auth)/` route group.

3. **Glassmorphism performance disaster** — `backdrop-filter: blur(20px)` on large areas or multiple elements causes 10-15fps on low-end devices. **Prevention:** Limit glass to 2-3 elements per page (sidebar + top bar = 2, plus maybe one card). Use smaller blur radii (8px) for large surfaces. Never animate `backdrop-filter`. Test on CPU-throttled browser (4x slowdown).

4. **Bottom tabs overlapping content** — Fixed 64px bottom nav covers page content, hiding "Save" buttons and last items on lists. **Prevention:** Add `pb-[calc(64px+env(safe-area-inset-bottom))]` to `<main>` in `(app)/layout.tsx`. Test every page variant (scrollable lists, forms at bottom, admin tables).

5. **Mobile Sheet + bottom tab confusion** — On mobile, sidebar auto-converts to Sheet but bottom tabs already provide navigation. Sidebar trigger (hamburger) is redundant and confusing. **Prevention:** Hide `SidebarTrigger` on mobile (`className="hidden md:inline-flex"`). Bottom tabs become the primary mobile nav. The sidebar Sheet remains accessible only via the collapse rail on desktop.

**Moderate pitfalls:** Nav config duplication (solved by single `lib/navigation.ts`), client-side session flash (solved by server-side `requireAuth()` in layout), breaking the FAB button (needs relocation decision), `@base-ui/react` leftover (uninstall after header deletion).

See `.planning/research/PITFALLS.md` for all 16 pitfalls with detailed mitigations.

## Implications for Roadmap

Based on dependency analysis across all four research documents, here is the recommended phase structure:

### Phase 1: Foundation
**Rationale:** No visual change, but everything downstream depends on these three artifacts. Navigation config is consumed by both sidebar and bottom tabs. Glassmorphism tokens are consumed by all glass surfaces. shadcn CLI installation provides the component that Phase 2 assembles.
**Delivers:**
- `lib/navigation.ts` — typed nav config, NavItem interface, route highlighting helpers
- Glassmorphism CSS tokens + `@theme` integration + `.glass`/`.glass-sm`/`.glass-card` utility classes in `globals.css`
- `@supports` fallback blocks for browsers without `backdrop-filter`
- shadcn Sidebar + Breadcrumb installed via CLI
**Avoids:** Pitfall 3 (glassmorphism performance) — tokens are defined but not yet applied to elements, so no rendering risk. Pitfall 1 (SidebarProvider location) — provider will be placed in root layout during Phase 2.
**Research flag:** Standard patterns. shadcn sidebar installation is well-documented. Glassmorphism CSS tokens follow established OKLCH patterns already in project. **Skip `research-phase`.**

### Phase 2: Session Infrastructure
**Rationale:** Server-side auth in the layout is the "enabling feature" that lets all pages delete their client-side session fetch boilerplate. Must come before page migration.
**Delivers:**
- `SessionProvider` component — client context wrapping serialized user data
- `requireAuth()` call in the yet-to-be-created `(app)/layout.tsx`
**Avoids:** Pitfall: client-side session flash — pages will not need their own `useEffect(() => authClient.getSession().then(...))` pattern.
**Research flag:** Standard patterns. React context + server-to-client data passing is well-established in Next.js. **Skip `research-phase`.**

### Phase 3: Layout Shell
**Rationale:** This is the core architectural change — creating the shared authenticated layout that all pages will use. Must come after foundation (nav config, sidebar component) and session infrastructure.
**Delivers:**
- `(auth)/layout.tsx` moved to new route group (no behavioral change)
- `(app)/layout.tsx` — shared shell with `SidebarInset` + AppSidebar + TopBar + main content + MobileBottomNav
- `AppSidebar` component — logo, nav items from config, user footer
- `TopBar` component — SidebarTrigger (hidden on mobile), page title, actions
- `MobileBottomNav` component — fixed bottom, 5 tabs, safe-area-aware
- `SidebarProvider` added to root `app/layout.tsx`
**Addresses features from FEATURES.md:** Desktop sidebar nav, active route highlighting, mobile-responsive navigation, collapsible icon-mode sidebar, shared nav config, mobile bottom tab bar, consistent layout wrapper.
**Avoids:** Pitfall 1 (SidebarProvider in wrong layout), Pitfall 4 (bottom tabs overlapping content — pb-safe applied), Pitfall 5 (mobile Sheet confusion — sidebar trigger hidden on mobile).
**Research flag:** MEDIUM confidence area. While shadcn sidebar and Next.js route groups are well-documented, the exact interplay between SidebarProvider at root, sidebar rendering in `(app)/layout`, and session context wrapping needs careful implementation. **Flag for `gsd-plan-phase` to verify component boundaries.**

### Phase 4: Page Migration
**Rationale:** All 7+ pages need the same mechanical transformation: remove `<Header>` import, remove client-side session fetch, remove wrapper div. This is bulk work but individually simple. Must come after Phase 3 is verified working.
**Delivers:**
- Each page: `/dashboard`, `/history`, `/calendar`, `/analytics`, `/achievements`, `/wizard`, `/settings`, `/admin` — stripped of layout boilerplate
- Pages become pure content components — no `min-h-screen`, no `Header` import, no session handling
- `/admin/layout.tsx` — extends sidebar with admin-specific nav items if needed
**Key constraint:** Verify each page renders correctly before moving to the next. The `(app)/layout.tsx` must be verified working across all page types (dashboard grid, history list, calendar grid, analytics charts, etc.).
**Avoids:** Pitfall: sidebar import in every page — code review gate prevents importing AppSidebar directly in pages.
**Research flag:** Standard patterns. Page migration is mechanical and well-defined. **Skip `research-phase`.** However, each page should be verified individually during execution.

### Phase 5: Cleanup
**Rationale:** Cannot delete old code until all pages are verified migrated. The `@base-ui/react` package must be confirmed unused before removal.
**Delivers:**
- `components/header.tsx` deleted
- `@base-ui/react` removed from `package.json` and `node_modules`
- Grep verification: zero results for `import.*Header from` across codebase
**Avoids:** Pitfall: `@base-ui/react/drawer` leftover — verified dead code removal frees ~8KB gzipped from bundle.
**Research flag:** Trivial cleanup. **Skip `research-phase`.**

### Phase 6: Glass Surface Polish
**Rationale:** Glassmorphism is visual polish, not structural. Applying `.glass` classes to cards, sidebar, and top bar can be done after the layout is verified working. This is intentionally last because it's purely cosmetic and carries performance risk.
**Delivers:**
- `.glass` applied to sidebar, top bar, and selected cards
- Gradient ambient background behind content area
- FAB button: relocated to top bar (as icon button) or removed
**Avoids:** Pitfall 3 (glassmorphism performance) — limit to 2-3 glass elements per page, use `--glass-blur-sm` (8px) for large surfaces, test on CPU-throttled browser.
**Research flag:** LOW risk — CSS only, well-defined pattern. The FAB relocation decision needs user input during planning. **Skip `research-phase` but flag FAB decision for discuss-phase.**

### Phase Ordering Rationale

- **Foundation First:** Glassmorphism tokens, nav config, and shadcn installation have zero dependencies and everything else depends on them. This phase produces no visual change, which makes it safe to merge early.
- **Session Before Layout:** The `SessionProvider` pattern must be in place before the layout shell is built, because `(app)/layout.tsx` needs to pass session data to its children.
- **Layout Shell Before Page Migration:** Pages can only be simplified after the shared layout exists and is verified working. Attempting page migration first would require keeping both old and new code paths, increasing risk.
- **Cleanup After Migration:** Deleting `header.tsx` and `@base-ui/react` is safe only after all pages are confirmed migrated. A pre-deletion grep for `import.*Header from` catches missed migrations.
- **Polish Last:** Glassmorphism is cosmetic. If performance issues arise, glass surface application can be scaled back without affecting the structural layout changes.

### Research Flags

Phases that may need deeper research during planning:
- **Phase 3 (Layout Shell):** Session provider wrapping + SidebarProvider at root + route group nesting. While individual patterns are documented, the exact composition needs verification during planning. Flag for `gsd-plan-phase` to walk through component boundaries.

Phases with well-documented standard patterns (skip `research-phase`):
- **Phase 1 (Foundation):** shadcn CLI installation and CSS custom properties are thoroughly documented.
- **Phase 2 (Session Infrastructure):** React context + `requireAuth()` is a standard Next.js pattern.
- **Phase 4 (Page Migration):** Mechanical work, well-defined transformation.
- **Phase 5 (Cleanup):** Trivial deletion and verification.
- **Phase 6 (Glass Surface Polish):** CSS-only, well-documented pattern. FAB decision needs user input but not research.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | shadcn Sidebar confirmed compatible with existing `components.json`. Tailwind v4 `@theme` integration verified. No new major dependencies needed. |
| Features | HIGH | Sourced from production shadcn sidebar patterns, official docs, and multiple real-world Next.js admin dashboard deployments. Anti-features grounded in concrete tradeoffs. |
| Architecture | HIGH | Next.js App Router route groups, shadcn sidebar component tree, and glassmorphism CSS architecture all verified against official documentation. Layout tree matches production-tested patterns. |
| Pitfalls | HIGH | Every pitfall has a clear prevention strategy and detection method. Sources include official shadcn docs, Next.js docs, and glassmorphism performance analysis. |

**Overall confidence:** HIGH

### Gaps to Address

- **FAB Button fate** — The existing FABButton (fixed bottom-right feedback) conflicts with the new mobile bottom tab bar. Decision needed: relocate to top bar, settings page, or remove entirely. This affects Phase 6 scope but does not block earlier phases.
- **Admin layout specifics** — Whether admin needs custom sidebar nav items or just a passthrough layout is not fully resolved. The architecture handles both cases, but the exact admin nav items need definition during Phase 3/4.
- **Page-specific content padding** — While `pb-safe` handles bottom nav overlap generally, some pages (settings forms with bottom-aligned buttons, admin tables) may need individual padding adjustments. Flag for Phase 4 verification.
- **Browser performance baseline** — Glassmorphism performance should be tested on a real low-end device or CPU-throttled Chrome DevTools (4x slowdown) before Phase 6 is considered complete. The project currently has <100 users so the performance envelope is limited, but the pattern should be established.

## Sources

### Primary (HIGH confidence)
- [shadcn Sidebar documentation](https://ui.shadcn.com/docs/components/base/sidebar) — Component API, states, responsive behavior, installation
- [Next.js App Router route groups](https://nextjs.org/docs/app/getting-started/layouts-and-pages) — Route group patterns, layout nesting behavior
- [Tailwind CSS backdrop-blur utilities](https://tailwindcss.com/docs/backdrop-filter-blur) — Tailwind v4 backdrop-filter API
- [Can I Use: backdrop-filter](https://caniuse.com/css-backdrop-filter) — 96%+ browser support verification
- Existing codebase analysis (`components.json`, `globals.css`, 7 page files)

### Secondary (MEDIUM confidence)
- [CSS Glassmorphism: The Definitive Developer's Guide 2026](https://nineproo.com/blog/css-glassmorphism-guide) — Performance analysis, fallback patterns, token architecture (cross-referenced with MDN)
- [Building Admin Skeleton with shadcn/ui sidebar](https://eastondev.com/blog/en/posts/dev/20260327-shadcn-ui-sidebar-layout/) — Production pattern for sidebar + route groups (matches official docs)
- [9 Best Next.js 16 Admin Dashboards with shadcn/ui](https://adminlte.io/blog/build-admin-dashboard-shadcn-nextjs/) — Layout architecture patterns, responsive considerations
- [shadcn Sidebar patterns I'd use in a real project](https://coderlegion.com/13514/shadcn-sidebar-patterns-id-actually-use-in-a-real-project) — Nav config strategy, route highlighting approach
- [Glassmorphism v2: Physics of Refraction](https://lucky.graphics/learn/glassmorphism-v2-physics/) — backdrop-filter performance optimization techniques

### Tertiary (LOW confidence)
- No tertiary sources used — all recommendations are supported by at least two independent sources or official documentation.

---

*Research completed: 2026-07-13*
*Ready for roadmap: yes*
