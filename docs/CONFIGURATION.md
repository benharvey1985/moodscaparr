<!-- generated-by: gsd-doc-writer -->

# Configuration

## 1. Environment Variables

Moodscaparr uses a `.env` file for Docker deployments and `.env.local` for local development. See `.env.example` for the reference template.

| Variable | Description | Default | Required |
|---|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string used at runtime by Prisma (via `@prisma/adapter-pg`). In Docker, connects to the `db` service. For local dev, points to a local Postgres instance. | `postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr` | Yes |
| `DIRECT_URL` | Direct (non-pooled) PostgreSQL connection string. Used by Prisma CLI for migrations (configured in `prisma.config.ts`). Should match `DATABASE_URL` unless using a connection-pooler like PgBouncer or Neon. | `postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr` | Yes |
| `BETTER_AUTH_SECRET` | Secret key for better-auth session signing and encryption. Generate with `openssl rand -hex 32`. | `change-me-in-production` | Yes |
| `BETTER_AUTH_URL` | The canonical URL of the deployment. Used by better-auth for redirects and callback URLs. | `http://localhost:8080` (Docker) / `http://localhost:3000` (local dev) | Yes |
| `NEXT_PUBLIC_GITHUB_REPO` | GitHub repository in `owner/repo` format. Used by the feedback form to create issues. | `benharvey1985/moodscaparr` | Yes |

### Environment files

| File | Purpose | Committed? |
|---|---|---|
| `.env` | Shared defaults (checked in). Used by Docker Compose. | Yes |
| `.env.local` | Local overrides (gitignored). Used for local development. | No |
| `.env.example` | Reference template documenting all variables. | Yes |

## 2. Docker Configuration

### `docker-compose.yml`

Two services:

- **`app`** — Builds from the `Dockerfile`, exposes port `8080:3000`, loads `.env`, depends on healthy `db` service. Build args `DATABASE_URL` and `DIRECT_URL` are passed from the host environment.
- **`db`** — `postgres:16-alpine` with user/password/database `moodscaparr`. Persistent volume `pgdata`. Health check via `pg_isready`. Restarts unless stopped.

### `Dockerfile`

Multi-stage build:

1. **`deps`** — `node:22-alpine`, installs production dependencies only (`npm ci --only=production`).
2. **`builder`** — Accepts `DATABASE_URL` and `DIRECT_URL` as build args, copies all source, runs `npm ci`, `npx prisma generate`, `npm run build`. Produces a Next.js standalone output.
3. **`runner`** — Minimal runtime image with `node:22-alpine` + `openssl` + `curl`. Copies standalone build, Prisma artifacts, and `entrypoint.sh`. Exposes port `3000`. Health check on `/api/health` every 30s. User is `node` (non-root).

### `entrypoint.sh`

Runs `npx prisma db push --accept-data-loss` to apply schema migrations at container start, then starts the Next.js server with `node server.js`.

## 3. Prisma Configuration

### Schema location

`prisma/schema.prisma` — single source of truth.

### `prisma.config.ts`

```ts
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),     // uses DIRECT_URL for CLI commands
  },
  migrations: {
    seed: "tsx prisma/seed.ts", // seed script
  },
})
```

Key points:
- Uses `DIRECT_URL` (not `DATABASE_URL`) for CLI operations — important when using a connection pooler.
- Seed script: `npx prisma db seed` runs `tsx prisma/seed.ts`.

### Prisma Client

Generated client output at `prisma/generated/prisma/`.

