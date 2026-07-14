# Architecture Research

**Domain:** Next.js 16 UI layout restructure — sidebar + mobile bottom tabs + glassmorphism
**Researched:** 2026-07-13
**Confidence:** HIGH

## Existing Architecture (Before v1.2)

### Current Pain Points

Every authenticated page individually imports `<Header>` and wraps content in a `min-h-screen flex-col` container. This is duplicated across **7 pages** (dashboard, history, calendar, analytics, achievements, settings, admin). Each page also handles its own client-side session fetch via `authClient.getSession()` — a 500ms-1s flash-of-login-form on every navigation.

The existing `<Header>` component itself contains:
- Top nav bar with inline nav links (hidden on mobile, shown `md:flex`)
- A mobile drawer using `@base-ui/react/drawer` (separate from shadcn ecosystem)
- User dropdown menu
- Theme toggle
- New Entry button

This is the component that gets **replaced entirely** — the top nav becomes a sidebar, the mobile drawer becomes bottom tabs + sidebar Sheet.

### Current Layout Tree

```
/app/layout.tsx (root)
  ├── ThemeProvider
  │   └── Providers (TanStack QueryClientProvider)
  │       └── Toaster
  │           ├── {children} ← each page individually mounts <Header>
  │           └── <FABButton />
  │
  /app/auth/layout.tsx ← centered card, no header
  /app/admin/layout.tsx ← passthrough (just <>{children}</>)
```

### What Stays the Same

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| ThemeProvider location | Root layout | Must wrap everything |
| TanStack Query provider | Root layout | Must wrap everything |
| CSP headers in next.config.ts | Unchanged | Security requirement |
| Auth layout (centered card) | Unchanged | Auth pages don't get sidebar |
| Admin child page content | Unchanged | Only admin layout/nav changes |

---

## Recommended Architecture (v1.2)

### Route Group Restructuring

Use Next.js App Router **route groups** to separate authenticated pages from auth pages without changing URL paths.

```
app/
├── globals.css                    # + glassmorphism CSS tokens
├── layout.tsx                     # ROOT — ThemeProvider, Providers, SidebarProvider, Toaster
├── page.tsx                       # Redirect to /dashboard or /auth/login
│
├── (auth)/                        # ROUTE GROUP — no sidebar
│   ├── layout.tsx                 # Moved from app/auth/layout.tsx (centered card)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── reset-password/page.tsx
│
├── (app)/                         # ROUTE GROUP — sidebar + bottom tabs shell
│   ├── layout.tsx                 # NEW — AppSidebar + MobileBottomNav + top header bar
│   ├── dashboard/page.tsx         # SIMPLIFIED — remove Header import + wrapper
│   ├── history/page.tsx           # SIMPLIFIED
│   ├── calendar/page.tsx          # SIMPLIFIED
│   ├── analytics/page.tsx         # SIMPLIFIED
│   ├── achievements/page.tsx      # SIMPLIFIED
│   ├── wizard/page.tsx            # SIMPLIFIED (currently uses requireAuth server-side)
│   ├── settings/page.tsx          # SIMPLIFIED
│   └── admin/
│       ├── layout.tsx             # EXTENDS — admin-specific sidebar additions
│       └── page.tsx               # SIMPLIFIED
│
├── auth/                          # ← moved INTO (auth) route group via layout nesting
│   (files stay, now under (auth) group)
│
├── api/                           # API routes — unchanged, outside route groups
│
└── (existing routes moved into groups)
```

**Why route groups instead of path restructuring?**
- `/dashboard`, `/history`, `/calendar` URLs **stay the same** — no breaking changes for bookmarks
- The `(app)` group lets us put one shared layout over ALL authenticated pages
- The `(auth)` group keeps auth pages in their own layout without affecting URL
- Admin `/admin` URL stays the same but inherits the app layout naturally

### New Layout Tree

```
app/layout.tsx (ROOT)
  ├── ThemeProvider
  │   └── SidebarProvider          ← NEW: persists collapse state globally
  │       └── Providers (TanStack Query)
  │           └── Toaster
  │               └── {children}
  │
  app/(auth)/layout.tsx            ← centered card (unchanged logic, moved path)
  │
  app/(app)/layout.tsx             ← NEW: shared authenticated shell
    ├── <AppSidebar />             ← desktop sidebar (shadcn Sidebar)
    ├── <TopBar />                 ← slim header: hamburger + page title + theme toggle
    ├── <main>{children}</main>
    └── <MobileBottomNav />        ← fixed bottom tabs, md:hidden
```

### Component Tree Detail

