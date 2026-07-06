# Features Research: Docker Deployment

## Table Stakes

- **Single-command startup**: User clones repo, runs `docker compose up`, app + DB start
- **Persistent data**: Named volume for Postgres so data survives container restart/update
- **Environment config**: `.env.example` documenting all required variables
- **Migration on startup**: Prisma migrations run automatically when container starts
- **Documentation**: README with Docker prerequisites, setup, and run instructions

## Differentiators

- **Health endpoint**: `/api/health` returning 200 + DB status for orchestration
- **Non-root user**: Runner stage runs as `node` user (security best practice)
- **Multi-stage build**: Minimal final image size (~200–300MB)
- **Graceful shutdown**: Proper signal handling for zero-downtime

## Anti-features (What NOT to do)

- Don't bind-mount source code in production image (use in dev only)
- Don't run `next dev` in production container
- Don't require user to run database setup separately
- Don't bake secrets into the image

## User Experience

```bash
# Clone → configure → run
git clone https://github.com/user/moodscaparr
cd moodscaparr
cp .env.example .env
# edit .env with desired values
docker compose up -d
# Visit http://localhost:3000
# Register first user (auto-becomes admin)
```
