---
phase: 4
slug: docker-deployment
status: verified
threats_open: 0
asvs_level: 1
created: 2026-07-13
---

# Phase 4 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Docker image build | Multi-stage build: deps → builder → runner | Application code, node_modules, Prisma engine |
| Docker network | app ↔ db (internal network) | Database credentials, mood entries |
| Host network | app exposed on port 8080 | HTTP requests to Next.js app |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-01 | Dockerfile — Root user | Dockerfile | mitigate | `USER node` at line 55 | closed |
| T-02 | Dockerfile — Secrets in build layers | Dockerfile | mitigate | No secrets in final image; build args intermediate-only | closed |
| T-03 | .dockerignore — .env in image | .dockerignore | mitigate | `.env`, `.env.local`, `.env.production` excluded at lines 8–10 | closed |
| T-04 | docker-compose.yml — DB credentials | docker-compose.yml | mitigate | `change-me-in-production` placeholder; README production checklist | closed |
| T-05 | .env.example — Placeholder secrets | .env.example | mitigate | Template only; `.env` excluded; `change-me-in-production` signals required change | closed |
| T-06 | health/route.ts — ISR caching | health/route.ts | mitigate | `export const dynamic = "force-dynamic"` at line 4 | closed |
| T-07 | Dockerfile — Prisma engine missing | Dockerfile | mitigate | `COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma` at line 46 | closed |
| T-08 | Dockerfile — OpenSSL | Dockerfile | mitigate | `apk add openssl` at line 38 | closed |
| T-09 | .dockerignore — Build bloat | .dockerignore | mitigate | `node_modules`, `.next`, `.git` excluded | closed |
| T-10 | docker-compose.yml — DB port | docker-compose.yml | mitigate | No `ports` mapping on `db` service | closed |
| T-11 | docker-compose.yml — No TLS | docker-compose.yml | mitigate | README documents reverse proxy with TLS | closed |
| T-12 | .env.example — Wrong port | .env.example | mitigate | `http://localhost:8080` matches compose `8080:3000` | closed |
| T-13 | entrypoint.sh — Crash loop | entrypoint.sh | mitigate | fail-fast `exit 1` pattern; `restart: unless-stopped` | closed |
| T-14 | README.md — Secrets forgotten | README.md | mitigate | Production checklist; `change-me-in-production` naming | closed |
| T-15 | Dockerfile — NEXT_PUBLIC exposure | Dockerfile | mitigate | Not set as ARG/ENV; source code handles undefined | closed |
| T-16 | next.config.ts — standalone breaks dev | next.config.ts | mitigate | `next dev` ignores `output: "standalone"` | closed |
| T-17 | entrypoint.sh — Signal propagation | entrypoint.sh | mitigate | `exec node server.js` at line 14 | closed |
| T-18 | health/route.ts — Unauthenticated | health/route.ts | accept | No sensitive data exposed; middleware excludes `/api/health` | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-01 | T-18 | Health endpoint accessible without auth — exposes only status, timestamp, and DB connectivity. No user data. Middleware already excludes `/api/health`. | (pending) | 2026-07-13 |

*Accepted risks do not resurface in future audit runs.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-07-13 | 18 | 17 | 1 | gsd-security-auditor |
| 2026-07-13 | 1 | 1 | 0 | gsd-security-auditor (re-verify T-07) |

---

## Sign-Off

- [ ] All threats have a disposition (mitigate / accept / transfer)
- [ ] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-07-13
