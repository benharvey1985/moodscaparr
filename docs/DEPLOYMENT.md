<!-- generated-by: gsd-doc-writer -->

# Deployment

## Docker (Recommended)

Moodscaparr ships with a complete Docker deployment stack. This is the recommended way to self-host.

### Prerequisites

- Docker 24+ and Docker Compose v2
- Git (to clone the repository)

### Quick Start

```bash
git clone https://github.com/your-username/moodscaparr.git
cd moodscaparr
cp .env.example .env
# Edit .env if desired — defaults work for local testing
docker compose up -d
```

Access the app at [http://localhost:8080](http://localhost:8080). The first user to register is auto-assigned the admin role.

### Architecture

The Docker stack runs two services:

**app** — Next.js application server
- Multi-stage Dockerfile (deps → builder → runner)
- Alpine Linux base, non-root `node` user (UID 1000)
- Standalone output mode for minimal image size (~300-400 MB)
- Auto-migrates database on startup via `entrypoint.sh`
- Health endpoint at `/api/health` for container orchestration
- Mapped to host port `8080` (avoids conflict with local dev on port 3000)

**db** — PostgreSQL 16
- `postgres:16-alpine` image
- Named volume `pgdata` for data persistence
- Health check via `pg_isready` before app starts
- Not exposed to host (only accessible within the compose network)

### Environment Configuration

| Variable | Docker Default |
|----------|----------------|
| `DATABASE_URL` | `postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr` |
| `DIRECT_URL` | Same as `DATABASE_URL` (no pooler in Docker) |
| `BETTER_AUTH_SECRET` | `change-me-in-production` (generate with `openssl rand -hex 32`) |
| `BETTER_AUTH_URL` | `http://localhost:8080` |
| `NEXT_PUBLIC_GITHUB_REPO` | `your-username/moodscaparr` |

Variables are loaded via the `env_file: .env` directive in `docker-compose.yml`.

### Database Migrations

Migrations run automatically on container startup via `entrypoint.sh`:

```bash
docker compose logs app | grep "Migrations complete"
```

To seed sample data:

```bash
docker compose exec app npx prisma db seed
```

To reset everything:

```bash
docker compose down -v && docker compose up -d
```

### Common Commands

| Command | Description |
|---------|-------------|
| `docker compose up -d` | Start the stack |
| `docker compose down` | Stop the stack (data persists) |
| `docker compose down -v` | Stop and delete all data |
| `docker compose build` | Rebuild the app image after code changes |
| `docker compose logs -f app` | Follow app logs |
| `docker compose exec app sh` | Open a shell in the app container |
| `docker compose ps` | Check service status |

### Production Checklist

- [ ] Change `BETTER_AUTH_SECRET` to a secure random value
- [ ] Change the database password in `.env` and update `POSTGRES_PASSWORD` in `docker-compose.yml`
- [ ] Update `BETTER_AUTH_URL` to your actual domain
- [ ] Set up a reverse proxy (Caddy, Nginx) with TLS termination

## Standard Deployment (without Docker)

### Prerequisites

- Node.js 22.x
- PostgreSQL 16
- npm

### Steps

1. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/your-username/moodscaparr.git
   cd moodscaparr
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   ```

3. Set up the database:
   ```bash
   npx prisma migrate deploy
   # Optional: seed sample data
   npx prisma db seed
   ```

4. Build and start:
   ```bash
   npm run build
   npm run start
   ```

The app will be available at `http://localhost:3000`.

### Process Management

For production without Docker, use a process manager like `pm2`:

```bash
npm install -g pm2
pm2 start npm --name moodscaparr -- start
pm2 save
pm2 startup
```

<!-- VERIFY: Production deployment without Docker requires Node.js 22, PostgreSQL 16, and a process manager -->
