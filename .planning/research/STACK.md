# Technology Stack

**Project:** Moodscaparr v1.2 UI Redesign
**Researched:** 2026-07-13
**Focus:** Layout restructure, sidebar, bottom tabs, glassmorphism

## Recommended Additions to Existing Stack

### Core Framework
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| shadcn Sidebar | Latest (via CLI) | Desktop sidebar component | Already has CSS vars in globals.css, built-in responsive Sheet behavior, collapsible state management, active route highlighting |
| shadcn Breadcrumb | Latest (via CLI) | Page hierarchy in top bar | Pair with sidebar for breadcrumb navigation context |
| shadcn Resizable | Latest (optional) | Drag-resizable sidebar | Only if drag-to-resize is desired; adds complexity |

### CSS Architecture
| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| CSS Custom Properties | Native | Glassmorphism design tokens | Integrates with existing OKLCH token system; no runtime overhead |
| Tailwind backdrop-blur utilities | 4.x | Glass blur effects | Already in project; `backdrop-blur-lg`, `backdrop-blur-xl` available |
| `@supports` queries | Native | Glassmorphism fallback | 96% browser support; graceful degradation for old browsers |

### Supporting Libraries
| Library | Purpose | When to Use |
|---------|---------|-------------|
| `recharts` (existing) | Charts in analytics | Already in project — unchanged |
| `lucide-react` (existing) | Nav item icons | Already in project — used for sidebar + bottom tab icons |
| `clsx` + `tailwind-merge` (existing) | `cn()` utility | Already in project — used for conditional class merging |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Sidebar | shadcn Sidebar | Build from scratch | 3+ days of work for accessible, responsive sidebar. shadcn handles collapse state, mobile Sheet, keyboard nav, RTL |
| Mobile nav | shadcn Sidebar auto-Sheet | Separate Drawer component | shadcn already converts sidebar to Sheet on mobile. Adding a separate drawer is redundant. Bottom tabs are additional, not replacement |
| Nav config | Centralized `lib/navigation.ts` | Per-component config | Duplication risk — adding a nav item means touching 2+ files |
| Glassmorphism | CSS custom properties + Tailwind classes | CSS-in-JS (styled-components, etc.) | CSS custom properties are the simplest integration with Tailwind v4's `@theme` system. No additional runtime |
| Layout state | React Context (SidebarProvider) | Zustand | shadcn already provides context-based state management. Adding Zustand is unnecessary complexity for a single boolean collapse state |

## Installation

```bash
# Install shadcn sidebar (core component)
npx shadcn@latest add sidebar

# Optional: breadcrumb for top bar
npx shadcn@latest add breadcrumb

# Optional: resizable for drag-to-resize sidebar
npx shadcn@latest add resizable
```

## Dependencies to Remove

| Package | Reason | When |
|---------|--------|------|
| `@base-ui/react` | Only used by old mobile drawer in header.tsx | After header.tsx deletion |

## Sources

- [shadcn Sidebar installation guide](https://ui.shadcn.com/docs/components/base/sidebar) — HIGH confidence
- [CSS Glassmorphism: The Definitive Developer's Guide 2026](https://nineproo.com/blog/css-glassmorphism-guide) — MEDIUM confidence
- Existing `components.json` confirms shadcn is already configured with `base-nova` style and `neutral` base color

## Stack Decision Map

```
Add sidebar? → YES → Use shadcn Sidebar (already in ecosystem)
Add bottom tabs? → YES → Build custom MobileBottomNav component (simple, no library needed)
Add glassmorphism? → YES → CSS custom properties + Tailwind utilities (no library needed)
Need breadcrumbs? → OPTIONAL → Install shadcn Breadcrumb if hierarchy is desired
Need drag-resize? → NO → Not in scope for v1.2
```
