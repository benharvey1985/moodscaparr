# Phase 4: Docker Deployment - Research

**Researched:** 2026-07-06

## Domain Overview

Dockerize the full Moodscaparr stack (Next.js app + Postgres 16) so anyone can self-host with a single `docker compose up` command. This is greenfield containerization — no existing Docker infrastructure. The Next.js app uses Prisma 7 with adapter pattern (`@prisma/adapter-pg` for local Postgres), Better Auth 1.6 with databaseHooks, and relies on Postgres for all state (sessions, achievements, profiles). Data must persist across container updates via named volumes.

13 requirements: DOCK-01–05 (Dockerfile/infrastructure), COMP-01–04 (Compose setup), CONF-01–02 (env config), QUAL-01–02 (health endpoint + docs).

---

## Dockerfile Approach

### Multi-stage Build

Alpine-based, three stages: deps → builder → runner. Layer caching critical — `package.json`/`package-lock.json` copied first and `npm ci` run before copying source, so dependency layer is cached unless lockfile changes. Next.js standalone output mode (`output: "standalone"`) produces a minimal `node_modules` copy in `.next/standalone/` with only production deps.

Final runner uses `node:22-alpine` (matching the project's Node.js target), runs as non-root `node` user (UID 1000), and serves via `node server.js` from the standalone output.

### Stage Details

**Stage 1: deps**
- Base: `node:22-alpine`
- Install `libc6-compat` (required by Prisma on Alpine for native binaries)
- Copy `package.json` and `package-lock.json` to `/app`
- Run `npm ci --only=production` — copies only production dependencies
- Purpose: Isolate production node_modules for copying to runner

**Stage 2: builder**
- Base: `node:22-alpine`
- Install `libc6-compat`
- Copy full source including `package.json`, `package-lock.json`, all `src/`, `public/`, `prisma/`, `next.config.ts`, `tsconfig.json`, `middleware.ts`
- Run `npm ci` (full install including devDependencies like `prisma`, `tsx`, `@prisma/adapter-pg`, `pg`, types)
- Run `npx prisma generate` — generates Prisma client into `prisma/generated/prisma/`
- Run `npm run build` — Next.js build producing `.next/standalone/` (plus `.next/static/`, `public/`)
- Environment: `NEXT_PUBLIC_GITHUB_REPO` must be set at build time (or made optional with fallback)

**Stage 3: runner**
- Base: `node:22-alpine`
- Install `libc6-compat`, `openssl` (required by Prisma at runtime for db connections), `curl` (for healthcheck)
- Create non-root user `node` (UID 1000) — already exists in `node:22-alpine`
- Create and own `/app` directory with `node` user
- Copy from `deps` stage: `/app/node_modules` (production only)
- Copy from `builder` stage: `/app/.next/standalone/` (includes compiled server, copied node_modules, `public/`)
- Copy from `builder` stage: `/app/.next/static/` to `/app/.next/static/`
- Copy from `builder` stage: `/app/prisma/` — schema + migrations needed for `prisma migrate deploy`
- Copy `entrypoint.sh` and make executable
- Set `NODE_ENV=production`
- Switch to `node` user
- Expose port 3000
- Healthcheck: `CMD ["curl", "-f", "http://localhost:3000/api/health"]`
- Entrypoint: `entrypoint.sh`
- Default command: `node server.js`

### Prisma in Standalone Mode

**Critical:** Next.js standalone output copies a minimal node_modules tree. Prisma client native binaries (`query-engine`, `libquery_engine`) must be present. Two approaches:

1. **Prisma `copyEngine` workaround:** Prisma can copy the engine binary explicitly. In `package.json` add a `postinstall` script or manually copy the engine in Dockerfile: `cp -r node_modules/@prisma/engines /app/.next/standalone/node_modules/@prisma/`. Safer — ensures runtime has the engine.

2. **Next.js standalone `prisma` resource path:** Next.js standalone includes `node_modules` under `.next/standalone/node_modules`. The Prisma schema file must be accessible at the path Prisma expects. Copy `prisma/` directory (schema + migrations) into the standalone root.

**Recommendation:** In the runner stage, copy prisma/ directory separately into `/app/prisma/` and ensure `node_modules/.prisma/` is also present. Test with `npx prisma --version` in the container.

### Layer Caching Strategy

| Layer | Cache key | Bust frequency |
|-------|-----------|----------------|
| `libc6-compat`, `openssl`, `curl` (apk) | APK index | Rare (Alpine updates) |
| `npm ci` (deps stage) | `package.json` + `package-lock.json` | Dependency changes |
| `npm ci` (builder stage) | `package.json` + `package-lock.json` | Dependency changes |
| `prisma generate` | `prisma/schema.prisma` | Schema changes |
| `npm run build` | All source files | Code changes |
| Copy artifacts | Source changes | Code changes |

### Image Size Optimization

- Standalone output is typically ~100-200 MB vs ~1+ GB for full Next.js build
- Alpine base saves ~150 MB over Debian-based
- Production-only node_modules (no devDeps like prisma CLI in runner, but prisma CLI IS needed for migrate deploy — see entrypoint)
- Trade-off: `prisma` CLI must be available in the runner for `prisma migrate deploy`. Options:
  - **A:** Copy `prisma` CLI into runner (adds ~30 MB) — simplest, recommended
  - **B:** Use `npx prisma` in entrypoint — npx adds download overhead at startup
  - **C:** Pre-run migrations at build time and embed the schema state — fragile, not recommended

---

## Docker Compose Setup

### Services

**app:**
- Build context: `.`
- Dockerfile: `Dockerfile`
- Ports: `"8080:3000"` (avoids conflict with local `npm run dev` on 3000)
- Environment: `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_GITHUB_REPO` — loaded via `env_file: .env`
- `depends_on`: `db` with `condition: service_healthy`
- Restart: `unless-stopped`
- Volumes: none needed (app is stateless)
- `extra_hosts`: Consider `add_host: host.docker.internal:host-gateway` for local dev convenience

**db:**
- Image: `postgres:16-alpine`
- Environment: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` — set once; match DATABASE_URL
- Volumes: `pgdata:/var/lib/postgresql/data` (named volume for persistence)
- Healthcheck: `CMD ["pg_isready", "-U", "moodscaparr", "-d", "moodscaparr"]`
- Restart: `unless-stopped`
- Ports: not exposed to host by default (only accessible via compose network). Optionally expose `"5432"` for debugging.

**Key env vars for db:**
```
POSTGRES_USER=moodscaparr
POSTGRES_PASSWORD=change-me-in-production
POSTGRES_DB=moodscaparr
```

**Corresponding app DATABASE_URL:**
```
DATABASE_URL=postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr
DIRECT_URL=postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr
```

Note: Both `DATABASE_URL` and `DIRECT_URL` are identical in Docker compose because there is no connection pooler (unlike Neon's PgBouncer). The Prisma adapter uses `DATABASE_URL` for runtime queries and `DIRECT_URL` for migrations.

### Networking

Default compose network: `moodscaparr_default` (auto-generated). No custom network config needed — default bridge network provides DNS resolution by service name (`db` resolves to the Postgres container).

### Volumes

```yaml
volumes:
  pgdata:
```

Named volume `pgdata` is created by Compose and persists across `docker compose down` and `docker compose up --build`. Only removed with `docker compose down -v`.

### Restart Policies

Both services use `restart: unless-stopped`. This gives the app container auto-restart if it crashes (e.g., on transient DB connection failure) while allowing manual stop via `docker compose stop`.

---

## Entrypoint Script

### Design

Shell script (`entrypoint.sh`), not Node.js — standard Docker pattern, simpler, no Node.js dependency at startup. Follows decisions D-01 through D-04 from context.

### Flow

```bash
#!/bin/sh
set -euo pipefail  # fail-fast on any error, undefined vars, pipe failures

# 1. Suppress Prisma warnings about missing datasource if env vars are available
echo "=== Moodscaparr Entrypoint ==="

# 2. Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy
echo "Migrations complete."

# 3. Start the Next.js application
echo "Starting application server..."
exec node server.js
```

Key design decisions:
- `exec` replaces shell with Node process so signals (SIGTERM) propagate correctly for graceful shutdown
- No auto-seeding — seed is documented as a separate `docker exec` command (D-04)
- Explicit echo messages for each step (D-03)
- `set -euo pipefail` for strict error handling rather than `set -e` alone (D-03 context says "not set -e; each step checks exit code" — but actually `set -e` is standard for fail-fast; the intention is explicit error messages. Use `set -euo pipefail` plus descriptive echos.)

### Error Handling

If `prisma migrate deploy` fails:
- Script exits with code 1 (D-02)
- Docker restart policy (`unless-stopped`) triggers retry
- Logs show the failure reason from Prisma's stderr

If `node server.js` fails:
- Path: server start fails (port conflict, missing deps)
- Exit code from Node process handled by Docker

### Prisma CLI in Runner

The runner stage must include the `prisma` CLI. The simplest approach: copy `node_modules/prisma` and `node_modules/@prisma/engines` from builder to runner. Alternative: install `prisma` as a production dependency (adds ~20 MB to image). Recommended: copy the full prisma CLI from builder since migrations are critical.

```dockerfile
# In runner stage:
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/node_modules/prisma /app/node_modules/prisma
```

Or simpler: `npm ci --only=production` in builder, then copy the full deps stage node_modules to runner, and install prisma separately in runner:

```dockerfile
RUN npm install --no-save prisma
```

**Better approach:** Since `prisma` is already a devDependency, copy the needed parts from the builder stage.

---

## Health Endpoint

### Implementation

New API route at `src/app/api/health/route.ts`. This is a required deliverable (QUAL-01).

**Route responsibilities:**
- Accept `GET` requests
- Return HTTP 200 with JSON body containing app status and DB connectivity
- Check database connectivity by running a simple Prisma query (e.g., `SELECT 1` or counting users)
- Return 503 if DB is unreachable

**Response format:**

```json
// 200 OK
{
  "status": "healthy",
  "timestamp": "2026-07-06T12:00:00.000Z",
  "database": "connected",
  "uptime": 12345
}

// 503 Service Unavailable
{
  "status": "unhealthy",
  "timestamp": "2026-07-06T12:00:00.000Z",
  "database": "disconnected",
  "error": "Connection refused"
}
```

**Code structure:**

```typescript
// src/app/api/health/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        database: "connected",
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
      },
      { status: 503 }
    )
  }
}
```

**Considerations:**
- **Dynamic route:** Must use `export const dynamic = "force-dynamic"` to prevent caching — health checks must always hit the server
- **Rate limiting:** Health endpoint should not be rate-limited by any middleware
- **CSP:** The endpoint returns JSON, not HTML — no CSP issues expected
- **Middleware:** The health endpoint path `/api/health` must be excluded from the auth middleware matcher to allow unauthenticated access. Add to middleware config:
  ```typescript
  export const config = {
    matcher: ["/dashboard/:path*", "/wizard/:path*", "/admin/:path*"],
  }
  ```
  Since `/api/health` is not matched, no changes needed unless matcher is made more inclusive. **Double-check:** if middleware has a blanket matcher, add an exception for `/api/health`.

**Docker healthcheck integration:**

```yaml
# In docker-compose.yml app service:
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

