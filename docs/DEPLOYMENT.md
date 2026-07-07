<!-- generated-by: gsd-doc-writer -->

# Deployment Guide

## Overview

Moodscaparr is a Next.js application with a PostgreSQL database, containerised with Docker. The deployment consists of two services:

| Service | Image | Purpose |
|---------|-------|---------|
| `app` | `node:22-alpine` (multi-stage) | Next.js standalone server + API |
| `db` | `postgres:16-alpine` | PostgreSQL database |

---

## Prerequisites

- Docker & Docker Compose (v2+)
- `openssl` (to generate auth secrets)
- A terminal with `curl` (for health checks)

---

## Environment Setup

Copy the example env file and modify the values:

```bash
cp .env.example .env
```

### Required Variables

| Variable | Description | Default (dev) |
|----------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string (from app to db) | `postgresql://moodscaprr:change-me-in-production@db:5432/moodscaparr` |
| `DIRECT_URL` | Direct (non-pooled) connection string | Same as above (use Neon-style for serverless) |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth — generate with `openssl rand -hex 32` | `change-me-in-production` |
| `BETTER_AUTH_URL` | Public URL of the deployed app | `http://localhost:8080` |
| `NEXT_PUBLIC_GITHUB_REPO` | GitHub repo for feedback issue links | `benharvey1985/moodscaparr` |

### Database URLs Explained

**Local Docker (default):**
```
DATABASE_URL="postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr"
DIRECT_URL="postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr"
```

**Neon / Serverless (alternative):**
```
DATABASE_URL="postgresql://user:password@ep-xxxx-pooler.us-east-1.aws.neon.tech/neondb?pgbouncer=true"
DIRECT_URL="postgresql://user:password@ep-xxxx.us-east-1.aws.neon.tech/neondb"
```

> `DATABASE_URL` points to a PgBouncer-compatible pooled connection. `DIRECT_URL` bypasses the pooler for migrations.

---

## Docker Deployment

### Build & Run

```bash
docker compose up --build -d
```

This starts both `app` and `db` containers. The `app` service waits for the database health check to pass before starting.

### What Happens on Startup

1. Docker Compose starts the PostgreSQL container with a health check (`pg_isready`).
2. Once the database is healthy, the `entrypoint.sh` script runs inside the app container:
   - Applies pending migrations via `npx prisma db push --accept-data-loss`
   - Starts the Next.js standalone server (`node server.js`)
3. Docker's built-in `HEALTHCHECK` pings `http://localhost:3000/api/health` every 30s.

### Stop

```bash
docker compose down
```

To also remove the database volume:

```bash
docker compose down -v
```

### Rebuild After Changes

```bash
docker compose build --no-cache app
docker compose up -d
```

---

## Multi-stage Dockerfile

The `Dockerfile` uses three stages:

| Stage | Base Image | Purpose |
|-------|-----------|---------|
| `deps` | `node:22-alpine` | Install production dependencies (`npm ci --only=production`) |
| `builder` | `node:22-alpine` | Install all deps, generate Prisma client, run `next build` to produce `.next/standalone` |
| `runner` | `node:22-alpine` | Copy standalone build, Prisma artifacts, and `entrypoint.sh`; set `NODE_ENV=production` |

The `output: "standalone"` config (in `next.config.ts`) produces a self-contained `server.js` that includes all runtime dependencies, so only `node_modules` from `deps` and the Prisma runtime are needed at runtime.

---

## Docker Compose Configuration

```yaml
services:
  app:
    build:
      context: .
      args:
        DATABASE_URL: "${DATABASE_URL}"
        DIRECT_URL: "${DIRECT_URL}"
    ports:
      - "8080:3000"          # host:container
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: moodscaparr
      POSTGRES_PASSWORD: change-me-in-production
      POSTGRES_DB: moodscaparr
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "moodscaparr", "-d", "moodscaparr"]
    restart: unless-stopped

volumes:
  pgdata:
```

---

## Development Mode

### Without Docker

```bash
# 1. Install dependencies
npm install

# 2. Set up .env (point to a local or remote Postgres)
cp .env.example .env

# 3. Generate Prisma client and run migrations
npx prisma generate
npx prisma db push

# 4. (Optional) Seed demo data
npx tsx prisma/seed.ts

# 5. Start dev server
npm run dev
```

The app is available at `http://localhost:3000`.

### Database Migrations & Seeding

| Command | Purpose |
|---------|---------|
| `npx prisma generate` | Regenerate the Prisma client after schema changes |
| `npx prisma db push` | Push schema changes to the database (migrate) |
| `npx prisma db push --accept-data-loss` | Force push (used in entrypoint for simplicity) |
| `npx tsx prisma/seed.ts` | Seed 60 days of demo mood entries for the admin user |

The seed script (`prisma/seed.ts`) creates 60 days of mood entries for the first user with the `admin` role. It is idempotent — if entries already exist, it skips seeding.

> In Docker, the entrypoint runs `prisma db push --accept-data-loss` automatically on each container start. The seed script must be run manually if desired.

---

## Health Check

**Endpoint:** `GET /api/health`

**Responses:**

```json
// 200 — Healthy
{
  "status": "healthy",
  "timestamp": "2026-07-07T12:00:00.000Z",
  "database": "connected"
}

// 503 — Unhealthy
{
  "status": "unhealthy",
  "timestamp": "2026-07-07T12:00:00.000Z",
  "database": "disconnected"
}
```

The endpoint runs `SELECT 1` against the database to verify connectivity. Docker's built-in `HEALTHCHECK` uses `curl -f http://localhost:3000/api/health` inside the container.

---

## Port Mapping

| Environment | Host Port | Container Port |
|-------------|-----------|---------------|
| Docker Compose | `8080` | `3000` |
| Dev (`npm run dev`) | `3000` | `3000` |

To change the Docker host port, edit `docker-compose.yml`:

```yaml
ports:
  - "9000:3000"   # app available on host port 9000
```

---

## Production Considerations

- **Secrets:** Change `BETTER_AUTH_SECRET` and `POSTGRES_PASSWORD` before deploying.
- **Database persistence:** The `pgdata` volume persists data across restarts. For production, consider using a managed Postgres (RDS, Neon, etc.) and configure the URLs in `.env`.
- **Standalone mode:** The Dockerfile builds with `next build` which outputs to `.next/standalone`. The runner stage copies only the necessary files — no source code is present at runtime.
- **Health checks:** Both Docker (`HEALTHCHECK`) and Docker Compose (`condition: service_healthy`) ensure the app only receives traffic when ready.
