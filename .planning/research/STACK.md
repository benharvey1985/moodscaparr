# Stack Research: Docker Deployment

## Stack Changes
- Add `output: "standalone"` to `next.config.ts` — enables Next.js standalone output mode (self-contained `.next/standalone` directory)
- No new npm packages required — Docker and Compose are infra, not app dependencies
- Prisma adapter stays `@prisma/adapter-pg` — Postgres runs in the same compose stack

## Dockerfile Pattern
- **Base image**: `node:20-alpine` (matches existing Node target, Alpine keeps image small)
- **3 stages**: dependencies → builder → runner
  - `dependencies`: `npm ci --frozen-lockfile` with cache mounts
  - `builder`: copy deps + source, `npm run build`
  - `runner`: copy `.next/standalone`, `public/`, `.next/static`, Prisma engine files
- **Alpine extras**: `openssl` + `libc6-compat` for Prisma engine compatibility
- **Port**: 3000, **Host**: `HOSTNAME=0.0.0.0`
- **User**: non-root `node` user for security
- **Entrypoint**: script that runs `prisma migrate deploy` before starting the server

## docker-compose.yml Pattern
- 2 services: `app` (build from Dockerfile) + `db` (postgres:16-alpine)
- Health check on db (`pg_isready`) with `depends_on: condition: service_healthy`
- Named volume `postgres_data` for persistence
- Environment variables from `.env` file
- Custom bridge network for inter-service communication

## Prisma in Docker
- Need `prisma` CLI and `@prisma/client` available at runtime for migrations
- Copy subset of `node_modules/prisma` and `node_modules/@prisma` to runner stage
- Entrypoint: `npx prisma migrate deploy && node server.js`
- Generate Prisma client during build (already part of build step)
- `DATABASE_URL` points to `postgres://moodscape:moodscape@db:5432/moodscape` (service name `db`, not `localhost`)

## .dockerignore
- `node_modules`, `.next`, `.git`, `.env`, `.env.local`, `*.md`, `.planning/`

## No-Go Items
- Do NOT pass DATABASE_URL as build arg (secrets leak into image layers)
- Do NOT use full `node_modules` in runner — use standalone output
- Do NOT skip health check on db — race condition on first start