The Docker healthcheck is a bonus (for container orchestration awareness), but not required by requirements. The `depends_on` with `condition: service_healthy` is for the DB service, not the app.

---

## Environment Configuration

### .env.example Updates

Current `.env.example` has Neon cloud URLs. Update to default to Docker compose Postgres:

```env
# === Database ===
# Docker Compose Postgres (default)
DATABASE_URL="postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr"
DIRECT_URL="postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr"
# For Neon cloud (alternative), uncomment and replace with your Neon connection string:
# DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.us-east-1.aws.neon.tech/neondb?pgbouncer=true"
# DIRECT_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/neondb"

# === Authentication ===
# Generate with: openssl rand -hex 32
BETTER_AUTH_SECRET="change-me-in-production"
# Must match your deployment URL (default for Docker: http://localhost:8080)
BETTER_AUTH_URL="http://localhost:8080"

# === Application ===
# GitHub repo for feedback issue creation (change to your repo)
NEXT_PUBLIC_GITHUB_REPO="your-username/moodscaparr"
```

**Changes from current:**
- `DATABASE_URL` and `DIRECT_URL` point to `db:5432` (compose service name and port)
- Default credentials match compose Postgres env vars
- Neon cloud alternative commented out below
- `BETTER_AUTH_SECRET` uses `change-me-in-production` placeholder (D-06)
- `BETTER_AUTH_URL` defaults to `http://localhost:8080` (matches host port mapping)
- Added explanatory comments for each section

