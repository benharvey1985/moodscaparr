# Requirements: Moodscaparr

**Defined:** 2026-07-06
**Core Value:** Make mood tracking effortless enough to do daily, rewarding enough to sustain as a habit, and insightful enough to reveal personal emotional patterns.

## v1.1 Requirements

Requirements for milestone v1.1 (Docker Deployment). Each maps to roadmap phases.

### Docker Infrastructure

- [ ] **DOCK-01**: Multi-stage Dockerfile with dependencies, build, and runner stages using Alpine base
- [ ] **DOCK-02**: Runner stage runs as non-root node user for security
- [ ] **DOCK-03**: Next.js standalone output mode enabled in next.config.ts
- [ ] **DOCK-04**: Entrypoint script runs `prisma migrate deploy` before starting the server
- [ ] **DOCK-05**: .dockerignore excludes node_modules, .next, .git, .env files, and .planning

### Compose

- [ ] **COMP-01**: docker-compose.yml defines app + postgres:16-alpine services
- [ ] **COMP-02**: Postgres health check (pg_isready) with app waiting for healthy db
- [ ] **COMP-03**: Named volume for Postgres data that persists across container restarts/updates
- [ ] **COMP-04**: App container uses depends_on with service_healthy condition

### Configuration

- [ ] **CONF-01**: .env.example documents all required environment variables with descriptions
- [ ] **CONF-02**: Environment variables passed to container via .env file at runtime

### Quality & Documentation

- [ ] **QUAL-01**: /api/health endpoint returns 200 with app + database connectivity status
- [ ] **QUAL-02**: README updated with Docker prerequisites, setup, and run instructions

## v2 Requirements

(None deferred — this milestone covers the full Docker scope.)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud deployment (Vercel, Railway) | Docker self-hosting only — cloud deploy deferred to future milestone |
| Docker Compose dev mode (hot reload) | Not needed for deployment use case; dev can use existing `npm run dev` |
| CI/CD pipeline | Out of scope for this milestone — image building is manual |
| Docker Compose for production orchestration (Swarm/K8s) | Single-host Docker Compose is sufficient for self-hosting |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DOCK-01 | Phase 4 | Pending |
| DOCK-02 | Phase 4 | Pending |
| DOCK-03 | Phase 4 | Pending |
| DOCK-04 | Phase 4 | Pending |
| DOCK-05 | Phase 4 | Pending |
| COMP-01 | Phase 4 | Pending |
| COMP-02 | Phase 4 | Pending |
| COMP-03 | Phase 4 | Pending |
| COMP-04 | Phase 4 | Pending |
| CONF-01 | Phase 4 | Pending |
| CONF-02 | Phase 4 | Pending |
| QUAL-01 | Phase 4 | Pending |
| QUAL-02 | Phase 4 | Pending |

**Coverage:**
- v1.1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-06*
*Last updated: 2026-07-06 after initial definition*
