# Phase 4: Docker Deployment - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-06
**Phase:** 4-Docker Deployment
**Areas discussed:** Entrypoint script, DB config duality

---

## Entrypoint Script

| Option | Description | Selected |
|--------|-------------|----------|
| Shell script | Standard Docker pattern, simpler, no Node.js dependency at startup | ✓ |
| Node.js script | Shares app logging/error patterns but requires Node boot before migrations | |

**User's choice:** Shell script
**Notes:** Standard Docker pattern preferred for simplicity.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Fail-fast | Exit on migration error, let Docker restart policy handle retries | ✓ |
| Fallback and start | Log warning but start server anyway with existing schema | |

**User's choice:** Fail-fast
**Notes:** Cleaner failure mode; container restarts via Docker policy.

---

| Option | Description | Selected |
|--------|-------------|----------|
| set -e + messages | Use set -e for auto-fail, wrap key steps with echo for visibility | |
| Explicit error checks | Check exit codes manually after each step, clearer failure messages | ✓ |

**User's choice:** Explicit error checks
**Notes:** More verbose but clearer failure messages in docker logs.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Separate step | Keep entrypoint focused on migrations; document seed as manual docker exec | ✓ |
| Seed on initialize | Auto-seed if DB is empty; convenient for first run | |

**User's choice:** Separate step
**Notes:** Entrypoint stays focused on migrations only.

---

## DB Config Duality

| Option | Description | Selected |
|--------|-------------|----------|
| Single .env.example | Default to Docker compose Postgres URL; document Neon alternative as comment | ✓ |
| Two .env templates | .env.example for Docker + .env.neon.example for cloud dev | |

**User's choice:** Single .env.example
**Notes:** Simpler approach with both configs documented.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Generation instruction | Comment with command to generate openssl secret; forces secure setup | |
| Placeholder value | Pre-filled placeholder that works for quick start | ✓ |

**User's choice:** Placeholder value
**Notes:** Works out of box for local testing; user replaces for production.

---

| Option | Description | Selected |
|--------|-------------|----------|
| Full config | Include all app env vars with Docker-appropriate defaults | ✓ |
| Minimal config | Only DATABASE_URL and BETTER_AUTH_SECRET | |

**User's choice:** Full config
**Notes:** Users can see everything at a glance.

---

| Option | Description | Selected |
|--------|-------------|----------|
| 3000:3000 | Standard Next.js port; must stop npm run dev first | |
| 8080:3000 | Avoids conflict with local dev; run both simultaneously | ✓ |

**User's choice:** 8080:3000
**Notes:** Allows running Docker and local dev side by side.

---

## Claude's Discretion

- Multi-stage build optimization (Alpine, layer caching, image size vs rebuild speed)
- .dockerignore contents
- Health endpoint implementation details
- Docker Compose network config and service naming
- README structure and formatting

## Deferred Ideas

None.