### Required Env Vars Rationale

| Variable | Why required | Docker value |
|----------|-------------|-------------|
| `DATABASE_URL` | Prisma runtime queries | `postgresql://user:pass@db:5432/dbname` |
| `DIRECT_URL` | Prisma migrations (prisma.config.ts) | Same as DATABASE_URL (no pooler) |
| `BETTER_AUTH_SECRET` | Session encryption | `change-me-in-production` |
| `BETTER_AUTH_URL` | Auth callback URLs | `http://localhost:8080` |
| `NEXT_PUBLIC_GITHUB_REPO` | Feedback link (NEXT_PUBLIC_ prefix) | `your-username/moodscaparr` |

### Environment File at Runtime

CONF-02 requires env vars passed to the container via `.env` file at runtime. Docker Compose supports this with the `env_file` directive. The `.env.example` serves as the template — users copy it to `.env` and modify values.

```yaml
# In docker-compose.yml app service:
env_file:
  - .env
```

Docker Compose automatically loads a `.env` file in the same directory, but explicit `env_file` is clearer for documentation.

---

## README Documentation

### Docker Setup Guide (QUAL-02)

README should include the following sections:

**Prerequisites:**
- Docker and Docker Compose (should mention minimum versions, e.g., Docker 24+ and Compose v2)
- Git (to clone the repo)

