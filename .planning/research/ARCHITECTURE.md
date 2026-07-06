# Architecture Research

**Domain:** Mood Diary / Journaling Web Application
**Researched:** 2026-07-06
**Confidence:** HIGH

## Standard Architecture

### System Overview

Mood diary apps follow a conventional full-stack web architecture: a frontend SPA (or SSR app) communicating via REST/JSON with a backend API server backed by a relational database. Auth is session-based (JWT). The architecture is monolith-first with clear internal module boundaries — splitting into microservices would be premature for a single-user-diary domain.

```
┌──────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │  Auth    │  │  Mood    │  │  Visual  │  │  Admin   │         │
│  │  Pages   │  │  Wizard  │  │  Dash    │  │  Panel   │         │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘         │
│       │              │              │              │               │
│  ┌────┴──────────────┴──────────────┴──────────────┴─────────┐   │
│  │                UI Component Library (shadcn/ui)           │   │
│  │        ┌──────────────────┐  ┌──────────────────┐        │   │
│  │        │  Mood Elements   │  │    Card System   │        │   │
│  │        │  (colors/emojis) │  │  (rounding tiers) │        │   │
│  │        └──────────────────┘  └──────────────────┘        │   │
│  └──────────────────────────────┬────────────────────────────┘   │
│                                 │                                │
│  ┌──────────────────────────────┴────────────────────────────┐   │
│  │            State / Server Data Layer                       │   │
│  │  (React Query + Zustand — server cache + client state)    │   │
│  └──────────────────────────────┬────────────────────────────┘   │
├─────────────────────────────────┼────────────────────────────────┤
│                                 │ HTTP (fetch/axios)             │
├─────────────────────────────────┼────────────────────────────────┤
│                        API GATEWAY                               │
│  ┌──────────────────────────────┴────────────────────────────┐   │
│  │                    Next.js API Routes                      │   │
│  │    ┌──────────┐  ┌──────────┐  ┌──────────┐              │   │
│  │    │ /api/auth │  │ /api/    │  │ /api/    │              │   │
│  │    │           │  │ entries  │  │ admin   │              │   │
│  │    └────┬──────┘  └────┬─────┘  └────┬─────┘              │   │
│  └─────────┼──────────────┼──────────────┼───────────────────┘   │
├────────────┼──────────────┼──────────────┼───────────────────────┤
│            │              │              │                        │
│  ┌─────────┴──────────────┴──────────────┴──────────────────┐    │
│  │                    SERVICE LAYER                           │    │
│  │  ┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌──────┐  │    │
│  │  │ Auth   │ │ Mood   │ │Achieve- │ │ Streak │ │Export│  │    │
│  │  │Service │ │Service │ │mentSvc  │ │ Service│ │Svc   │  │    │
│  │  └───┬────┘ └───┬────┘ └────┬────┘ └───┬────┘ └──┬───┘  │    │
│  └──────┼──────────┼───────────┼──────────┼──────────┼──────┘    │
│         │          │           │          │          │           │
│  ┌──────┴──────────┴───────────┴──────────┴──────────┴──────┐    │
│  │                     DATA LAYER (Prisma ORM)               │    │
│  │  ┌─────────────────────────────────────────────────────┐  │    │
│  │  │                  PostgreSQL                          │  │    │
│  │  │  users  │  entries  │  contexts  │  achievements    │  │    │
│  │  │  sessions │ feedback │  settings  │  invite_codes   │  │    │
│  │  └─────────────────────────────────────────────────────┘  │    │
│  └───────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Auth Pages | Register, login, password reset, SSO callbacks | Server component pages with form validation |
| Mood Wizard | 3-step entry creation (mood → context → reflect) | Multi-step form with stepper UI, client-side draft state |
| Dashboard | Greeting, KPI cards, quick log, recent entries, streak | Server component with client islands for interactivity |
| Calendar Heatmap | Monthly grid, color-coded cells, month stats | Client-side canvas/div grid, date range queries |
| Analytics | Charts, trends, reflection word cloud, PDF report | Chart.js/Recharts on client, aggregation queries on server |
| Entry History | Paginated list, search, filter, CSV export | Server-side pagination, client-side search UI |
| Admin Panel | User table, KPIs, instance config, invite codes | Protected routes, admin-only API middleware |
| Gamification Engine | Achievement unlock detection, streak calculation | Server-side service triggered on entry create |
| Export Service | PDF + CSV generation | Server-side (PDF: puppeteer/pdf-lib, CSV: streaming) |
| Theme System | Light/dark/system toggle, persisted to DB + localStorage | Tailwind `dark:` class, CSS variables, React context |

## Recommended Project Structure

```
src/
├── app/                    # Next.js App Router (routes + layouts)
│   ├── (auth)/             # Login / register / reset pages
│   ├── (dashboard)/        # Main app shell (protected layout)
│   │   ├── dashboard/      # Home page
│   │   ├── log/            # Mood wizard (3-step)
│   │   ├── history/        # Entry list + search
│   │   ├── calendar/       # Heatmap view
│   │   ├── analytics/      # Charts + reports
│   │   ├── profile/        # User settings
│   │   └── admin/          # Admin panel (role-gated)
│   ├── api/                # API route handlers
│   │   ├── auth/           # Login, register, reset, SSO
│   │   ├── entries/        # Mood CRUD
│   │   ├── achievements/   # Badge data
│   │   ├── streaks/        # Streak data
│   │   ├── admin/          # Admin operations
│   │   ├── export/         # PDF/CSV generation
│   │   └── feedback/       # Bug reports / suggestions
│   └── layout.tsx          # Root layout (theme, auth guard)
├── components/             # Shared UI components
│   ├── ui/                 # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── mood/               # Mood selector, mood badge, intensity badge
│   ├── cards/              # Card system with rounding tiers
│   ├── charts/             # Chart wrappers (mood timeline, distribution, etc.)
│   └── layout/             # Navbar, sidebar, FAB, toast provider
├── lib/                    # Business logic + utilities
│   ├── auth/               # Auth service (hash, JWT, session)
│   ├── mood/               # Mood service (CRUD, validation)
│   ├── achievements/       # Achievement engine + badge definitions
│   ├── streaks/            # Streak calculation logic
│   ├── export/             # PDF/CSV generation logic
│   ├── feedback/           # Feedback service
│   └── utils.ts            # Shared helpers (dates, formatting, etc.)
├── hooks/                  # Custom React hooks
│   ├── use-mood.ts         # Mood data queries + mutations
│   ├── use-streak.ts       # Streak query
│   ├── use-achievements.ts # Achievement query + unlock toast
│   ├── use-theme.ts        # Theme toggle hook
│   └── use-onboarding.ts   # Tour state
├── stores/                 # Zustand stores (client-only state)
│   ├── ui-store.ts         # Sidebar, modals, toast queue
│   └── draft-store.ts      # Mood wizard draft (in-progress entries)
├── types/                  # TypeScript type definitions
│   ├── mood.ts             # Mood, entry, context types
│   ├── achievement.ts      # Badge, progress types
│   ├── user.ts             # User, role, settings types
│   └── api.ts              # API request/response shapes
├── prisma/                 # Database schema + migrations
│   └── schema.prisma       # All models
├── public/                 # Static assets
│   └── fonts/              # Custom fonts
└── styles/                 # Global styles
    └── globals.css         # Tailwind base, theme CSS variables
