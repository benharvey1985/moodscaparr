# Stack Research

**Domain:** Mood Diary / Journaling Web Application
**Researched:** 2026-07-06
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Next.js** | 16.2.x (Active LTS) | Full-stack framework (frontend + API) | Next.js 16 (GA Oct 2025) is the current active LTS with Turbopack as default bundler, built-in React 19, streaming SSR, and Server Actions. Handles both frontend and backend in one project — API route handlers replace Express. The App Router's route groups cleanly separate authenticated and unauthenticated screens. Vercel-native deployment with preview environments. |
| **React** | 19.x | UI library | Bundled with Next.js 16. React 19 brings the `use()` hook, improved server components, and the new React Compiler for automatic memoization. No separate install. |
| **TypeScript** | 5.7+ | Type safety | Strict mode catches entire classes of bugs at compile time. Next.js 16 has typed routes (compile-time safety for `<Link>`), route export validation, and automatic type generation via `next typegen`. Non-negotiable for a project of this complexity. |
| **Better Auth** | 1.x | Authentication (email/password, SSO, roles) | In 2026, Better Auth has won the "best DX" slot for self-hosted auth in new TypeScript projects. Auth.js (NextAuth) active development has moved to Better Auth — the official Auth.js migration page now recommends Better Auth for new projects. Plugin architecture: OAuth (Google, GitHub), email/password, 2FA, organizations (admin roles), magic links, passkeys. TypeScript-first with full type inference. Framework-agnostic but has first-class Next.js adapter. Ships httpOnly cookie sessions, database-backed sessions, or JWT. |
| **PostgreSQL (Neon)** | 16 / 17 | Primary database | Neon is serverless Postgres purpose-built for the Next.js/Vercel ecosystem. Scale-to-zero eliminates idle compute cost — ideal for a mood diary with bursty usage. Copy-on-write branching for preview deployments. Native Vercel integration. Free tier: 0.5 GB storage, 10 projects, 100 compute-hours/month. No idle pause (auto-wakes in ~500ms). Supabase was considered but rejected (see Alternatives). |
| **Prisma ORM** | 7.x | Database access & migrations | Prisma 7 (2026) replaced the Rust query engine with pure-TypeScript + WASM — cold starts dropped from ~800ms to under 100ms on Vercel. Driver adapter pattern (`@prisma/adapter-neon` for Neon) eliminates 15MB Rust binary bundle. Typed SQL (`$queryTyped`) types both params and results for raw queries. `prisma migrate deploy` in CI. Works on edge runtimes via `prisma generate --no-engine`. |
| **Tailwind CSS** | v4 | Utility-first CSS | Tailwind v4 uses CSS-first configuration (`@import "tailwindcss"`), native CSS cascade layers, and automatic content detection. No `tailwind.config.js` boilerplate. Combined with shadcn/ui v4, it provides 3-category color token system (positive/neutral/negative) as CSS variables — critical for the non-negotiable visual unification requirement. |
| **shadcn/ui** | 4.13.x | Component library | Copy-paste component distribution (not a dependency). As of July 2026, Base UI is the new default component library. All components are accessible (Radix UI primitives), themed via CSS variables, and tree-shakeable. Provides Dialog, Sheet, Select, Button, Card, Toast, Dropdown, Tabs, Table, Badge — all needed for this project. The CSS variable-based theming maps directly to the 3-category color system. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Recharts** | 3.9.x | Charts & visualizations | All chart requirements: Mood timeline (LineChart), day-of-week comparison (BarChart), weather correlation (BarChart), wellbeing trends (LineChart), activity impact (BarChart), mood distribution (PieChart), admin trend charts. React-native, SVG-based, declarative API. Avoids D3 complexity. New in 3.9: customizable animations. |
| **Zod** | 4.4.x | Schema validation | Form validation (login, register, mood entry wizard, settings), API request validation, type inference. Zod 4 is 2KB gzipped, 10-40x faster than Zod 3, with improved error messages. Pairs with react-hook-form for form state. |
| **react-hook-form** | 7.81.x | Form state management | Handles the 3-step mood wizard, settings forms, feedback forms. 7.x is stable (8.x still beta as of mid-2026). Uncontrolled inputs reduce re-renders. Integrates with Zod via `@hookform/resolvers`. |
| **TanStack Query** | 5.101.x | Server state & caching | All data fetching: mood entries, dashboard stats, analytics, admin data. Automatic caching, background refetching, optimistic updates for mood logging. The `useMoodEntries` hook pattern (CRUD + realtime) is the established convention for this domain. |
| **date-fns** | 4.4.x | Date manipulation | Calendar heatmap date math, date formatting/parsing, streak calculation, date range filtering (7d/30d/90d). v4 has first-class timezone support (critical for user timezone settings). Zero-dependency, tree-shakeable. Alternative: Day.js (smaller but less feature-rich). |
| **jspdf** + **html2canvas** | latest | PDF report generation | Standard approach for client-side PDF generation. jsPDF creates the document; html2canvas renders React components to canvas for embedding. Combined they generate the analytics PDF report with actual chart images. |
| **Sonner** | 2.x | Toast notifications | Lightweight toast library. Used for: achievement unlock notifications, feedback submission confirmation, error states. Works with shadcn/ui theme system (light/dark automatically). |
| **canvas-confetti** | latest | Achievement celebrations | Triggered when user unlocks a badge. Standard library for confetti effects. Under 5KB. |
| **react-joyride** | latest | Onboarding tour | 3-step modal tour on first login. Mature, accessible, supports step skipping and replay. |
| **lucide-react** | latest | Icons | Consistent icon system across all UI. Preferred over FontAwesome (tree-shakeable, no font file, TypeScript types). |
| **next-themes** | latest | Theme management | Light/dark/system theme toggle. Saves preference, avoids flash on load, works with Tailwind's `dark:` variant. |
| **react-csv** or native | latest | CSV export | CSV export for entry history and admin data. Simple enough that a custom hook generating Blob URL with `text/csv` type may suffice. react-csv provides `<CSVLink>` component if preferred. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **pnpm** | Package manager | Faster than npm, disk-efficient (content-addressable store), strict dependency isolation. Install via `corepack enable && corepack prepare pnpm@latest --activate`. |
| **Biome** | Linter + Formatter | Next.js 15.5+ deprecated `next lint` in favor of Biome or standalone ESLint. Biome is 10x faster than ESLint + Prettier, handles both linting and formatting in one binary. Install: `@biomejs/biome`. |
| **Vitest** | Unit / Integration tests | Vite-native test runner. Faster than Jest. Compatible with React Testing Library. Achieve 80%+ coverage on utilities, hooks, components. |
| **Playwright** | E2E tests | Industry standard for browser testing. Tests: registration flow, mood logging wizard, navigation, chart rendering, theme toggle, responsive layout. Mock Supabase/Neon calls with `page.route()`. |
| **Husky** + **lint-staged** | Git hooks | Pre-commit: run Biome + Vitest on staged files. Optional but recommended for team consistency. |
| **GitHub Actions** | CI/CD | Run Biome → Vitest → Playwright on PR. `prisma migrate deploy` in deploy stage. 4-stage pipeline pattern from similar mood tracker projects. |

