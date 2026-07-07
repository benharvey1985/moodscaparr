<!-- generated-by: gsd-doc-writer -->

# Moodscaparr Architecture

## 1. Project Structure

```
Moodscaparr/
├── app/                          # Next.js App Router pages & API routes
│   ├── achievements/             # Achievements listing page
│   ├── admin/                    # Admin panel (users, SSO, invite codes)
│   ├── analytics/                # Analytics & trends page
│   ├── api/                      # All backend API route handlers
│   │   ├── achievements/         # Achievement retrieval & check endpoints
│   │   ├── admin/                # Admin-only CRUD (users, SSO, invite codes, settings)
│   │   ├── auth/                 # better-auth handler & invite validation
│   │   ├── feedback/             # Bug/feature feedback -> GitHub issues
│   │   ├── health/               # DB health check
│   │   ├── mood-entries/         # Mood entry CRUD, calendar, search
│   │   ├── seed/                 # Dev seed data endpoints
│   │   ├── stats/                # User dashboard stats
│   │   ├── streak/               # Streak computation
│   │   └── user/                 # Profile, data export/import, onboarding
│   ├── auth/                     # Auth pages (login, register, reset-password)
│   ├── calendar/                 # Calendar heatmap page
│   ├── dashboard/                # Main dashboard (landing after login)
│   ├── history/                  # Entry history with filters & search
│   ├── settings/                 # User settings (profile, data mgmt)
│   ├── wizard/                   # Multi-step mood entry wizard
│   ├── globals.css               # Tailwind v4 CSS
│   ├── layout.tsx                # Root layout (fonts, providers, theme)
│   └── page.tsx                  # Entry page (redirect to dashboard or login)
├── components/                   # React component library
│   ├── achievements/             # Achievement cards, list, unlock toast
│   ├── admin/                    # Admin dashboard, user table, SSO config, invite codes
│   ├── analytics/                # Overview, trends, reflections tabs
│   ├── calendar/                 # Heatmap, color legend, month stats
│   ├── feedback/                 # FAB, dialog, history
│   ├── history/                  # Entry list, search, filter, CSV export, detail dialog
│   ├── onboarding/               # Onboarding tour steps
│   ├── settings/                 # Profile form, achievement summary, data export/import, delete
│   ├── ui/                       # Primitives (shadcn/ui style): button, card, dialog, input, etc.
│   ├── wizard/                   # Wizard provider, step components (mood, context, reflection)
│   ├── entry-card.tsx            # Single mood entry display card
│   ├── header.tsx                # Navigation header with user menu & mobile drawer
│   ├── providers.tsx             # React Query provider
│   ├── quick-log.tsx             # One-click mood quick-log widget
│   ├── theme-provider.tsx        # next-themes provider
│   └── theme-toggle.tsx          # Dark/light toggle
├── hooks/                        # React Query hooks per domain
│   ├── use-achievements.ts       # Achievement queries & check mutation
│   ├── use-admin.ts              # Admin queries & mutations
│   ├── use-analytics.ts          # Analytics range query
│   ├── use-history.ts            # History pagination & search
│   ├── use-mood-entry.ts         # Entries CRUD with optimistic updates
│   ├── use-profile.ts            # Profile & settings
│   └── use-streak.ts             # Stats & streak queries
├── lib/                          # Shared utilities & server-side logic
│   ├── api/                      # Fetch-based API client functions
│   │   ├── achievements.ts
│   │   ├── admin.ts
│   │   ├── analytics.ts
│   │   ├── calendar.ts
│   │   ├── feedback.ts
│   │   ├── history.ts
│   │   ├── mood-entries.ts
│   │   ├── profile.ts
│   │   └── streak.ts
│   ├── achievements.ts           # Server-only achievement checking engine
│   ├── audit.ts                  # Structured audit logging
│   ├── auth-actions.ts           # Server-side auth helpers (getSession, requireAuth, requireAdmin)
│   ├── auth-client.ts            # Client-side better-auth client
│   ├── auth.ts                   # Server-side better-auth instance setup
│   ├── prisma.ts                 # Singleton Prisma client with pg adapter
│   ├── query-client.ts           # React Query client factory (SSR-safe)
│   ├── rate-limit.ts             # In-memory sliding window rate limiter
│   ├── stats.ts                  # Streak, average, balance computation
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
├── types/                        # TypeScript type definitions
│   ├── achievements.ts           # Achievement definitions & user achievement types
│   └── mood.ts                   # Mood categories, entry types, constants
├── prisma/                       # Database layer
│   ├── schema.prisma             # Full schema (11 models)
│   ├── seed.ts                   # Development data seeder
│   └── generated/prisma/         # Generated Prisma client (gitignored)
├── public/                       # Static assets (favicon, app icon)
├── scripts/                      # Standalone utility scripts
│   └── add-dummy-users.ts        # Bulk dummy user creation
├── docs/                         # Project documentation
├── proxy.ts                      # Next.js middleware (auth guard + security headers)
├── docker-compose.yml            # App + Postgres 16 services
├── Dockerfile                    # Multi-stage Docker build
├── entrypoint.sh                 # Container entrypoint (migrations + server)
├── prisma.config.ts              # Prisma ORM configuration
├── next.config.ts                # Next.js config (standalone output, CSP headers)
├── tsconfig.json                 # TypeScript config
├── components.json               # shadcn/ui configuration
└── package.json                  # Dependencies & scripts
```

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Framework** | Next.js 16.2.10 (App Router) | `output: "standalone"` for Docker |
| **UI Library** | React 19.2.4 | Server & client components |
| **Styling** | Tailwind CSS v4, `tw-animate-css` | CSS-only approach |
| **Components** | shadcn/ui + Base UI React 1.6 | Drawer from Base UI; primitives hand-written |
| **Auth** | better-auth 1.6.23 | Email/password + admin plugin |
| **Database** | PostgreSQL via Prisma 7.8 | `@prisma/adapter-pg` driver adapter |
| **Data Fetching** | TanStack React Query 5 | Optimistic updates, cache invalidation |
| **Forms** | react-hook-form + zod | Schema validation on client & server |
| **Charts** | Recharts 3.9 | Analytics dashboard |
| **Fonts** | Geist (Geist & Geist_Mono) | Via `next/font/google` |
| **Containerization** | Docker (Node 22-alpine + Postgres 16-alpine) | Multi-stage build |
| **Config** | Prisma Config API | `prisma.config.ts` with `defineConfig` |

