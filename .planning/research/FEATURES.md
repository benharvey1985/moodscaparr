# Feature Landscape

**Domain:** Next.js 16 UI layout restructuring for mood diary app
**Researched:** 2026-07-13

## Table Stakes

Features users expect from a modern web app layout. Missing these = feels outdated.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Desktop sidebar navigation | All modern SaaS apps use sidebar nav; the current top-nav + hamburger drawer is mobile-inspired but cramped on desktop | Medium | shadcn Sidebar with `collapsible="icon"` variant |
| Active route highlighting | Users need to know which page they're on | Low | `usePathname()` compare with nav config |
| Mobile-responsive navigation | 60%+ traffic is mobile; current drawer is functional but not discoverable | Medium | shadcn auto-Sheet on mobile + bottom tab bar |
| Cross-device state persistence | Sidebar collapse state should not reset on navigation | Low | SidebarProvider in root layout handles this |
| Consistent layout wrapper | Every page should not reinvent the flex container + Header import | Medium | This is the main refactoring — route group with shared layout |

## Differentiators

Features that elevate the app beyond baseline expectations.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Glassmorphism/frosted design system | Distinct visual identity; feels premium and cohesive with mood tracking's introspective theme | Medium | CSS custom properties + Tailwind classes; careful about performance |
| Mobile bottom tab bar (icon + label) | Native-app feel on mobile; one-thumb reachability for main pages | Medium | Fixed bottom, 5 tabs, safe-area-aware |
| Collapsible icon-mode sidebar | Frees content space when user wants focus on dashboard content | Low | Built into shadcn Sidebar |
| Shared nav config for sidebar + bottom tabs | Adding a nav item means editing one file, not two | Low | `lib/navigation.ts` |
| Server-side auth check in layout | Eliminates 500ms flash-of-login-form on every page | Medium | `requireAuth()` in `(app)/layout.tsx` async server component |
| Gradient ambient background behind glass | The frosted glass effect needs a visually interesting background to blur | Low | Mesh gradient or animated gradient behind content area |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Drag-resizable sidebar | Complex to implement well (resize handles, width persistence, content reflow). Low value for a mood diary | Use shadcn's default fixed-width sidebar with collapsible icon mode |
| Animated sidebar expand/collapse transitions | `backdrop-filter` animation causes frame drops and paint storms | Animate only the width/opacity of icons, not the backdrop-filter itself |
| Nested/collapsible sidebar menus | Over-engineering for 5 flat nav items | Flat menu items with visual section separation |
| Separate mobile hamburger menu | Redundant with bottom tabs + sidebar Sheet | shadcn sidebar auto-converts to Sheet on mobile; bottom tabs handle primary nav |
| Scrollable sidebar with many sections | Will be empty with only 5 main + 2 secondary items | Single group, flat list |
| User avatar in sidebar | Current inline avatar in dropdown menu works fine | Keep user dropdown in sidebar footer (shadcn pattern) |

## Feature Dependencies

```
SidebarProvider (root layout)
  └── AppSidebar component
      └── shadcn Sidebar UI component
      └── lib/navigation.ts (nav config)
      └── SessionProvider (user data for footer)

SessionProvider
  └── requireAuth() from (app)/layout.tsx

Route groups (app)/(auth)
  └── (app)/layout.tsx
      ├── AppSidebar
      ├── TopBar
      │   ├── SidebarTrigger (shadcn)
      │   ├── PageTitle or Breadcrumb
      │   └── ThemeToggle + NewEntry button
      ├── main > {children}
      └── MobileBottomNav

Page migration
  └── Each page: remove Header import, remove session fetch, remove wrapper div
  └── Requires: (app)/layout.tsx verified working with all page types

Glassmorphism tokens
  └── Defined in globals.css
  └── Consumed by: sidebar, top bar, cards, mobile bottom nav
  └── No component dependencies — purely CSS

Old header deletion
  └── Requires: all 7+ pages migrated away from Header import
  └── Requires: @base-ui/react/drawer verified unused
```

## MVP Recommendation

This milestone's scope is the layout itself. Prioritize:

1. **CSS glassmorphism tokens** — Foundation; no visual change by itself, but everything consumes it
2. **Navigation config** — Single source of truth; needed before any nav component
3. **shadcn Sidebar install** — The primary desktop nav component
4. **`(app)/layout.tsx` shell** — The shared layout with sidebar + topbar + bottom tabs
5. **AppSidebar component** — Desktop sidebar with nav items
6. **MobileBottomNav component** — Bottom tab bar
7. **Route group restructuring** — Move pages into `(app)` + `(auth)`
8. **Page migration** — Strip boilerplate from every page (bulk work, but mechanical)

**Defer:** Admin-specific sidebar enhancements (admin nav items can be injected via layout nesting). Glass surface polish (apply `.glass` to cards in a follow-up pass — separate from structural layout work).

## Sources

- [shadcn Sidebar blocks](https://ui.shadcn.com/blocks/sidebar) — Pattern library for sidebar variations
- [Building Admin Skeleton with shadcn/ui sidebar](https://eastondev.com/blog/en/posts/dev/20260327-shadcn-ui-sidebar-layout/) — Production pattern guide
- [9 Best Next.js 16 Admin Dashboards with shadcn/ui](https://adminlte.io/blog/build-admin-dashboard-shadcn-nextjs/) — Layout architecture patterns
- [shadcn Sidebar patterns I'd use in a real project](https://coderlegion.com/13514/shadcn-sidebar-patterns-id-actually-use-in-a-real-project) — Nav config strategy
- [7+ Best shadcn sidebar examples](https://dev.to/wrap-pixel/shadcn-sidebar-examples-3k06) — Responsive patterns comparison