## Installation

```bash
# Create project
pnpm create next-app moodscaparr --typescript --app --tailwind --src-dir

# Core dependencies
pnpm add better-auth @better-auth/next
pnpm add @prisma/client @prisma/adapter-neon
pnpm add @neondatabase/serverless
pnpm add recharts zod @hookform/resolvers react-hook-form
pnpm add @tanstack/react-query
pnpm add date-fns
pnpm add sonner canvas-confetti react-joyride
pnpm add lucide-react next-themes
pnpm add jspdf html2canvas

# Dev dependencies
pnpm add -D prisma
pnpm add -D @biomejs/biome
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D @playwright/test

# Initialize shadcn/ui
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button card dialog sheet select tabs toast table badge dropdown-menu avatar input label separator skeleton scroll-area progress

# Initialize Prisma
pnpm prisma init
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Neon** (serverless Postgres) | **Supabase** | Choose Supabase when you want auth + storage + realtime in one platform and don't mind the 7-day idle pause on the free tier. Supabase free gives 50K MAU auth, 1 GB storage, 2 projects. The tradeoff: project pauses after 7 days of inactivity (manual restore), no database branching. For this project, Better Auth handles auth better than Supabase Auth, and we don't need Supabase Realtime/Storage — making Neon the leaner pick. |
| **Neon** (serverless Postgres) | **SQLite** | Choose SQLite (via Turso/LibSQL) for local-first / offline-first mood tracking. The brief specifies CSV/JSON export/restore, suggesting a centralized database. Neon's scale-to-zero makes Postgres cost-effective even for a single-user diary instance. |
| **Better Auth** | **Auth.js v6** | Choose Auth.js v6 if you have an existing NextAuth deployment and don't want to migrate. For this greenfield project, Better Auth is the consensus 2026 recommendation: cleaner API, stronger TypeScript inference, plugin model (2FA, orgs, magic links), active maintenance from the Auth.js lineage. |
| **Better Auth** | **Clerk** | Choose Clerk if you want managed auth and are willing to pay per-MAU. Faster initial setup (pre-built UI components, 1-day integration). Tradeoff: vendor lock-in, per-user pricing that scales with your user base, and managed accounts in a single-user diary app. |
| **Prisma 7** | **Drizzle ORM** | Choose Drizzle if you prefer SQL-like query syntax over Prisma's object API, or if you want even smaller bundle size for edge functions. Drizzle is more SQL-transparent but has fewer migration features and weaker tooling (no Prisma Studio equivalent). Prisma 7's WASM engine and typed SQL close the gap significantly. |
| **Recharts** | **Nivo** / **Visx** | Choose Nivo for more customization / animation control, or Visx (by Airbnb) for fine-grained D3 composition. This project's chart needs (line, bar, pie, heatmap) are standard — Recharts' declarative API is the fastest path. Recharts 3.9 has customizable animations that cover the mood tracker use case. |
| **Tailwind CSS v4** | **CSS Modules** | Choose CSS Modules if you prefer writing custom CSS and don't want utility-first. For this project, shadcn/ui's component system + Tailwind's utility classes + CSS variable theming directly map to the 3-category color unification requirement. Tailwind's `dark:` variant handles theme toggle trivially. |
| **Vercel** | **Railway** / **Docker VPS** | Choose Railway ($7-15/mo) or a Docker VPS ($4-6/mo) if you want predictable pricing without bandwidth overages. Vercel free tier is fine for launch; migrate to Railway if Pro costs ($20/seat + $40/100GB overage) become an issue at scale. |
| **Better Auth sessions** | **Next.js Server Actions** + JWT | Choose custom JWT auth if you need to understand every auth decision in your codebase and want no external library dependency. For this project, Better Auth's plugin system (roles, SSO, password reset, invite codes) covers too many features to build from scratch. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Next.js 15** | Maintenance LTS as of Oct 2025. Next.js 16 is active LTS with Turbopack as default, `proxy.ts` replacing `middleware.ts`, improved typed routes, and native `next typegen`. Starting a new project on 15 means migrating within months. | Next.js 16.x |
| **Auth.js v5** | Active development moved to Better Auth. The official migration page recommends Better Auth for new projects. Auth.js v5 has weaker TypeScript inference, no native 2FA/orgs, and generics-based errors that require docs to debug. | Better Auth 1.x |
| **Redux / Zustand (global state)** | This app does not need a global state manager. All data comes from the server (mood entries, user profile, analytics). TanStack Query handles caching, background sync, and optimistic updates. Local component state + React Query is sufficient. | TanStack Query 5 |
| **D3 directly** | D3's low-level API adds significant complexity for standard chart types. The mood tracker needs line, bar, pie, and heatmap charts — all available in Recharts with declarative React components. D3 is overkill for this use case. | Recharts 3 |
| **MongoDB / NoSQL** | Mood entries have deeply relational data: users ↔ entries ↔ activities ↔ weather ↔ achievements ↔ streaks. A document DB requires complex joins or denormalization that Postgres handles natively. Postgres + Prisma gives relational integrity with JSON fields where needed. | Neon (PostgreSQL) |
| **Firebase** | Proprietary NoSQL with vendor lock-in. Firestore queries become painful for analytics aggregations (avg mood score, streak calculation, mood distribution). No join support. Pricing becomes unpredictable at scale. Firebase Auth is decent but Better Auth + Neon gives more control. | Better Auth + Neon |
| **Styled Components / CSS-in-JS** | Runtime CSS-in-JS adds bundle size and runtime overhead. React Server Components cannot use them. Tailwind CSS + CSS variables + shadcn/ui covers all styling needs without runtime cost. | Tailwind CSS v4 |
| **Sass / SCSS** | Tailwind CSS v4 with CSS cascade layers and `@layer` directives makes Sass unnecessary. CSS nesting is natively supported in all modern browsers. | Tailwind CSS v4 |
| **Formik** | Outdated pattern. react-hook-form has better performance (uncontrolled inputs), smaller bundle, and official Zod integration. Formik requires more boilerplate and causes more re-renders. | react-hook-form + Zod |
| **Express.js (standalone backend)** | Next.js API route handlers + Server Actions eliminate the need for a separate Express server. Maintaining two deployments (frontend + backend) adds complexity without benefit for this application's scope. | Next.js API Routes / Server Actions |
| **SWR** | TanStack Query (React Query) has superseded SWR in features (mutation caching, optimistic updates, pagination, infinite queries) while being maintained by the TanStack team alongside other tools. SWR is less actively developed. | TanStack Query 5 |

## Stack Patterns by Variant

**If deploying on Vercel (recommended for launch):**
- Use **Neon** with `@neondatabase/serverless` driver + Prisma adapter
- Use **Better Auth** with database sessions
- Configure `vercel.json` for proxy rules
- Use Vercel's preview deployments for PR review
- Note: Vercel Pro costs $20/seat/month + bandwidth overages at scale

**If self-hosting or deploying on Railway:**
- Use **Neon** (managed) or local **PostgreSQL** instance
- Use **Better Auth** (identical setup, no Vercel-specific integration)
- Dockerize with `next build` standalone output mode
- Railway starts at ~$7-15/month with predictable pricing (no bandwidth overages)

**If local-first / offline-first:**
- Replace Neon with **Turso** (SQLite edge) or **IndexedDB** (via `idb` library)
- Mood data stays on device; optional sync to cloud
- Use **Zustand** if client-side state management is needed for offline queue
- This is a significant architecture shift — only pursue if offline access is a hard requirement

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `next@16` | `react@19`, `react-dom@19` | Bundled together. Next.js 16 requires React 19 in the App Router. |
| `better-auth@1.x` | `next@16`, `@prisma/client@7` | Better Auth has a first-party Prisma adapter. Works with Next.js 16's `proxy.ts`. |
| `@prisma/client@7` | `@prisma/adapter-neon`, `@neondatabase/serverless` | Prisma 7 requires driver adapters. Use `@prisma/adapter-neon` for Neon. |
| `@neondatabase/serverless` | `@prisma/adapter-neon`, Prisma 7 | Neon's serverless WebSocket driver. Must use Prisma driver adapter pattern — NOT legacy `prisma` connection string. |
| `recharts@3.9` | `react@19`, `react-dom@19` | Peer dependency on React 16+. Full compatibility with React 19. |
| `@tanstack/react-query@5` | `react@19` | v5 supports React 18+. Fully compatible with React 19. |
| `react-hook-form@7.81` | `react@19`, `zod@4` | 7.x is stable (8.x in beta). `@hookform/resolvers` package required for Zod integration. |
| `zod@4` | TypeScript 5.0+ | Zod 4 drops support for TypeScript <5.0. Major API changes from Zod 3 — new import paths, different error format. |
| `date-fns@4` | TypeScript 4.0+ | v4 adds built-in timezone support via `@date-fns/tz`. Zero migration from v3 for most APIs. |
| `next-themes` | `next@16` | Works with Next.js 16 App Router. Provides `ThemeProvider` for `useTheme()` hook. |

## Sources

- **DailyMood case study (dev.to)** — Real Next.js 15 + Supabase + Recharts mood tracker; validated architecture patterns
- **nextjs.org/blog/next-15-5** — Confirmed Next.js 15.5 EOL prep and 16.x deprecations
- **versions.dev/modernize/nextjs** — Next.js 16.x is current Active LTS (GA Oct 2025)
- **ui.shadcn.com/docs/changelog** — shadcn/ui 4.13.0 with Base UI as default (July 2026)
- **ui.shadcn.com/docs/tailwind-v4** — Tailwind v4 migration confirmed compatible
- **Better Auth vs Auth.js research** — Multiple 2026 sources confirm Better Auth as new-project default; Auth.js active development moved to Better Auth
- **prisma.io/docs/guides/upgrade-prisma-orm/v7** — Prisma 7 confirmed GA; Rust engine deprecated; typed SQL stable
- **cadence.withremote.ai/blog/prisma-2026-guide** — Confirmed cold-start improvements (800ms → <100ms) with Prisma 7 + driver adapters
- **npmjs.com/package/recharts** — Recharts 3.9.1 latest (June 30, 2026)
- **npmjs.com/package/@tanstack/react-query** — v5.101.2 latest (July 2026)
- **npmjs.com/package/react-hook-form** — v7.81.0 latest (July 2026)
- **npmjs.com/package/zod** — Zod v4.4.3 latest (May 2026)
- **npmjs.com/package/date-fns** — date-fns v4.4.0 latest (May 2026)
- **Neon vs Supabase comparison** — Multiple 2026 sources confirm Neon for pure-Postgres on Vercel, Supabase for full-platform bundling
- **nextjs.org/blog** — Next.js 16.x release cycle confirmed

---
*Stack research for: Moodscaparr (mood diary web application)*
*Researched: 2026-07-06*