```

### Structure Rationale

- **`app/` (App Router):** Next.js App Router gives file-based routing, server components by default, and API routes co-located in the same project. This avoids a separate backend repo for a monolith.
- **`components/`:** All shared UI lives here. The `mood/` subdirectory enforces the non-negotiable visual unification rule — every mood element renders through the same component, eliminating drift.
- **`lib/`:** Pure logic, no React. Services are importable from both API routes and server components. Testing pure functions here is trivial.
- **`hooks/`:** Data-access layer for the client. Hooks abstract React Query calls so pages never call `useQuery` directly with URLs.
- **`stores/`:** Minimal Zustand stores for genuinely client-side state (modals, wizard drafts). Server state lives in React Query cache instead — no duplication.
- **`prisma/`:** Single source of truth for schema. Migrations and type generation flow from here.

## Architectural Patterns

### Pattern 1: Server Component → Client Island

**What:** Pages render as server components by default. Interactive elements (mood selector, charts, dialogs) are client components rendered as islands within the server-provided shell.

**When to use:** Always — this is the Next.js App Router convention. Use for every page.

**Trade-offs:** Client components can't use server-only features (direct DB access). Must pass data as props or through API calls. Benefit: most page content is static HTML, only interactivity ships JS.

**Example:**
```typescript
// DashboardPage — server component
export default async function DashboardPage() {
  const user = await getCurrentUser()
  const stats = await getDashboardStats(user.id)
  return (
    <div>
      <Greeting user={user} />
      <KpiCards stats={stats} />
      <QuickLog userId={user.id} /> {/* client island */}
      <RecentEntries entries={stats.recentEntries} />
    </div>
  )
}
```

### Pattern 2: Service → Repository (No Service Bus)

**What:** Each domain (auth, mood, achievements) has a thin service module. Services call Prisma directly — no repository abstraction layer. Business logic lives in services, not controllers.

**When to use:** Always. For a monolith of this size, adding a repository layer is premature indirection. Prisma already abstracts the database.

**Trade-offs:** Harder to swap databases (but we won't). Easier to audit and debug — one call stack from API route through service to database.

**Example:**
```typescript
// lib/mood/mood-service.ts
export async function createMoodEntry(userId: string, data: CreateEntryInput) {
  const entry = await prisma.entry.create({
    data: { userId, ...data },
    include: { contexts: true }
  })
  await checkAndAwardAchievements(userId)
  return entry
}
```

### Pattern 3: Unlock-Then-Award (Gamification)

**What:** After every mood entry mutation, the gamification service checks all achievement criteria and streak state. Newly unlocked achievements are collected and returned so the frontend can show confetti/toast.

**When to use:** Every entry create/update/delete. Not on reads.

**Trade-offs:** Adds latency to every write. Mitigate by running checks after the DB write (async if performance becomes an issue). For 0-1k users, synchronous is fine.

**Example:**
```typescript
type MutationResult = {
  entry: Entry
  newAchievements: Achievement[]  // empty unless something just unlocked
  streak: StreakState
}