```
(app)/layout.tsx
└── <SidebarInset> {/* wraps main content for inset sidebar variant */}
    ├── <TopBar>
    │   ├── <SidebarTrigger />     ← hamburger button (shadcn)
    │   ├── <Breadcrumb />         ← or page title
    │   ├── <div className="flex-1" /> ← spacer
    │   ├── <NewEntryButton />     ← was in old header
    │   └── <ThemeToggle />        ← was in old header
    ├── <main>{children}</main>    ← page content
    └── <MobileBottomNav />        ← fixed bottom, md:hidden

Sidebar (desktop)
<Sidebar collapsible="icon">
  <SidebarHeader>
    <Logo />                       ← "Moodscaparr" brand
  </SidebarHeader>
  <SidebarContent>
    <NavMain items={navItems} />   ← config-driven, usePathname() highlighting
  </SidebarContent>
  <SidebarFooter>
    <NavUser user={...} />         ← avatar, name, dropdown (settings, admin, logout)
  </SidebarFooter>
  <SidebarRail />                  ← collapse handle
</Sidebar>

MobileBottomNav (mobile only, md:hidden)
<nav className="fixed bottom-0 inset-x-0 md:hidden ...">
  {navItems.map(item =>
    <Link href={item.href} className={cn(isActive && "text-primary")}>
      <item.icon />
      <span>{item.label}</span>
    </Link>
  )}
</nav>
```

---

## Navigation Configuration

### Single Source of Truth

A shared navigation config prevents duplication between sidebar and bottom tabs:

```typescript
// lib/navigation.ts
import {
  LayoutDashboard,
  History,
  Calendar,
  BarChart3,
  Award,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  /** Show for admin users only */
  adminOnly?: boolean
}

export const mainNavItems: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "History", url: "/history", icon: History },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Achievements", url: "/achievements", icon: Award },
]

export const secondaryNavItems: NavItem[] = [
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Admin", url: "/admin", icon: Shield, adminOnly: true },
]
```

### Route Highlighting Strategy

```typescript
// In AppSidebar and MobileBottomNav
const pathname = usePathname()

function isActive(item: NavItem): boolean {
  if (item.url === "/dashboard") {
    return pathname === "/dashboard"
  }
  return pathname.startsWith(item.url)
}
```

The `/dashboard` case uses exact match to avoid false-positives on `/dashboard/something`. Other routes use prefix matching for nested sub-pages.

---

## Responsive Breakpoint Strategy

### Breakpoint: `md` (768px)

| Viewport | Sidebar | Bottom Tabs | Top Bar |
|----------|---------|-------------|---------|
| `< 768px` | Sheet (hidden, slides in) | Fixed bottom nav | Hamburger + title + actions |
| `>= 768px` | Fixed sidebar (collapsible to icons) | Hidden | SidebarTrigger + title + actions |

### Mobile Bottom Tab Specifications

```
- Position: `fixed bottom-0 inset-x-0`
- Height: 64px (16 * 4) on standard phones
- Safe area: `pb-safe` or `pb-[env(safe-area-inset-bottom)]` for notched devices
- z-index: above content, below modals/dialogs
- Background: glassmorphism blur effect or solid (performance consideration)
- Each tab: icon (24x24) + label (11px/0.65rem)
- Active tab: primary color icon/text
- Inactive tab: muted foreground
- Max 5 items before overflow (we have 5 main + divider + settings optionally)
```

### Content Area Padding

```
Mobile (< md):    pb-[64px + env(safe-area-inset-bottom)]  ← avoid bottom nav overlap
Desktop (>= md):  no bottom padding needed
```

---

## Glassmorphism CSS Architecture

### Design Token Layer

CSS custom properties in `globals.css`, integrated with the existing token system and light/dark variants:

```css
:root {
  /* --- Existing tokens remain --- */
  --background: oklch(1 0 0);
  --card: oklch(1 0 0);
  /* ... all existing tokens ... */

  /* --- NEW: Glassmorphism tokens --- */
  --glass-bg: oklch(1 0 0 / 0.08);
  --glass-border: oklch(1 0 0 / 0.15);
  --glass-border-top: oklch(1 0 0 / 0.2);
  --glass-blur: blur(16px) saturate(180%);
  --glass-blur-sm: blur(8px) saturate(180%);
  --glass-blur-lg: blur(24px) saturate(180%);
  --glass-shadow: 0 4px 24px -1px oklch(0 0 0 / 0.15);
  --glass-highlight: linear-gradient(
    135deg,
    oklch(1 0 0 / 0.1),
    transparent
  );
}

.dark {
  /* --- Existing dark tokens remain --- */

  /* --- NEW: Dark glassmorphism tokens --- */
  --glass-bg: oklch(1 0 0 / 0.04);
  --glass-border: oklch(1 0 0 / 0.08);
  --glass-border-top: oklch(1 0 0 / 0.12);
  --glass-blur: blur(16px) saturate(150%) brightness(1.05);
  --glass-blur-sm: blur(8px) saturate(150%) brightness(1.05);
  --glass-blur-lg: blur(24px) saturate(150%) brightness(1.05);
  --glass-shadow: 0 4px 24px -1px oklch(0 0 0 / 0.4);
  --glass-highlight: linear-gradient(
    135deg,
    oklch(1 0 0 / 0.05),
    transparent
  );
}
```