**Key npm packages:** `better-auth`, `better-invite`, `@tanstack/react-query`, `prisma`, `recharts`, `lucide-react`, `date-fns`, `canvas-confetti`, `zod`, `react-hook-form`, `@hookform/resolvers`, `class-variance-authority`, `clsx`, `tailwind-merge`.

## 3. Key Architectural Patterns

### Authentication Flow

- **Server-side:** `lib/auth.ts` creates a `betterAuth` instance with Prisma adapter, email/password, and the `admin()` plugin.
- **Route handler:** `app/api/auth/[...all]/route.ts` delegates all auth requests (login, register, session, logout) to `toNextJsHandler(auth)`.
- **Client-side:** `lib/auth-client.ts` creates a client with `adminClient()` plugin.
- **Middleware guard:** `proxy.ts` guards `/dashboard/*`, `/wizard/*`, and `/admin/*` by checking the session before the page loads. For `/admin/*` it additionally checks `role === "admin"`.
- **Server components:** `lib/auth-actions.ts` provides `getServerSession()`, `requireAuth()`, and `requireAdmin()` using `auth.api.getSession()` with `next/headers`.

### API Route Structure

All API routes live under `app/api/` using the Next.js App Router file-based routing. Every protected route manually calls `auth.api.getSession({ headers: await headers() })` and returns 401/403 if unauthorized -- no shared middleware wrapper.

| Route | Methods | Auth | Purpose |
|---|---|---|---|
| `/api/auth/[...all]` | GET, POST | None | better-auth handler |
| `/api/auth/invite-status` | GET | None | Check invite-only mode |
| `/api/auth/validate-invite` | POST | None | Validate & consume invite code |
| `/api/mood-entries` | GET, POST | Required | List (50) or create entry |
| `/api/mood-entries/[id]` | GET, PUT, DELETE | Required + ownership | Single entry CRUD |
| `/api/mood-entries/calendar` | GET | Required | Entries by month |
| `/api/mood-entries/search` | GET | Required | Full-text search |
| `/api/stats` | GET | Required | Dashboard KPIs |
| `/api/streak` | GET | Required | Streak data |
| `/api/analytics` | GET | Required | Analytics with range (7d/30d/90d) |
| `/api/achievements` | GET | Required | Achievements with progress |
| `/api/achievements/check` | POST | Required | Re-check & unlock |
| `/api/user/profile` | GET, PUT | Required | Profile CRUD |
| `/api/user/export` | GET | Required | Full data export (JSON) |
| `/api/user/import` | POST | Required | Import entries (JSON) |
| `/api/user/onboarding-complete` | GET, PUT | Required | Onboarding state |
| `/api/admin/stats` | GET | Admin | Platform-wide analytics |
| `/api/admin/users` | GET | Admin | Paginated user list |
| `/api/admin/users/[id]` | PUT, DELETE | Admin | Update/delete user |
| `/api/admin/sso` | GET, PUT | Admin | Toggle SSO (Google, GitHub) |
| `/api/admin/invite-codes` | GET, POST | Admin | List & generate codes |
| `/api/admin/invite-codes/[id]` | DELETE | Admin | Revoke invite code |
| `/api/admin/settings/[key]` | GET, PUT | Admin | App settings CRUD |
| `/api/feedback` | POST | Required + rate-limited | Submit feedback -> GitHub issue |
| `/api/seed` | GET, POST, DELETE | Admin | Dev seed data |
| `/api/health` | GET | None | DB health check |

