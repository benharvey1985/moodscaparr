# Research: Phase 1 — Foundation & Core Diary

**Researched:** 2026-07-06
**Confidence:** HIGH (verified against docs and production setups)

---

## 1. Better Auth with Next.js 16 (Email/Password, Roles, Sessions)

### Core Setup

Better Auth runs inside your Next.js app against your own database. The production-grade setup uses:

- **Server instance** (`lib/auth.ts`) with Prisma adapter + Neon Postgres
- **Client instance** (`lib/auth-client.ts`) with typed React hooks
- **Session handling**: httpOnly cookies via `auth.api.getSession({ headers })` in server components/route handlers

```ts
// lib/auth.ts
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { admin } from "better-auth/plugins/admin"
import { invite } from "better-auth-invite-plugin"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  plugins: [
    admin({
      ac: undefined, // default RBAC
      roles: {
        user: { role: "user" },
        admin: { role: "admin" },
      },
      defaultRole: "user",
    }),
    invite({
      defaultRedirectAfterUpgrade: "/auth/invited",
    }),
  ],
})
```

```ts
// lib/auth-client.ts (client component)
import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { inviteClient } from "better-auth-invite-plugin/client"

export const authClient = createAuthClient({
  plugins: [adminClient(), inviteClient()],
})
```

### Key Patterns

| Concern | Approach |
|---------|----------|
| **Session in Server Components** | `const session = await auth.api.getSession({ headers: await headers() })` |
| **Session in Middleware** | `auth.api.getSession({ headers }); redirect if missing` |
| **Sign Up** | `authClient.signUp.email({ email, password, name })` |
| **Sign In** | `authClient.signIn.email({ email, password, rememberMe: true })` |
| **Admin auto-assignment** | First user check via `afterAuth` hook or a separate server check on first registration |
| **Rate limiting** | Better Auth has built-in rate limiting — turn it on after initial setup |

### Admin Plugin (Roles)

The admin plugin provides:
- `admin` and `user` role definitions
- Server-side `auth.api.hasPermission()` checks
- Client-side `authClient.admin` methods (ban, impersonate, list sessions)
- Role assignment via `updateUserRole`

### Invite Plugin

Third-party `better-auth-invite-plugin` (v0.4.1, Feb 2026):
- `authClient.invite.create({ role, maxUses, expiresAt })` — admin creates invite codes
- `authClient.invite.activate({ token })` — user activates invite
- Cookie-based: token saved in cookie, consumed on sign-up/sign-in
- Tracks creator, accepter, max uses, expiration

### Middeware Pattern

```ts
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default async function middleware(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/wizard/:path*"],
}
```

