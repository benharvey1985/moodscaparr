# Project Research Summary: Docker Deployment for Moodscaparr

## Key Findings

### Stack & Architecture
- **Next.js standalone output** (`output: "standalone"` in next.config.ts) is the standard approach for Docker — traces dependencies and produces a ~200MB image vs 1GB+ without it
- **Multi-stage Dockerfile**: 3 stages (dependencies → builder → runner) with `node:20-alpine` base
- **docker-compose.yml**: 2 services (app + postgres:16-alpine) with health check, named volume, env file
- **Prisma in Docker**: Need to copy Prisma engine + CLI into runner stage for `prisma migrate deploy` on startup
- **Entrypoint pattern**: Script runs migrations before starting Next.js server

### Feature Expectations
- Single-command startup: `docker compose up`
- Persistent data via named volumes
- `.env.example` for configuration
- README with Docker instructions
- Health endpoint at `/api/health`

### Key Pitfalls to Address
1. Prisma engine missing in runner (must copy from builder)
2. Alpine needs `openssl` + `libc6-compat` for Prisma
3. `HOSTNAME=0.0.0.0` required (not localhost)
4. Must copy `public/` and `.next/static/` separately from standalone
5. DATABASE_URL uses service name `db`, not `localhost`
6. No build-arg secrets — runtime env only
7. RSC pre-render may fail at build time if pages call DB directly
8. Tailwind native binaries may be missed by trace

## Implications for Roadmap

### Phase Structure
**Single phase** should suffice (this is focused infrastructure work):

**Phase 4: Docker Deployment** — all Docker infrastructure in one phase

### Critical Ordering
1. Dockerfile + .dockerignore + entrypoint.sh
2. next.config.ts (standalone output)
3. docker-compose.yml with PostgreSQL
4. .env.example documentation
5. README update
6. Testing: build, start, migrate, verify data persists

## Sources
- Docker Docs: Containerize Next.js
- Next.js docs: output configuration
- Prisma docs: Docker deployment guide
- Community Docker Compose patterns for Next.js + Postgres
