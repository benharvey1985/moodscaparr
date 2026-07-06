# Context: Phase 1 — Foundation & Core Diary

**Phase:** 1 of 3
**Goal:** Users can securely access their accounts and log daily moods via a fast, consistent interface
**Auto-resolved:** All gray areas auto-selected and resolved via recommended defaults

## Purpose

Establish the foundational architecture, authentication system, visual design token system, theme support, and the core diary capability. This phase delivers a complete end-to-end mood logging experience that users can start using immediately.

## Scope

- **Authentication**: Email/password registration, login, session persistence, logout, password reset, admin auto-assignment, SSO groundwork, invite codes, role-based access
- **Core Diary**: 3-step mood wizard (19 moods × 3 categories × 1-10 intensity), context fields (activities, weather, sleep, energy, stress), 4 optional reflection prompts, progressive disclosure
- **Quick Log**: ≤3-tap mood logging from dashboard with sensible defaults
- **Edit & Delete**: Pre-filled wizard editing, delete with confirmation, permanent removal
- **Theme**: Light/dark/system support via next-themes, theme toggle in header
- **Visual Unification**: CSS custom property token system (3 categories × 3 intensity shades, dark mode variants), consistent card rounding tokens, single MoodSelector component
- **Seed Data**: Toggle to generate 60 days of sample entries

## Stack Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 16 + React 19 | Active LTS, Turbopack default, React Compiler for auto-memoization |
| Language | TypeScript 5.x | Type safety across the full stack |
| Auth Library | Better Auth | New-project default, plugins for SSO/roles/invite codes |
| Database | Neon PostgreSQL | Serverless, scale-to-zero, native Vercel integration |
| ORM | Prisma 7 | WASM engine, <100ms cold starts, typed SQL |
| CSS Framework | Tailwind CSS v4 | CSS-first configuration, native cascade layers |
| UI Library | shadcn/ui v4 | Accessible Radix UI primitives, CSS variable theming |
| Theme | next-themes | Light/dark/system with CSS variable swap |
| Forms | react-hook-form + Zod 4 | Uncontrolled form state, schema validation |
| Server State | TanStack Query 5 | Caching, background refetching, optimistic updates |
| Charts (Phase 2) | Recharts 3.9 | Declarative React charts (deferred to Phase 2 but stack decided) |
| Date Handling | date-fns 4 | Tree-shakeable, timezone-aware |
| Password Hashing | Better Auth built-in (Bcrypt/Argon2) | Handled by auth library |

## Key Architecture Decisions

### Auth Flow
- **Better Auth** with email/password as primary auth method
- Session cookie-based (httpOnly, secure, sameSite=strict)
- JWT stored in cookies, validated by middleware on every request
- First registered user gets admin role via a `afterAuth` hook
- SSO (Google, GitHub) toggles stored in DB config table, implemented in Phase 3 activation
- Invite code system: admin generates time-limited codes stored in DB, checked at registration

### Mood Data Model
```prisma
model MoodEntry {
  id          String   @id @default(cuid())
  userId      String
  category    MoodCategory // POSITIVE | NEUTRAL | NEGATIVE
  moodIndex   Int       // 0-18 (19 moods)
  intensity   Int       // 1-10
  date        DateTime  @db(Date)
  activities  String[]  // multi-select
  weather     String?
  sleepHours  Float?
  sleepQuality String?
  energyLevel Int?
  stressLevel Int?
  reflection1 String?   // "What went well?"
  reflection2 String?   // "What was challenging?"
  reflection3 String?   // "What are you grateful for?"
  reflection4 String?   // "What's on your mind?"
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Design Token System
- CSS custom properties in `globals.css` (not Tailwind config — enables theme swap)
- 3 categories × 3 intensity shades per category × light/dark variants = 18 variables
- Card rounding tokens: pill (24px), moderate (16px), standard (8px), slight (4px)
- Mood selector: single shared component, same grid + emoji size + hover animation everywhere
- Token naming: `--color-mood-positive-light`, `--color-mood-positive-medium`, `--color-mood-positive-dark` (and corresponding negative/neutral)

### Wizard Architecture
- **3-step progressive disclosure**: Step 1 (mood picker) is the primary screen
- Step 2 (context) and Step 3 (reflections) collapsed behind "Add more detail" button
- Client-side form state via react-hook-form + Zod validation
- Save-on-submit via TanStack Query mutation
- localStorage draft buffer to prevent data loss on accidental close

### Quick Log
- Rendered as a row/grid of 3 category buttons on dashboard
- Click category → show category's 6-7 moods → click mood → instant save
- Defaults: today's date, intensity=5, no context/reflections
- TanStack Query optimistic update for instant UI feedback

### Edit/Delete
- Edit: navigate to wizard with entry data pre-filled via react-hook-form `reset()`
- Delete: confirmation dialog via shadcn/ui AlertDialog
- Both: TanStack Query mutations with cache invalidation

### Theme
- next-themes with `ThemeProvider` at root layout
- 3 palettes defined as CSS variables: light, dark, system
- Theme toggle in header (shadcn/ui DropdownMenu)

## User Interface Decisions

[auto] **Auth pages**: Use shadcn/ui Card component with form layout — centered, responsive, minimal. Register, login, and password reset each get their own route.

[auto] **Wizard layout**: Full-page wizard with step indicator (progress bar + step labels). Step 1: mood grid (3 category columns × 6-7 moods each + intensity slider). Step 2: context chips + dropdowns. Step 3: 4 textareas for reflections.

[auto] **Quick Log placement**: Top of dashboard, primary action. Row of 3 category buttons → expands to grid of moods → save.

[auto] **Dashboard layout**: Greeting + status bar at top, Quick Log below, then KPI cards row, then recent entries list + streak bar.

[auto] **Color scheme**: Positive=green tones, Neutral=amber tones, Negative=red/pink tones.

[auto] **Card rounding**: Entry cards=pill, containers=moderate, stat cards=standard, minor containers=slight.

## Deferred Ideas

- Native mobile apps — responsive web covers Phase 1
- AI-powered insights — needs data volume, Phase 4+
- Social/sharing features — privacy concern, out of scope

---
*Decided: 2026-07-06 during auto-discuss*
*Ready for planning: yes*