export async function createEntry(data: CreateEntryInput): Promise<MutationResult> {
  const entry = await prisma.entry.create({ data })
  const streak = await recalculateStreak(entry.userId)
  const newAchievements = await checkAchievements(entry.userId)
  return { entry, newAchievements, streak }
}
```

## Data Flow

### Request Flow

```
[User clicks "Log Mood" → submits wizard step 3]
    ↓
[MoodWizard client component]
    ↓  POST /api/entries  (React Query mutation)
    ↓
[API Route Handler] → [authMiddleware (JWT verify)]
    ↓
[moodService.createEntry(userId, data)]
    ↓
[Prisma ORM] → [PostgreSQL INSERT]
    ↓
[Recalculate streak] → [Check achievements]
    ↓
[Response: { entry, newAchievements, streak }]
    ↓
[React Query cache update → UI re-render]
    ↓
[Toast: "Achievement unlocked!"]    [Streak bar updates]
```

### State Management

```
┌────────────────────────────────────────────────────────────┐
│                     STATE MAP                               │
│                                                            │
│  Server State (React Query cache):                         │
│    entries, user profile, achievements, streaks, charts    │
│    → Fetched via hooks, auto-refetch on mutations          │
│                                                            │
│  Client State (Zustand):                                   │
│    ui-store: sidebar open, active modal, toast queue       │
│    draft-store: wizard form progress (survives navigation) │
│    → Not persisted (lives only in memory)                  │
│                                                            │
│  Persistent State (localStorage):                          │
│    theme preference (before auth), onboarding completed    │
│    → Synced to DB after login                              │
└────────────────────────────────────────────────────────────┘
```

### Key Data Flows

1. **Mood Logging (write path):** Wizard collects 3 steps → validated on client → POST /api/entries → service creates entry → recalculate streak → check achievements → return { entry, newAchievements, streak } → React Query invalidates dashboard/history/chart queries → UI updates everywhere → toast fires for new achievements.

2. **Dashboard Load (read path):** Server component calls getDashboardStats(userId) → parallel Prisma queries (today's entry, recent 5 entries, KPI aggregates, current streak) → renders server HTML. QuickLog and streak bar are client islands that fetch their own data via hooks.

3. **Achievement Unlock (triggered path):** No separate unlock endpoint. Every entry mutation returns `newAchievements[]`. If non-empty, the client hook fires confetti + toast. The achievement service is side-effect-free — it queries counts and returns matches. Achievements are idempotent (already-unlocked ones are filtered out by checking the user_achievements join table).

4. **Chart Data (aggregation path):** Analytics page calls GET /api/analytics?range=30d → server runs aggregation queries (GROUP BY date, mood category count, AVG sleep, etc.) → returns pre-aggregated data → client renders charts. Aggregation on server avoids shipping raw rows to the client.

5. **Export (offline path):** User clicks "Export PDF" → POST /api/export/pdf with date range → server queries entries → generates PDF buffer (or streams CSV) → returns file download. Heavy work on server, client only shows download toast.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Monolith (Next.js + PostgreSQL). Single instance. Everything synchronous. |
| 1k-100k users | Add DB connection pooling (PgBouncer). Move PDF generation to a queue worker. Add Redis for session cache. |
| 100k+ users | Read replicas for analytics queries. Shard entries by user_id hash. Consider separating admin panel to its own instance. |

### Scaling Priorities

1. **First bottleneck — Analytics aggregation queries:** Running GROUP BY across all entries becomes slow. Mitigation: materialized views that refresh on entry write (or daily cron). Add composite indexes on (userId, date) and (userId, moodId).
2. **Second bottleneck — PDF generation:** Synchronous PDF generation blocks the API. Mitigation: offload to a queue (Bull/BullMQ with Redis), poll for completion, or generate on demand with a timeout.

## Anti-Patterns

### Anti-Pattern 1: Scattered Mood Colors

**What people do:** Defining mood category colors as inline Tailwind classes (`text-green-500`, `bg-amber-100`) across multiple components.

**Why it's wrong:** Violates the non-negotiable visual unification rule. One page updates a shade, another doesn't. Drift is inevitable.

**Do this instead:** Define all mood colors as CSS custom properties in `globals.css`:
```css
:root {
  --mood-positive-bg: #dcfce7;
  --mood-positive-text: #166534;
  --mood-positive-border: #22c55e;
  /* ... neutral, negative ... */
}
```
Every mood component references these variables. One source of truth.

### Anti-Pattern 2: Client-Side Streak Calculation

**What people do:** Fetching all entries to the client and calculating streaks/achievements in JavaScript.

**Why it's wrong:** Exposes all user data unnecessarily. Breaks if the user has thousands of entries. Achievement logic is duplicated or inconsistent between client and server.

**Do this instead:** Calculate streaks and achievements entirely on the server, triggered by entry mutations. The client only renders the result. The achievement service is the single source of truth.

### Anti-Pattern 3: Wizard Draft in Server State

**What people do:** Saving in-progress wizard form state to the database to "not lose user progress."

**Why it's wrong:** Creates orphaned drafts. Adds schema complexity. Wastes DB writes for incomplete entries.

**Do this instead:** Store wizard draft in Zustand (client memory) and optionally back it up to localStorage. Only persist to the database when the user completes all three steps and hits "Save."

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Google OAuth | Passport.js / NextAuth provider | Optional — toggleable in admin |
| GitHub OAuth | Passport.js / NextAuth provider | Optional — toggleable in admin |
| Email (password reset) | Resend / SendGrid SMTP | Transactional only, no marketing |
| Browser notifications | Web Push API (Service Worker) | For daily reminder feature |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| API Route ↔ Service | Direct function call | Routes import services — no HTTP between them |
| Service ↔ Prisma | Direct import | Services call Prisma client directly |
| Service → Gamification | Direct function call | Mood service calls achievement + streak services after writes |
| Server Component ↔ Data | Direct `prisma` call | Server components import services for initial page load |
| Client ↔ Server | HTTP (fetch via React Query) | All mutations and client-only reads go through API routes |
| Client State → UI | Zustand subscription | Only for pure UI state (modals, sidebar, wizard drafts) |

## Component Dependency Graph (Build Order)

```
Phase 1: Auth ─────────────────────────────────────────────────
  Auth pages, JWT middleware, user model, Prisma setup
  ↓ (everything depends on having a user)