### Tailwind `@theme` Integration

Registered in `@theme inline` block so they're usable as `bg-glass` or `backdrop-blur-glass`:

```css
@theme inline {
  /* ... existing tokens ... */

  /* Glassmorphism utilities */
  --color-glass-bg: var(--glass-bg);
  --color-glass-border: var(--glass-border);
  --drop-shadow-glass: var(--glass-shadow);
  --color-glass-highlight: var(--glass-highlight);
}
```

### Reusable CSS Classes

```css
@layer utilities {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-top: 1px solid var(--glass-border-top);
    box-shadow: var(--glass-shadow);
  }

  .glass-sm {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur-sm);
    -webkit-backdrop-filter: var(--glass-blur-sm);
    border: 1px solid var(--glass-border);
  }

  .glass-card {
    /* For cards on glass surfaces — slightly heavier bg */
    background: oklch(1 0 0 / 0.12);
    backdrop-filter: var(--glass-blur-sm);
    -webkit-backdrop-filter: var(--glass-blur-sm);
    border: 1px solid var(--glass-border);
    border-radius: var(--radius-moderate);
    box-shadow: var(--glass-shadow);
  }
}
```

### Progressive Enhancement Fallback

```css
/* Solid fallback for browsers without backdrop-filter support */
.glass,
.glass-sm,
.glass-card {
  background: var(--card);
}

@supports (backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)) {
  .glass {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
  }
  .glass-sm {
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur-sm);
  }
  .glass-card {
    background: oklch(1 0 0 / 0.12);
    backdrop-filter: var(--glass-blur-sm);
  }
}
```

### Performance Considerations for Glass

| Concern | Mitigation |
|---------|------------|
| `backdrop-filter` blur is GPU-intensive | Limit glass elements to 2-3 per page (sidebar, top bar, active cards) |
| Animating `backdrop-filter` causes repaints | Animate `opacity` or `background` alpha instead |
| Heavy blur radius (>24px) on large areas | Use `--glass-blur-sm` (8px) for large surfaces, `--glass-blur` (16px) for small elements |
| Safari flicker on backdrop-filter | Add `will-change: backdrop-filter` on glass elements, but use sparingly |

---

## Data Flow for Nav State

### Sidebar Collapse State

```
Root Layout
  └── SidebarProvider (context holds: open, setOpen, isMobile, openMobile, setOpenMobile)
       └── AppSidebar reads context → renders collapsed or expanded
       └── SidebarTrigger reads/writes context → toggle button
       └── MobileBottomNav reads context → close Sheet on nav click
```

The `SidebarProvider` lives in **root layout** (not app layout) so the collapse state persists across route changes within the `(app)` group. If it were in `(app)/layout.tsx`, remounting would reset state — though with route groups this wouldn't actually remount. Root is still the safest location.

### Active Page Detection

```
usePathname() (from next/navigation)
  → AppSidebar compares with each NavItem.url
  → MobileBottomNav compares with each NavItem.url
  → Both components independent, but share the same nav config
```

No prop drilling needed. Each component independently derives active state from the URL.

### Session Data Flow

```
(app)/layout.tsx (server component)
  ├── await requireAuth()          ← server-side redirect if no session
  ├── passes serialized user to <SessionProvider> (client context)
  │   └── AppSidebar reads via useSession() hook
  │   └── TopBar reads via useSession() hook
  └── {children} receive no session props — page components are simplified
```

This eliminates the current pattern where every page component does:
```typescript
useEffect(() => {
  authClient.getSession().then(...)  // 500ms flash
}, [router])
```

The layout does the auth check once, passes user data via context, and all pages are simpler.

### Migration of Existing Pages

Each page currently looks like this (duplicated across 7 pages):