### Component Hierarchy

```
RootLayout (server)
  ThemeProvider (next-themes)
    Providers (React Query)
      Toaster
        [Page Content]
          AuthPages (login, register, reset-password)
          DashboardPage (client)
            Header (desktop nav, mobile drawer, theme toggle, user menu)
            KPI Cards (total, avg, streak, week)
            Streak Goal progress bar
            QuickLog widget
            Recent Entries (EntryCard list)
            DeleteDialog
            OnboardingTour
          WizardPage (server) -> WizardEdit (client)
            WizardProvider (context, localStorage drafts)
              StepMoodPicker / StepContext / StepReflection
          AnalyticsPage -> DateRangeFilter, OverviewTab, TrendsTab, ReflectionsTab
          CalendarPage -> CalendarHeatmap, ColorLegend, MonthStats
          HistoryPage -> SearchBar, FilterBar, EntryList, EntryDetailDialog, CSVExport
          AchievementsPage -> AchievementList, AchievementCard
          SettingsPage -> ProfileForm, AchievementSummary, DataExport, DataImport, DeleteAccount
          AdminPage -> AdminDashboard, UserTable+DetailDialog, SSOConfig, InviteCodes
          FABButton (feedback floating action)
```

### State Management

- **Server state:** TanStack React Query. Each domain has a hook file (`use-mood-entry.ts`, etc.) with query keys and mutations.
- **Optimistic updates:** `use-mood-entry.ts` mutations update the cache immediately and roll back on error.
- **Wizard form state:** React Context (`WizardProvider`) with localStorage draft persistence for crash recovery.
- **Auth state:** Fetched client-side via `authClient.getSession()` on mount, stored in local component state (no global store).
- **Theme state:** `next-themes` handles dark/light/system mode.

## 4. Database Schema Overview

11 models in `prisma/schema.prisma`:

```
user (1)----(N) session
  |---(N) account           (OAuth + password credentials)
  |---(N) MoodEntry         (core domain entity)
  |---(N) Achievement
  |---(1) UserProfile       (id = user.id, 1:1)

InviteCode              (relates by code string)
SsoProvider             (google/github toggle)
InviteConsumption       (email + code for invite-only)
AppSetting              (key-value store)
```

| Model | Key Fields | Purpose |
|---|---|---|
| `user` | id, name, email, role, banned | Core user (better-auth compatible) |
| `session` | id, userId, token, expiresAt | Auth sessions |
| `account` | id, userId, providerId, password, tokens | OAuth + email/password |
| `verification` | id, identifier, value, expiresAt | Email verification |
| `MoodEntry` | id, userId, category (enum), moodIndex (0-18), intensity (1-10), date, activities[], weather, sleep*, energyLevel, stressLevel, reflection1-4 | Core mood tracking. Indexed on (userId, date) and (userId, category) |
| `UserProfile` | id (=userId), name, country, timezone, streakGoal, onboardingComplete | Extended preferences |
| `SsoProvider` | id, provider (unique), enabled, clientId, clientSecret | SSO config |
| `InviteCode` | id, code (unique), maxUses, uses, expiresAt, createdBy, active | Registration invites |
| `InviteConsumption` | id, email (unique), code, createdAt | One-time use tracking |
| `AppSetting` | key (PK), value | Key-value settings |
| `Achievement` | id, userId, badgeId, unlockedAt, progress, maxProgress | Badge progress. Unique on (userId, badgeId) |

**MoodCategory enum:** `POSITIVE`, `NEUTRAL`, `NEGATIVE`

**Mood index mapping:** 19 moods across 3 categories (7 positive, 6 neutral, 6 negative), defined in `types/mood.ts` as `MOODS`.

## 5. How Auth Works

### better-auth Integration

Configured in `lib/auth.ts`:

