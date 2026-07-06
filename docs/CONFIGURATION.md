<!-- generated-by: gsd-doc-writer -->

# Configuration

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string used by Prisma at runtime. Example: `postgresql://user:password@localhost:5432/moodscaparr` |
| `DIRECT_URL` | Yes | — | PostgreSQL connection string used by Prisma for migrations (defined in `prisma.config.ts`). Can be the same as `DATABASE_URL` |
| `BETTER_AUTH_SECRET` | Yes | — | Secret key for signing auth session cookies. Generate with `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Yes | — | Base URL of the app. Example: `http://localhost:3000` for development |
| `NEXT_PUBLIC_GITHUB_REPO` | No | — | GitHub repo path for the feedback feature. Example: `user/moodscaparr`. Feedback creates GitHub issues |
| `NODE_ENV` | No | `development` | Controls secure cookie usage (`production` enables `secure` + `httpOnly` cookies) and Prisma client caching |

## Required vs Optional Settings

The following variables cause the application to fail on startup if missing:

- **`DATABASE_URL`** — validated in `lib/prisma.ts` (`throw new Error("DATABASE_URL environment variable is required")`)
- **`DIRECT_URL`** — validated by Prisma's `defineConfig` in `prisma.config.ts`
- **`BETTER_AUTH_SECRET`** — validated by Better Auth on startup
- **`BETTER_AUTH_URL`** — validated by Better Auth on startup

All other variables have defaults or are conditionally used:

- `NODE_ENV` defaults to `development` if unset
- `NEXT_PUBLIC_GITHUB_REPO` is optional — the feedback button works without it

## Per-Environment Overrides

The project follows the standard Next.js environment convention:

- **Development:** Create `.env.local` with your local Postgres URL and a generated auth secret. Example: `DATABASE_URL=postgresql://user:password@localhost:5432/moodscaparr`
- **Docker:** Use the provided `docker-compose.yml` which sets `DATABASE_URL` to point at the compose `postgres` service. The `.env.example` shows the Docker-compatible config
- **Production:** Set environment variables through your deployment platform's secret management system

## Config Files

- **`.env.example`** — Template file documenting all environment variables with placeholder values. Commit-safe — contains no secrets
- **`.env.local`** — Local development environment variables. Gitignored — do not commit
- **`prisma.config.ts`** — Prisma 7 configuration (schema path, datasource URL via `DIRECT_URL`, seed command)
- **`next.config.ts`** — Next.js configuration (Content-Security-Policy headers). No `output: "standalone"` currently set — will be added for Docker deployment

<!-- VERIFY: Production deployment environment variable values must be set in the deployment platform's secret manager -->