Client instantiated in `lib/prisma.ts`:
- Uses `@prisma/adapter-pg` (Prisma's built-in PostgreSQL driver adapter) with connection pooling (`max: 20`).
- Connection string comes from `DATABASE_URL`.
- Singleton pattern: reuses client in development to avoid too many connections.

### Prisma adapter (better-auth)

In `lib/auth.ts`, the better-auth database adapter is configured as:

```ts
database: prismaAdapter(prisma, { provider: "postgresql" })
```

### Data model (tables)

- **user** — Core auth user with roles (`admin`/`user`), ban support.
- **session** — Auth sessions.
- **account** — OAuth / password accounts.
- **verification** — Email verification tokens.
- **MoodEntry** — Daily mood logs with category (POSITIVE/NEUTRAL/NEGATIVE), intensity, activities, weather, sleep, energy, stress, reflections.
- **UserProfile** — Extended profile: timezone, streak goal, onboarding state.
- **SsoProvider** — SSO provider config (client ID/secret).
- **InviteCode** — Invite-only registration codes.
- **AppSetting** — Key-value store for app-wide settings (e.g., `invite_only`).
- **InviteConsumption** — Tracks which email used which invite code.
- **Achievement** — User badges/achievements with progress tracking.

## 4. Next.js Configuration

### `next.config.ts`

```ts
output: "standalone"                    // Docker-friendly standalone output
Content-Security-Policy headers applied  // strict CSP on all routes
```

CSP directives:
```
default-src 'self'
script-src 'self' 'unsafe-inline' 'unsafe-eval'
style-src 'self' 'unsafe-inline'
img-src 'self' data: blob:
font-src 'self'
connect-src 'self'
frame-ancestors 'none'
base-uri 'self'
form-action 'self'
```

### `proxy.ts` (middleware-like route matcher)

Exported as default from `proxy.ts` with matcher:
```
/dashboard/:path*
/wizard/:path*
/admin/:path*
```

Checks auth session, enforces admin role on `/admin`, and adds security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy).

## 5. better-auth Configuration

### `lib/auth.ts`

```ts
- Database: Prisma adapter (PostgreSQL)
- Auth methods: email/password (enabled, auto sign-in)
- User deletion: enabled
- Plugins: admin() plugin
- Hooks:
  - On user create: first user gets admin role. If `invite_only` is set, only users with a consumed invite can register.
- Session cookies:
  - secure in production, sameSite: lax, httpOnly: true
  - useSecureCookies: true in production
```

### `lib/auth-client.ts`

Client-side auth client with admin plugin.

### `lib/auth-actions.ts`

Server-only helpers:
- `getServerSession()` — gets current session from headers.
- `requireAuth()` — redirects to `/auth/login` if unauthenticated.
- `requireAdmin()` — redirects if user is not admin.

## 6. Other Configuration Files

### `tsconfig.json`

- Target: ES2017
- Module: ESNext with bundler resolution
- JSX: react-jsx
- Path alias: `@/*` → `./*`
- Strict mode enabled
- Includes Next.js plugin

### `eslint.config.mjs`

Uses `eslint-config-next` with `core-web-vitals` and `typescript` configs. Ignores `.next/`, `out/`, `build/`, `next-env.d.ts`.

### `postcss.config.mjs`

PostCSS plugin: `@tailwindcss/postcss`.

### `components.json` (shadcn/ui)

- Style: `base-nova`
- RSC: enabled
- CSS: `app/globals.css`
- Base color: neutral
- CSS variables: enabled
- Icons: lucide-react
- Aliases: `@/components`, `@/lib/utils`, `@/components/ui`

### `package.json`

Key dependencies:
- **Next.js** `^16.2.10`
- **React** `19.2.4`
- **better-auth** `^1.6.23` with `better-invite`
- **Prisma** `^7.8.0` with `@prisma/adapter-pg` + `pg`
- **shadcn** `^4.13.0` with Tailwind CSS v4
- **TanStack React Query** `^5.101.2`
- **recharts** `^3.9.2` (mood charts)
- **lucide-react** (icons)
- **date-fns** `^4.4.0` (dates)
- **react-hook-form** + **zod** + **@hookform/resolvers** (forms)
- **canvas-confetti** (celebrations)

### `.gitignore`

Ignores `node_modules`, `.next/`, `out/`, `.env*` (except `.env.example`), `.claude/`, `.vercel`, `*.tsbuildinfo`, `next-env.d.ts`.

### `.dockerignore`

Ignores `node_modules`, `.next`, `.env*`, `.git`, `.planning`, IDE files, OS files, logs.