```typescript
function PageContent() {
  // 1. Client-side session fetch
  const [session, setSession] = useState(null)
  useEffect(() => { authClient.getSession().then(...) }, [])

  // 2. Loading state with Header
  if (sessionLoading) return <div min-h-screen><Header user={null} /><DashboardSkeleton /></div>

  // 3. Full page with Header wrapper
  return (
    <div className="flex min-h-screen flex-col">
      <Header user={session.user} />
      <main className="mx-auto w-full max-w-3xl flex-1 ...">
        {/* page content */}
      </main>
    </div>
  )
}
```

After refactor, each page becomes:

```typescript
function PageContent() {
  const { data: entries } = useMoodEntries()
  const { data: stats } = useStats()

  // No session handling — layout already validated
  // No min-h-screen wrapper — layout provides it
  // No Header import — layout provides it

  if (!entries) return <PageSkeleton />

  return (
    // Just the page content — no layout boilerplate
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Page Title</h2>
      {/* ... page content ... */}
    </div>
  )
}
```

---

## Integration Points

### New Files to Create

| File | Purpose | Dependencies |
|------|---------|--------------|
| `.planning/research/ARCHITECTURE.md` | (this file) | — |
| `lib/navigation.ts` | Shared nav config, NavItem types | lucide-react |
| `components/app-sidebar.tsx` | Desktop sidebar component | shadcn sidebar, navigation, usePathname, auth context |
| `components/mobile-bottom-nav.tsx` | Mobile bottom tab bar | navigation, usePathname |
| `components/top-bar.tsx` | Top header bar (trigger + title + actions) | shadcn sidebar, ThemeToggle |
| `components/session-provider.tsx` | Client context for user session | react context |
| `components/ui/sidebar.tsx` | shadcn Sidebar component (installed via CLI) | shadcn init |
| `app/(app)/layout.tsx` | Shared authenticated layout | all above components |

### Existing Files to Modify

| File | Change | Risk |
|------|--------|------|
| `app/layout.tsx` | Add `<SidebarProvider>` wrapping | Low — wraps children, no visual change by itself |
| `app/globals.css` | Add glassmorphism CSS tokens + utility classes + @theme entries | Low — additive only |
| `app/auth/layout.tsx` | Move to `app/(auth)/layout.tsx` | Medium — path change, but URL unaffected due to route group |
| `app/page.tsx` | No change needed (already server-side redirect) | — |
| `app/dashboard/page.tsx` | Remove Header import + session fetch + wrapper div | Medium — logic extraction |
| `app/history/page.tsx` | Same as dashboard | Medium |
| `app/calendar/page.tsx` | Same | Medium |
| `app/analytics/page.tsx` | Same | Medium |
| `app/achievements/page.tsx` | Same | Medium |
| `app/wizard/page.tsx` | Remove Header import (already uses requireAuth) | Low |
| `app/settings/page.tsx` | Remove Header import + session fetch + wrapper | Medium |
| `app/admin/page.tsx` | Remove Header import + session fetch + wrapper | Medium |
| `app/admin/layout.tsx` | Add admin-specific nav items to sidebar (or keep passthrough) | Low |
| `components/header.tsx` | **Delete** — replaced by sidebar + topbar + bottom nav | High — verify all consumers migrated first |
| `components/feedback/fab-button.tsx` | Relocate or remove (FAB conflicts with bottom nav on mobile) | Medium — decision needed |

### Files to Delete (After Migration)

| File | Reason |
|------|--------|
| `components/header.tsx` | Replaced by sidebar + topbar + bottom nav |

---

## Build Order (Dependency Chain)

```
Phase 1: Foundation (no visual change)
  1. lib/navigation.ts                ← no deps
  2. globals.css glassmorphism tokens  ← no deps
  3. Install shadcn sidebar via CLI    ← needs shadcn init (done)
  4. components/ui/sidebar.tsx         ← from CLI

Phase 2: Session infrastructure
  5. components/session-provider.tsx   ← react context

Phase 3: Layout shell
  6. app/(auth)/layout.tsx             ← move existing auth layout
  7. components/app-sidebar.tsx        ← depends on: navigation, session-provider
  8. components/top-bar.tsx            ← depends on: shadcn sidebar trigger
  9. components/mobile-bottom-nav.tsx  ← depends on: navigation
  10. app/(app)/layout.tsx             ← depends on: all above
  11. app/layout.tsx (add SidebarProvider) ← depends on: sidebar component

Phase 4: Page migration
  12. Migrate dashboard/page.tsx       ← remove Header, session fetch, wrapper
  13. Migrate history/page.tsx         ← same pattern
  14. Migrate calendar/page.tsx        ← same pattern
  15. Migrate analytics/page.tsx       ← same pattern
  16. Migrate achievements/page.tsx    ← same pattern
  17. Migrate wizard/page.tsx          ← remove Header
  18. Migrate settings/page.tsx        ← remove Header, session fetch
  19. Migrate admin/page.tsx           ← remove Header, session fetch

Phase 5: Cleanup
  20. Delete components/header.tsx     ← depends on: all pages migrated
  21. Remove @base-ui/react/drawer     ← was only used by old mobile drawer
  22. Verify no dead code in components/

Phase 6: Glass surface polish
  23. Apply glass classes to cards, sidebar, top bar
  24. FAB button: relocate or remove
```