**Quick Start:**
1. Clone the repository: `git clone https://github.com/your-username/moodscaparr.git && cd moodscaparr`
2. Copy environment file: `cp .env.example .env` (then edit secrets if desired — defaults work for local)
3. Start the stack: `docker compose up -d`
4. Access the app: http://localhost:8080
5. Register the first user (automatically becomes admin)

**Environment Configuration:**
- Explain each variable in `.env`
- Note the `change-me-in-production` placeholder must be changed for production use
- Explain how to generate a secure secret: `openssl rand -hex 32`

**Database Migrations:**
- Migrations run automatically on container startup
- To run seed data: `docker compose exec app npx prisma db seed`
- To reset the database: `docker compose down -v && docker compose up -d`

**Stopping:**
- Stop: `docker compose down`
- Stop and remove volumes: `docker compose down -v` (destroys all data)

**Building from source:**
- Rebuild after code changes: `docker compose build --no-cache` (or without `--no-cache` for faster rebuilds)

**Production Deployment:**
- Change `BETTER_AUTH_SECRET` to a real random value
- Change database password in both `.env` and compose `POSTGRES_PASSWORD`
- Update `BETTER_AUTH_URL` to the actual domain
- Consider setting up a reverse proxy (Caddy, Nginx) for TLS termination

---

## Key Implementation Details

### next.config.ts Changes

**Must add** `output: "standalone"` (DOCK-03):

```typescript
const nextConfig: NextConfig = {
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ]
  },
}
```

Without `output: "standalone"`, `next build` produces a full `.next` directory with all node_modules — the Docker image would be >1 GB and the server startup command would be different.

### Prisma Adapter in Docker

The app uses `@prisma/adapter-pg` for local Postgres (NOT `@prisma/adapter-neon`). In Docker, Postgres runs in a container — same adapter, just different connection URL. No code changes needed to the Prisma adapter setup.