Sources: [better-auth.com/docs](https://better-auth.com/docs/integrations/next), [CREA.MBA production setup](https://crea.mba/en/blog/better-auth-starter-nextjs-16), [better-auth-invite-plugin](https://github.com/0-Sandy/better-auth-invite-plugin)

---

## 2. Prisma 7 Schema Patterns for Mood Entry Models

### Prisma 7 Key Differences from v6

| Change | Detail |
|--------|--------|
| **No `url` in schema datasource** | Connection configured via `prisma.config.ts` and the adapter |
| **Import path** | `from "./generated/prisma"`, not `from "@prisma/client"` |
| **Adapter required** | `@prisma/adapter-neon` bundles everything (no separate `@neondatabase/serverless`) |
| **WASM engine** | Pure-TypeScript + WASM, cold starts under 100ms |

### Neon Connection Setup

Two connection strings required:
- `DATABASE_URL` — pooled (for runtime, has `-pooler` in hostname, `?pgbouncer=true`)
- `DIRECT_URL` — direct (for `prisma migrate deploy` only, DDL bypasses PgBouncer)

```ts
// prisma.config.ts
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
})
```

```ts
// lib/prisma.ts
import { PrismaClient } from "./generated/prisma"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### Schema Design (Better Auth + Mood Entries)

Better Auth generates its own tables (`user`, `session`, `account`, `verification`) when you run `prisma migrate`. You extend with your own models:

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

enum MoodCategory {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

model MoodEntry {
  id           String       @id @default(cuid())
  userId       String
  category     MoodCategory
  moodIndex    Int          // 0-18 (index into 19-mood array)
  intensity    Int          // 1-10
  date         DateTime     @db(Date)
  activities   String[]     // multi-select PostgreSQL array
  weather      String?
  sleepHours   Float?
  sleepQuality String?
  energyLevel  Int?
  stressLevel  Int?
  reflection1  String?      // "What went well?"
  reflection2  String?      // "What was challenging?"
  reflection3  String?      // "What are you grateful for?"
  reflection4  String?      // "What's on your mind?"
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, date])
  @@index([userId, category])
}

// This model extends Better Auth's User for profile data
// Better Auth auto-creates User model — extend via optional one-to-one
model UserProfile {
  id        String   @id
  name      String?
  country   String?
  timezone  String   @default("UTC")
  streakGoal Int     @default(7)
  onboardingComplete Boolean @default(false)

  user User @relation(fields: [id], references: [id], onDelete: Cascade)
}
```

### Indexing Strategy

| Index | Rationale |
|-------|-----------|
| `@@index([userId, date])` | Primary query pattern: load entries for a user sorted by date |
| `@@index([userId, category])` | Quick category-based aggregation for dashboard |

### Deployment on Vercel

Add to `package.json`:
```json
{
  "postinstall": "prisma generate",
  "build": "prisma migrate deploy && next build"
}
```

Sources: [Neon docs — Prisma migrations](https://neon.com/docs/guides/prisma-migrations), [Prisma 7 setup with Neon](https://neon-next-delta.vercel.app/docs/guides/prisma), [Production migrations on Vercel](https://hassanr.com/blogs/prisma-migrations-production-nextjs-vercel.html)

---

## 3. shadcn/ui Form Patterns for Multi-Step Wizards

### Recommended Pattern: React Context + useForm + Per-Step Zod Validation

Based on multiple production examples (makerkit.dev, shadcn discussion #1869, community repos):

```tsx
// lib/mood-wizard-context.tsx
"use client"
import { createContext, useContext, useState, useCallback } from "react"
import { z } from "zod"

// Step schemas
export const step1Schema = z.object({
  category: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  moodIndex: z.number().min(0).max(18),
  intensity: z.number().min(1).max(10),
})

export const step2Schema = z.object({
  activities: z.array(z.string()).optional(),
  weather: z.string().optional(),
  sleepHours: z.number().optional(),
  sleepQuality: z.string().optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
})

export const step3Schema = z.object({
  reflection1: z.string().max(500).optional(),
  reflection2: z.string().max(500).optional(),
  reflection3: z.string().max(500).optional(),
  reflection4: z.string().max(500).optional(),
})

export const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema)

type WizardContextType = {
  step: number
  setStep: (step: number) => void
  formData: z.infer<typeof fullSchema>
  updateFormData: (data: Partial<z.infer<typeof fullSchema>>) => void
}

const WizardContext = createContext<WizardContextType | null>(null)

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<z.infer<typeof fullSchema>>({
    category: "NEUTRAL",
    moodIndex: 9,
    intensity: 5,
  })

  const updateFormData = useCallback((data: Partial<z.infer<typeof fullSchema>>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }, [])

  return (
    <WizardContext.Provider value={{ step, setStep, formData, updateFormData }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error("useWizard must be inside WizardProvider")
  return ctx
}
```

### Step Component Pattern

```tsx
// components/wizard/step-mood-picker.tsx
"use client"
import { useForm, UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { step1Schema, useWizard } from "@/lib/mood-wizard-context"
import { Form, FormField } from "@/components/ui/form"
import { Button } from "@/components/ui/button"

export function StepMoodPicker() {
  const { formData, updateFormData, setStep } = useWizard()

  const form = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      category: formData.category,
      moodIndex: formData.moodIndex,
      intensity: formData.intensity,
    },
  })

  function onSubmit(data: typeof step1Schema._type) {
    updateFormData(data)
    setStep(1) // advance to context step
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Mood grid: 3 columns × 6-7 moods each */}
        {/* Intensity slider: 1-10 */}
        <Button type="submit">Add More Detail</Button>
        <Button type="button" variant="ghost" onClick={() => {
          // Quick save with just mood + intensity
          updateFormData(form.getValues())
          // Trigger mutation
        }}>Save</Button>
      </form>
    </Form>
  )
}
```

### localStorage Draft Buffer

```tsx
// Sync form data to localStorage to prevent data loss
useEffect(() => {
  const subscription = form.watch((data) => {
    localStorage.setItem("mood-draft", JSON.stringify(data))
  })
  return () => subscription.unsubscribe()
}, [form.watch])

// Restore on mount
useEffect(() => {
  const saved = localStorage.getItem("mood-draft")
  if (saved) {
    form.reset(JSON.parse(saved))
  }
}, [])
```

### Pattern Options

| Approach | Pros | Cons |
|----------|------|------|
| **React Context** (recommended) | Simple, no extra deps, works with App Router | Manual type management |
| **URL search params** | Shareable state, back-button support | Serialization overhead |
| **Zustand** | Persisted state, devtools | Extra dependency for Phase 1 scope |

**Recommendation**: React Context for the wizard flow (3 steps, no back-button sharing needed). Use `FormProvider` from react-hook-form to pass form methods down.

Sources: [makerkit.dev multi-step forms](https://makerkit.dev/blog/tutorials/multi-step-forms-reactjs), [shadcn discussion #1869](https://github.com/shadcn-ui/ui/discussions/1869), [63r6o example repo](https://github.com/63r6o/shadcn-nextjs-multistep-form-example), [shadcn React Hook Form guide](https://ui.shadcn.com/docs/forms/react-hook-form)

---

## 4. CSS Custom Property Theming with next-themes + Tailwind v4

### Critical: `@theme inline` vs `@theme`

This is the **#1 gotcha in Tailwind v4 theming**. The `inline` keyword tells Tailwind to reference the CSS variable at runtime so `.dark` overrides apply. Plain `@theme` bakes the value at build time and dark mode silently breaks.

```css
/* globals.css */

/* --- Mood Category Tokens --- */
:root {
  /* Positive (green tones) */
  --color-mood-positive-light: oklch(0.85 0.13 145);
  --color-mood-positive-medium: oklch(0.62 0.19 145);
  --color-mood-positive-dark: oklch(0.38 0.12 145);

  /* Neutral (amber tones) */
  --color-mood-neutral-light: oklch(0.9 0.1 85);
  --color-mood-neutral-medium: oklch(0.72 0.16 85);
  --color-mood-neutral-dark: oklch(0.45 0.11 85);

  /* Negative (red/pink tones) */
  --color-mood-negative-light: oklch(0.85 0.13 25);
  --color-mood-negative-medium: oklch(0.6 0.2 25);
  --color-mood-negative-dark: oklch(0.35 0.14 25);

  /* Card rounding tokens */
  --radius-pill: 24px;
  --radius-moderate: 16px;
  --radius-standard: 8px;
  --radius-slight: 4px;
}

.dark {
  /* Positive — dark mode: maintain hue, adjust lightness for AA contrast */
  --color-mood-positive-light: oklch(0.75 0.15 145);
  --color-mood-positive-medium: oklch(0.52 0.2 145);
  --color-mood-positive-dark: oklch(0.3 0.14 145);

  /* Neutral — dark mode */
  --color-mood-neutral-light: oklch(0.8 0.12 85);
  --color-mood-neutral-medium: oklch(0.62 0.18 85);
  --color-mood-negative-dark: oklch(0.35 0.12 85);

  /* Negative — dark mode */
  --color-mood-negative-light: oklch(0.75 0.15 25);
  --color-mood-negative-medium: oklch(0.5 0.22 25);
  --color-mood-negative-dark: oklch(0.28 0.16 25);
}

/* Map to Tailwind v4 — @theme inline is critical */
@theme inline {
  --color-mood-positive-light: var(--color-mood-positive-light);
  --color-mood-positive-medium: var(--color-mood-positive-medium);
  --color-mood-positive-dark: var(--color-mood-positive-dark);
  --color-mood-neutral-light: var(--color-mood-neutral-light);
  --color-mood-neutral-medium: var(--color-mood-neutral-medium);
  --color-mood-neutral-dark: var(--color-mood-neutral-dark);
  --color-mood-negative-light: var(--color-mood-negative-light);
  --color-mood-negative-medium: var(--color-mood-negative-medium);
  --color-mood-negative-dark: var(--color-mood-negative-dark);
  --radius-pill: var(--radius-pill);
  --radius-moderate: var(--radius-moderate);
  --radius-standard: var(--radius-standard);
  --radius-slight: var(--radius-slight);
}
```

### next-themes Setup

```tsx
// components/theme-provider.tsx
"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
```

```tsx
// app/layout.tsx
import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Theme Toggle Component

```tsx
"use client"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sun, Moon, Monitor } from "lucide-react"

export function ThemeToggle() {
  const { setTheme } = useTheme()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### Usage in Components

```tsx
// Using mood color tokens
<div className="bg-mood-positive-light dark:bg-mood-positive-dark">
  {/* Card rounding tokens */}
  <Card className="rounded-[--radius-pill]">
```

### Key Rules

1. Always use `@theme inline` — not plain `@theme` — so `.dark` overrides apply at runtime
2. Define tokens in OKLCH for consistent lightness across themes
3. Use semantic tokens (`bg-mood-positive-medium`) not raw color values anywhere
4. Gate client-only theme reads with `suppressHydrationWarning` on `<html>` to prevent flash

Sources: [CREA.MBA — Next.js 16 + Tailwind v4 dark mode](https://crea.mba/en/blog/nextjs-16-tailwind-v4-dark-mode), [eveelin/tailwind-v4-theming-examples](https://github.com/eveelin/tailwind-v4-theming-examples), [Tailwind CSS v4 dark mode docs](https://tailwindcss.com/docs/dark-mode)

---

## 5. TanStack Query Mutation Patterns for Optimistic Updates

### Two Approaches

| Approach | When to Use |
|----------|-------------|
| **Via `mutation.variables`** | Simple lists — render pending state from mutation state directly |
| **Via cache manipulation** | Complex UIs — snapshots, rollback, shared cache |

### For Mood Logging: Cache Manipulation (Recommended)

Mood entries are displayed in multiple places (dashboard, history, calendar). Cache manipulation ensures all views update instantly and roll back on failure.

```tsx
// hooks/use-mood-entry.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createMoodEntry } from "@/lib/api/mood-entries"
import type { MoodEntry } from "@/types/mood"

export function useCreateMoodEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMoodEntry,

    // 1. Cancel any outgoing refetches + snapshot cache
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: ["mood-entries"] })

      const previous = queryClient.getQueryData<MoodEntry[]>(["mood-entries"])

      // Optimistically add to cache
      queryClient.setQueryData<MoodEntry[]>(["mood-entries"], (old) => {
        const optimisticEntry = {
          id: `temp-${crypto.randomUUID()}`,
          ...newEntry,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        return old ? [optimisticEntry, ...old] : [optimisticEntry]
      })

      return { previous } // passed to onError/onSettled
    },

    // 2. On error: rollback to snapshot
    onError: (_err, _newEntry, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["mood-entries"], context.previous)
      }
    },

    // 3. On settle: refetch to get server truth
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mood-entries"] })
    },
  })
}
```

### For Quick Log: via `mutation.variables` (Simpler)

The Quick Log is a single-action flow (tap mood → save). No list to manipulate — just show the pending state:

```tsx
// components/quick-log.tsx
"use client"
import { useMutation } from "@tanstack/react-query"

function QuickLogButton({ category }: { category: MoodCategory }) {
  const mutation = useMutation({
    mutationFn: () => quickLogMood(category, 5),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["mood-entries"] }),
  })

  return (
    <button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
      {mutation.isPending ? "Saving..." : category}
    </button>
  )
}
```

### For Edit/Delete

```tsx
// Edit entry
export function useUpdateMoodEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MoodEntry> }) =>
      updateMoodEntry(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["mood-entries"] })
      const previous = queryClient.getQueryData<MoodEntry[]>(["mood-entries"])

      queryClient.setQueryData<MoodEntry[]>(["mood-entries"], (old) =>
        old?.map((entry) => (entry.id === id ? { ...entry, ...data } : entry))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["mood-entries"], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["mood-entries"] }),
  })
}

// Delete entry
export function useDeleteMoodEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMoodEntry(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["mood-entries"] })
      const previous = queryClient.getQueryData<MoodEntry[]>(["mood-entries"])

      queryClient.setQueryData<MoodEntry[]>(["mood-entries"], (old) =>
        old?.filter((entry) => entry.id !== id)
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(["mood-entries"], context.previous)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["mood-entries"] }),
  })
}
```

### Query Key Convention

```ts
export const moodKeys = {
  all: ["mood-entries"] as const,
  byDate: (date: string) => ["mood-entries", "date", date] as const,
  byRange: (from: string, to: string) => ["mood-entries", "range", from, to] as const,
  latest: (userId: string) => ["mood-entries", "latest", userId] as const,
}
```

### TanStack Query + Next.js Server Components

- Server Components fetch data directly (no TanStack Query)
- TanStack Query lives in Client Components for mutations, optimistic updates, polling
- Use `HydrationBoundary` to hydrate query cache from server to avoid client waterfalls

```tsx
// app/dashboard/page.tsx (Server Component)
import { HydrationBoundary, dehydrate } from "@tanstack/react-query"
import { getQueryClient } from "@/lib/query-client"
import { moodKeys } from "@/hooks/use-mood-entry"
import { prisma } from "@/lib/prisma"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery({
    queryKey: moodKeys.all,
    queryFn: () => prisma.moodEntry.findMany({ orderBy: { date: "desc" }, take: 50 }),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  )
}
```

Sources: [TanStack Query v5 optimistic updates docs](https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates), [TanStack Query v5 + Next.js guide (2026)](https://noqta.tn/en/tutorials/tanstack-query-v5-nextjs-data-fetching-guide-2026), [Next.js App Router + TanStack Query v5 guidelines](https://skillhub.brabrix.com/items/rules-nextjs-tanstack-query-cursorrules-prompt-file), [Next.js App Router optimistic updates example](https://github.com/TanStack/query/pull/10997)

---

## 6. Seed Data Generator Pattern

Generate 60 days of sample entries via a Prisma seed script:

```ts
// prisma/seed.ts
import { PrismaClient } from "./generated/prisma"

const prisma = new PrismaClient()

const MOODS = {
  POSITIVE: ["ecstatic", "happy", "content", "hopeful", "grateful", "excited", "loved"],
  NEUTRAL: ["calm", "balanced", "indifferent", "thoughtful", "curious", "tired"],
  NEGATIVE: ["sad", "anxious", "angry", "frustrated", "lonely", "stressed"],
} as const

async function main() {
  // Check if seed has already run
  const existingCount = await prisma.moodEntry.count()
  if (existingCount > 0) {
    console.log("Seed data already exists — skipping")
    return
  }

  const users = await prisma.user.findMany()
  if (users.length === 0) {
    console.log("No users found — run seed after registration")
    return
  }

  const user = users[0]
  const entries = Array.from({ length: 60 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const categories = Object.keys(MOODS) as Array<keyof typeof MOODS>
    const category = categories[Math.floor(Math.random() * categories.length)]
    const moods = MOODS[category]
    const moodIndex = Math.floor(Math.random() * moods.length)
    const intensity = Math.floor(Math.random() * 10) + 1

    return {
      userId: user.id,
      category,
      moodIndex: Object.values(MOODS).flat().indexOf(moods[moodIndex]),
      intensity,
      date: date.toISOString().split("T")[0],
      activities: sample(ACTIVITIES, Math.floor(Math.random() * 3)),
      sleepHours: +(6 + Math.random() * 4).toFixed(1),
      energyLevel: Math.floor(Math.random() * 10) + 1,
      stressLevel: Math.floor(Math.random() * 10) + 1,
      reflection1: REFLECTIONS[Math.floor(Math.random() * REFLECTIONS.length)],
    }
  })

  await prisma.moodEntry.createMany({ data: entries })
  console.log(`Seeded ${entries.length} mood entries`)
}

function sample<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => 0.5 - Math.random()).slice(0, n)
}
```

Run with: `npx prisma db seed` (configure in `package.json` as `"prisma": { "seed": "tsx prisma/seed.ts" }`).

---

## Summary of Recommendations

| Area | Recommendation |
|------|---------------|
| **Auth** | Better Auth with Prisma adapter, `emailAndPassword` + `admin` plugin + `invite` plugin. First-user-admin via server check on registration |
| **Prisma 7** | No `url` in schema, use `prisma.config.ts` + `@prisma/adapter-neon`, two Neon URLs (pooled + direct) |
| **Wizard** | React Context for multi-step state, `useForm` + `zodResolver` per step, localStorage draft buffer |
| **Theming** | `@theme inline` (critical), OKLCH color space, 3 categories × 3 shades × light/dark = 18 CSS variables |
| **Optimistic Updates** | Cache manipulation with `onMutate`/`onError`/`onSettled` for mood list; `mutation.variables` for Quick Log |
| **Seed** | Prisma seed script with 60 days of generated entries, skips if data exists |

---

*Research completed: 2026-07-06*
*Ready for planning: yes*