Phase 2: Core Mood CRUD ──────────────────────────────────────
  Entry model, mood service, create/read/update/delete API
  Mood wizard component, quick log component
  ↓ (dashboard and history need data to show)
Phase 3: Dashboard + History ──────────────────────────────────
  Home page (greeting, KPIs, recent entries)
  Entry list with search/filter, entry detail dialog
  ↓ (charts and calendar need the same data)
Phase 4: Visualization ────────────────────────────────────────
  Calendar heatmap, analytics overview/trends/reflections
  Chart components, aggregation queries
  ↓ (gamification depends on entry counts and streaks)
Phase 5: Gamification ─────────────────────────────────────────
  Achievement engine, badge definitions, streak recalculation
  Confetti/toast system, progress bars
  ↓ (profile displays achievement data, admin needs user mgmt)
Phase 6: Profile + Admin ──────────────────────────────────────
  User settings page, admin dashboard, user management
  Invite code system, instance settings
  ↓ (export and peripheral features are leaf nodes)
Phase 7: Export + Peripheral ──────────────────────────────────
  PDF/CSV export, onboarding tour, feedback system
  Seed/test data toggle
  ↓
Phase 8: Theme + Polish ───────────────────────────────────────
  Theme system implementation, dark mode audit
  Visual unification pass, animation polish
```

---

*Architecture research for: Mood Diary / Journaling Web Application*
*Researched: 2026-07-06*