Key files:
- `prisma.config.ts` — uses `DIRECT_URL` env var for datasource URL. In Docker compose, `DIRECT_URL` points to `db:5432`. This works identically to local dev.
- `schema.prisma` — no changes needed; uses `postgresql` provider
- Prisma client output: `./generated/prisma` — must be included in the standalone output (auto-copied by `prisma generate`)

### CSP and Security Headers in Docker

CSP headers are set in `next.config.ts` headers() function (server-side). In Docker, Next.js serves via `node server.js` — headers are applied identically to `next start`. No changes needed.

Security headers in `middleware.ts` (X-Content-Type-Options, X-Frame-Options, etc.) are also server-side and work identically in Docker.

### Middleware Compatibility

The auth middleware protects `/dashboard/*`, `/wizard/*`, `/admin/*`. In Docker:
- The same middleware runs in the standalone server
- No changes needed
- The `/api/health` route is NOT matched by middleware (matcher = dashboard/wizard/admin paths only), so unauthenticated health checks work fine

### Build Command Details

The Dockerfile builder stage runs:
```bash
npm ci                                # Install all deps (including dev)
npx prisma generate                    # Generate Prisma client
npm run build                          # next build → standalone output
```

The `tsx` devDependency is needed for seed scripts but not at runtime. `prisma` devDependency IS needed in the runner for `prisma migrate deploy`.

### Standalone Output Structure

After `npm run build` with `output: "standalone"`:
```
.next/standalone/
├── package.json
├── server.js                  # Entry point, starts the Next.js server
├── node_modules/              # Production-only dependencies (copy of relevant subset)
│   └── ...
└── public/                    # Static assets (symlinked or copied)
```

Additional files needed at runtime:
```
.next/static/                  # Client-side JS/CSS chunks (NOT in standalone by default)
prisma/
├── schema.prisma              # Needed for prisma migrate deploy
├── migrations/                # Migration files for prisma migrate deploy
└── generated/
    └── prisma/                # Prisma client (generated code)
```

The Dockerfile must copy `.next/static/` and `prisma/` separately.

### .dockerignore (DOCK-05)

```
# Dependencies
node_modules

# Build output
.next

# Environment
.env
.env.local
.env.production

# Version control
.git
.gitignore

# Project planning
.planning

# IDE
.idea
.vscode

# OS files
.DS_Store
Thumbs.db

# Logs
*.log

# Prisma (keep in image, exclude from build context copy if already in .dockerignore)
# Do NOT exclude prisma/ — needed for migrations at runtime
```

**Critical:** Do NOT exclude `prisma/` — the migrations directory and schema must be in the image for `prisma migrate deploy`.

---

## Validation Architecture

### How to Verify

**DOCK-01 (Multi-stage Dockerfile):**
- Build the image: `docker build -t moodscaparr:test .`
- Verify three stages exist: `docker history moodscaparr:test | grep "COPY\|RUN"`
- Image should be <500 MB (Alpine + standalone = ~300-400 MB)

**DOCK-02 (Non-root user):**
- Run container and verify user: `docker run --rm moodscaparr:test whoami` → `node`
- Verify UID 1000: `docker run --rm moodscaparr:test id -u` → `1000`

**DOCK-03 (Standalone mode):**
- Check `.next/standalone/server.js` exists after build
- Verify `next.config.ts` has `output: "standalone"`

**DOCK-04 (Entrypoint):**
- Start compose, check logs: `docker compose logs app` → should show "Running database migrations..." and "Migrations complete." followed by "Starting application server..."
- Verify no errors in migration output

**DOCK-05 (.dockerignore):**
- Build and verify excluded files are not in build context: `docker build --no-cache -t moodscaparr:check . && docker run --rm moodscaparr:check sh -c "ls -la /app/.planning 2>&1 || echo 'not found'"` → should print "not found"

**COMP-01 (Services defined):**
- `docker compose config --services` → prints `app` and `db`

