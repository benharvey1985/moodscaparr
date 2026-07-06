# Phase 4: Docker Deployment - Context

**Gathered:** 2026-07-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Dockerize the full Moodscaparr stack (Next.js app + Postgres 16) so anyone can self-host with a single `docker compose up` command. Data must persist across container updates. The deliverable is a Dockerfile, docker-compose.yml, entrypoint script, health endpoint, updated .env.example, and README docs.

13 requirements locked from REQUIREMENTS.md (DOCK-01 through DOCK-05, COMP-01 through COMP-04, CONF-01 through CONF-02, QUAL-01 through QUAL-02).

</domain>

<decisions>
## Implementation Decisions

### Entrypoint Script
- **D-01:** Shell script (not Node.js) — standard Docker pattern, simpler, no Node.js dependency at startup
- **D-02:** Fail-fast on migration errors — exit immediately if `prisma migrate deploy` fails; Docker restart policy handles retries
- **D-03:** Explicit error checks with clear echo messages — not `set -e`; each step checks exit code and prints descriptive messages to stdout
- **D-04:** Seed as separate step — document `docker exec` command, do not auto-seed on container start

### DB Configuration
- **D-05:** Single `.env.example` — default to Docker compose Postgres URL; document Neon cloud alternative as a comment
- **D-06:** Placeholder secret value in `.env.example` — pre-filled `change-me-in-production` works out of box for local testing; users replace for production
- **D-07:** Full config in `.env.example` — include all app env vars with Docker-appropriate defaults (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_GITHUB_REPO)
- **D-08:** Host port `8080:3000` — avoids conflict with local `npm run dev` on port 3000

### Claude's Discretion
- Multi-stage build optimization (Alpine, layer caching, image size vs rebuild speed)
- .dockerignore contents (follow DOCK-05 guidance)
- Health endpoint implementation details (where to create, what to check beyond DB)
- Docker Compose network config and service naming
- README structure and formatting

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Scope
- `.planning/REQUIREMENTS.md` §Docker Infrastructure, Compose, Configuration, Quality — All 13 v1.1 requirements mapped to this phase
- `.planning/ROADMAP.md` §Phase 4 — Phase goal, success criteria, and plan outline
- `.planning/PROJECT.md` — Project-level context, constraints, and milestone goal

### Codebase
- `next.config.ts` — No `output: "standalone"` yet; must be added for Docker multi-stage build
- `prisma.config.ts` — Uses `DIRECT_URL` env var for datasource
- `middleware.ts` — Auth middleware; must continue to work in Docker
- `.env.example` — Current Neon cloud URLs; must be updated for Docker compose Postgres
- `package.json` — Build/start scripts for the Dockerfile
- `.gitignore` — Existing patterns; .dockerignore should mirror + add Docker-specific excludes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing Docker infrastructure — this is pure greenfield containerization

### Established Patterns
- Prisma 7 with `@prisma/adapter-pg` (local Postgres) — Docker Postgres must use the same adapter (no Neon)
- Better Auth 1.6 with databaseHooks — no special Docker config needed
- CSP and security headers already configured in next.config.ts + middleware.ts — must verify they work in Docker
- `npm run build` currently uses default output — must enable `output: "standalone"` for Docker

### Integration Points
- Prisma migration will run in entrypoint via `prisma migrate deploy` at startup
- App connects to DB via `DATABASE_URL` and `DIRECT_URL` env vars — Docker compose will set both to the Postgres service
- Health endpoint needs to check DB connectivity via Prisma — must be added before Docker work completes

</code_context>

<specifics>
## Specific Ideas

- Entrypoint script with explicit error handling: `if ! prisma migrate deploy; then echo "Migration failed" >&2; exit 1; fi`
- Multi-stage Dockerfile: deps → builder → runner (Alpine, non-root node user)
- docker-compose.yml: app + postgres:16-alpine, named volume for pgdata, depends_on with health check
- Use `8080:3000` for host:container port mapping to avoid local dev conflicts

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 4-Docker Deployment*
*Context gathered: 2026-07-06*
