# Architecture Research: Docker Deployment

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                     │
│  ┌──────────────┐          ┌──────────────────────┐  │
│  │   Postgres    │          │  Next.js App (node)  │  │
│  │   :5432       │◄────────►│  :3000               │  │
│  │               │  tcp     │                      │  │
│  │  Named Volume │          │  .next/standalone    │  │
│  │  postgres_data│          │  prisma migrate on   │  │
│  │               │          │  startup             │  │
│  └──────────────┘          └──────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Dockerfile Structure

```
dependencies (node:20-alpine)
  │ npm ci --frozen-lockfile
  ▼
builder (node:20-alpine)
  │ copy node_modules from dependencies
  │ copy source code
  │ prisma generate + npm run build
  ▼
runner (node:20-alpine)
  │ copy .next/standalone/
  │ copy .next/static/
  │ copy public/
  │ copy prisma/ directory
  │ copy subset of node_modules (prisma CLI, @prisma)
  │ install openssl + libc6-compat
  │ USER node
  │ ENTRYPOINT ["./entrypoint.sh"]
```

## Docker Compose Services

### db
- Image: `postgres:16-alpine`
- Environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
- Volume: `postgres_data:/var/lib/postgresql/data`
- Healthcheck: `pg_isready -U moodscape -d moodscape`
- Port: 5432 (internal only)

### app
- Build: context ., dockerfile Dockerfile
- Depends on: db (condition: service_healthy)
- Port: 3000:3000
- Environment: from .env file
- Restart: unless-stopped

## Data Flow

1. `docker compose up` starts db first
2. Health check waits for Postgres to accept connections
3. App container starts after db is healthy
4. Entrypoint runs `npx prisma migrate deploy` (creates/updates schema)
5. App server starts on port 3000
6. App connects to Postgres via service name `db:5432`

## Build Order Dependencies

1. .dockerignore (exclude unnecessary files from build context)
2. Dockerfile (multi-stage, order: deps → build → runner)
3. entrypoint.sh (prisma migrate + start server)
4. docker-compose.yml (orchestrate both services)
5. .env.example (document config surface)
6. next.config.ts (add `output: "standalone"`)
7. README.md (Docker instructions)

## Files Changed

### New Files
- `Dockerfile`
- `docker-compose.yml`
- `entrypoint.sh`
- `.dockerignore`
- `.env.example`

### Modified Files
- `next.config.ts` — add `output: "standalone"`
- `README.md` — add Docker deployment section