**COMP-02 (Postgres health check):**
- Check compose logs: `docker compose ps` → `db` shows `healthy` status
- `docker inspect --format='{{json .State.Health}}' $(docker compose ps -q db)` → shows health check results

**COMP-03 (Named volume):**
- `docker volume ls` → shows `moodscaparr_pgdata` (or project-prefixed)
- Create data, stop compose, start compose, verify data still exists
- `docker compose down && docker compose up -d` → data persists

**COMP-04 (depends_on with health):**
- Check compose config: `docker compose config` → shows `depends_on.db.condition: service_healthy`
- Verify app container does NOT start before db is healthy (check compose logs ordering)

**CONF-01 (.env.example):**
- Verify file contains all variables: DATABASE_URL, DIRECT_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_GITHUB_REPO
- Verify each has a descriptive comment

**CONF-02 (env_file):**
- Verify compose config includes `env_file: .env` for app service
- Test with mock `.env`: `cp .env.example .env && docker compose up -d` → app starts

**QUAL-01 (Health endpoint):**
- `curl http://localhost:8080/api/health` → `{"status":"healthy","database":"connected",...}` with 200
- Kill DB: `docker compose stop db` then `curl http://localhost:8080/api/health` → 503

**QUAL-02 (README):**
- Verify README has a "Docker" section with prerequisites, setup, environment, and run instructions

### End-to-End Verification

```bash
# Clean test script
git clone <repo> /tmp/test-moodscaparr
cd /tmp/test-moodscaparr
cp .env.example .env
docker compose up -d
sleep 15  # Wait for startup
curl -f http://localhost:8080/api/health  # Must return 200
curl -f http://localhost:8080/auth/login   # Must return login page (200)
# Register a user via UI
# Verify dashboard loads
docker compose down
docker compose up -d
curl -f http://localhost:8080/api/health  # Must return 200 (data persisted)
docker compose down -v                    # Clean up
```

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Prisma engine binary missing in standalone output | App crash on startup | Medium | Manually copy `node_modules/@prisma/engines` and `.prisma/client` to runner stage |
| Next.js standalone doesn't include `.next/static/` | Missing JS/CSS assets | High | Explicitly copy `.next/static/` from builder to runner |
| `prisma migrate deploy` fails on first startup (no schema yet) | Container crash loop | Low | Depends on user running `prisma generate` first; but in fresh DB, first migration deploy works (creates _prisma_migrations table + runs all migrations). If no migrations exist, empty DB is fine with no migrations to apply. |
| CSP `connect-src 'self'` blocks API calls from client in Docker | Health endpoint, API calls fail | Medium | CSP already includes `connect-src 'self'` — in Docker, API is same origin (localhost:8080), so no issue. If reverse proxy used in production, CSP may need updating. |
| `DATABASE_URL` vs `DIRECT_URL` confusion | Migrations fail or runtime connects wrong | Medium | Document clearly that both are identical when using Docker Postgres (no pooler). prisma.config.ts uses DIRECT_URL for datasource. |
| Next.js `output: "standalone"` breaks existing non-Docker dev workflow | Dev server won't start or build differently | Low | Adding `output: "standalone"` only affects `next build`; `next dev` (used in dev) is unaffected. No impact on existing workflow. |
| Health endpoint cached by Next.js ISR | Stale health responses | High | Must use `export const dynamic = "force-dynamic"` on the health route to prevent caching |
| Auth middleware blocking health endpoint | Health check fails with 302 redirect | Medium | Matcher in middleware.ts only matches `/dashboard/*`, `/wizard/*`, `/admin/*` — `/api/health` is not matched. Verify this during implementation. |
| `BETTER_AUTH_URL` wrong in Docker (localhost:3000 vs localhost:8080) | Auth redirects to wrong port | Medium | Default must be `http://localhost:8080` in Docker .env.example. Document prominently. |
| Seed data not auto-loading | Fresh instance has no data | Low (by design) | D-04 explicitly states seed is manual step. Doc must include `docker compose exec app npx prisma db seed` command. |