```typescript
const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, autoSignIn: true },
  user: { deleteUser: { enabled: true } },
  plugins: [admin()],
  databaseHooks: { user: { create: { before: ... } } },
})
```

**Key details:**

1. **Database adapter:** Prisma adapter to PostgreSQL. The `user`, `session`, `account`, and `verification` models follow better-auth's expected schema exactly.

2. **Email/password auth:** Enabled with auto sign-in after registration. Passwords hashed and stored in `account.password`.

3. **Admin plugin:** Provides `role` field on user. The `adminClient()` plugin on the client adds `role` to session data.

4. **First-user escalation:** In `databaseHooks.user.create.before`, if no admin exists, the first registered user is auto-assigned the `admin` role.

5. **Invite-only gate:** If `AppSetting["invite_only"]` is `"true"`, user creation is blocked unless their email matches an `InviteConsumption` record (deleted after successful creation).

6. **Session cookies:** `httpOnly`, `sameSite: lax`, `secure` in production.

### Session Flow

- **Client-side:** `authClient.getSession()` on mount. If null, redirect to `/auth/login`.
- **Server-side:** API routes call `auth.api.getSession({ headers: await headers() })`. Server components use `requireAuth()` / `requireAdmin()`.
- **Middleware:** `proxy.ts` checks session on `/dashboard/*`, `/wizard/*`, `/admin/*` and redirects unauthenticated users.

## 6. Key Data Flows

### Mood Entry Creation

```
User clicks "Save" in wizard
  useCreateMoodEntry().mutateAsync(formData)

  1. OPTIMISTIC UPDATE (client)
     Insert temp entry into React Query cache

  2. POST /api/mood-entries
     - Validate session
     - Zod schema validation
     - prisma.moodEntry.create()
     - checkAndUnlockAchievements(userId)
       For each of 14 achievement definitions:
         Compute progress -> upsert Achievement record
     - Response: { entry, newlyUnlocked[] }

  3. SUCCESS PATH
     Replace optimistic entry
     Invalidate ["mood-entries"], ["stats"], ["history"]
     Clear wizard localStorage draft
     Show unlock toast for newlyUnlocked badges
     Redirect to /dashboard

  4. ERROR PATH
     Roll back optimistic update
     Show error in wizard
```

### Achievement Checking

14 badges across 4 categories defined in `types/achievements.ts`:

| Category | Badges | Computation |
|---|---|---|
| **milestone** | first-entry (1), double-digits (10), half-century (50), century (100) | `countEntries()` |
| **streak** | week-warrior (7), month-master (30), bimonthly (60), endurance (30 longest) | `getCurrentStreak()` / `getLongestStreak()` |
| **exploration** | mood-explorer (19), weather-watcher (7), activity-diver (5 in one), reflection-king (50) | `distinctMoods()`, `distinctWeathers()`, `maxActivitiesInOneEntry()`, `totalReflections()` |
| **special** | early-bird (before 9am), night-owl (after 10pm) | `hasEntryBeforeHour()` (timezone-aware) |

The engine in `lib/achievements.ts` (server-only, tagged with `"server-only"`) runs on every mood entry creation and on-demand via POST `/api/achievements/check`. It fetches existing records, computes progress for each definition, upserts records, and returns only newly-unlocked badges.

### Invite Code System

```
Admin generates code:
  POST /api/admin/invite-codes
    randomBytes(4).hex.toUpperCase()
    prisma.inviteCode.create()
    audit("admin.invite-code.create")

User registers:
  1. GET /api/auth/invite-status
     Read AppSetting["invite_only"] -> { inviteOnly: bool }

  2. POST /api/auth/validate-invite (if invite-only)
     Find InviteCode by code
     Validate: active, uses < maxUses, not expired
     Transaction:
       InviteCode.uses++
       InviteConsumption.create({ email, code })
     Return { valid: true }

  3. authClient.signUp.email()
     databaseHooks.user.create.before:
       If invite-only:
         Find InviteConsumption by email
         Block if not found
         Delete consumption record
       Return { data: user }
```

Key design: Two-phase validation -- invite is consumed in the client-side form before signup, with the `databaseHooks` re-checking as a server-side safeguard. Consumption uses `prisma.$transaction` for race-condition safety.

### Streak Computation

`lib/stats.ts` -> `computeStreak()` implements a "rest days allowed" model:

- Converts all entry dates to local timezone midnight
- Sorts descending
- Allows up to `restDaysAllowed` (default: 2) consecutive missing days while preserving the streak
- Returns both `current` and `longest` streak values
- Rendered on dashboard as a progress bar against the user's configurable `streakGoal`