---

## Anti-Patterns to Avoid

### 1. Putting SidebarProvider in (app)/layout.tsx Instead of Root

**What goes wrong:** Collapse state resets if user navigates to auth page and back. More importantly, if future route groups need sidebar access, they can't get it.

**Do this instead:** Keep `SidebarProvider` in root `app/layout.tsx`.

### 2. Hardcoding Nav Items in Both Sidebar and Bottom Nav

**What goes wrong:** Adding a new nav item requires touching two components. One gets out of sync.

**Do this instead:** Single `lib/navigation.ts` config consumed by both.

### 3. Client-Side Session in Every Page

**What goes wrong:** Loading flash on every page navigation. Every page has the same 20-line boilerplate.

**Do this instead:** `requireAuth()` in `(app)/layout.tsx` server component, pass user via context. Server-side check is instant (no round-trip).

### 4. Glassmorphism via Inline Tailwind Classes Everywhere

**What goes wrong:** `backdrop-blur-xl bg-white/10 border border-white/20` repeated across 40+ elements. Hard to tweak globally.

**Do this instead:** Define `.glass`, `.glass-sm`, `.glass-card` CSS classes using custom properties. Use `className="glass"` for consistency. Change one CSS variable to update all.

### 5. Animating backdrop-filter

**What goes wrong:** Crippling repaints. `backdrop-filter` changes trigger full rasterization of the blurred region.

**Do this instead:** Animate `opacity` or `background` alpha for transitions. Only apply `backdrop-filter` statically (no transition on the blur property).

### 6. Bottom Tabs Without Safe Area

**What goes wrong:** On iPhone X+ and modern Android, the bottom nav sits behind the gesture area. The last tab is hard to tap.

**Do this instead:** Add `pb-[env(safe-area-inset-bottom)]` or use `pb-safe` utility to account for notches/gesture bars.

---

## Scaling Considerations

| Concern | Current Scale (<100 users) | At 1K+ users |
|---------|--------------------------|--------------|
| Layout nav rendering | Static config, 5 items | Same — static nav doesn't grow |
| Glass backdrop-filter performance | Fine on modern devices | Add `@supports` fallback for old browsers |
| Sidebar state | localStorage | Same approach scales |
| Session in layout | Server-side requireAuth | Same — no per-user layout cost |
| Number of glass elements | 2-3 per page | Stay at 2-3 — don't glass-everything |

The navigation architecture is not a scaling concern — it's a static config. The glassmorphism rendering is the only performance consideration, and it's bounded by element count, not user count.

---

## Sources

- [shadcn/ui Sidebar documentation](https://ui.shadcn.com/docs/components/base/sidebar) — HIGH confidence (official docs)
- [Next.js 16 App Router route groups](https://nextjs.org/docs/app/getting-started/layouts-and-pages) — HIGH confidence (official docs)
- [Tailwind CSS backdrop-blur utilities](https://tailwindcss.com/docs/backdrop-filter-blur) — HIGH confidence (official docs)
- [CSS Glassmorphism: Defining Developer's Guide 2026](https://nineproo.com/blog/css-glassmorphism-guide) — MEDIUM confidence (cross-referenced with MDN for backdrop-filter compatibility)
- [shadcn sidebar + Next.js layout best practices](https://eastondev.com/blog/en/posts/dev/20260327-shadcn-ui-sidebar-layout/) — MEDIUM confidence (blog, but matches official docs)
- [Building Admin Skeleton with shadcn/ui Sidebar](https://shipai.today/vibe-coding/shadcn-sidebar) — MEDIUM confidence (cross-referenced against official shadcn docs)
- Browser support for `backdrop-filter`: [Can I Use](https://caniuse.com/css-backdrop-filter) — 96%+ support globally, >99% in modern browsers

---
*Architecture research for: Moodscaparr v1.2 UI Redesign — layout restructure, sidebar + bottom nav + glassmorphism*
*Researched: 2026-07-13*
