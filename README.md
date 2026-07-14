<!-- generated-by: gsd-doc-writer -->

# Moodscaparr

A daily mood diary web app. Log how you feel each day with optional context, then visualize your emotional patterns through charts, a calendar heatmap, achievements, and streak tracking.

## Getting Started

```bash
# Install dependencies
npm install

# Set up your environment
cp .env.example .env
# Edit .env with your database URL and auth secret

# Set up the database
npx prisma migrate dev

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app. The first user to register will be auto-assigned the admin role.

## Docker Setup

### Prerequisites

- Docker 24+ and Docker Compose v2
- Git (to clone the repository)

### Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/moodscaparr.git
   cd moodscaparr
   ```

2. Copy and configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env — the defaults work for local testing but change secrets for production
   ```

3. Start the stack:
   ```bash
   docker compose up -d
   ```

4. Access the app at [http://localhost:8080](http://localhost:8080)

5. Register the first user — they will be auto-assigned the admin role.

### Environment Configuration

| Variable | Description | Docker Default |
|----------|-------------|----------------|
| `DATABASE_URL` | PostgreSQL connection string for runtime queries | `postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr` |
| `DIRECT_URL` | PostgreSQL connection string for migrations | Same as `DATABASE_URL` (no pooler in Docker) |
| `BETTER_AUTH_SECRET` | Session encryption key — generate with `openssl rand -hex 32` | `change-me-in-production` |
| `BETTER_AUTH_URL` | Deployment URL for auth callbacks | `http://localhost:8080` |
| `NEXT_PUBLIC_GITHUB_REPO` | GitHub repo for feedback links | `your-username/moodscaparr` |

### Database Migrations

- Migrations run **automatically** on container startup
- To seed sample data: `docker compose exec app npx prisma db seed`
- To reset everything: `docker compose down -v && docker compose up -d`

### Stopping

- Stop containers: `docker compose down`
- Stop and delete all data: `docker compose down -v`

### Building from Source

After making code changes, rebuild the image:

```bash
docker compose build
docker compose up -d
```

### Production Deployment Checklist

- [ ] Change `BETTER_AUTH_SECRET` to a secure random value
- [ ] Change the database password in `.env` and update `POSTGRES_PASSWORD` in `docker-compose.yml`
- [ ] Update `BETTER_AUTH_URL` to your actual domain
- [ ] Set up a reverse proxy (Caddy, Nginx) with TLS termination

## Features

- **Mood logging** — 3-step wizard with mood picker, context (activities, weather, sleep, energy, stress), and reflection prompts
- **Quick Log** — log a mood in 3 taps from the dashboard with sensible defaults
- **Dashboard** — time-aware greeting, today's status, KPI cards, recent entries, streak progress
- **Entry history** — browse, search, filter, and export entries as CSV
- **Calendar heatmap** — color-coded days showing mood intensity and category
- **Analytics** — overview KPIs, mood trends, day-of-week patterns, activity correlations, wellbeing stats, reflections
- **Achievements** — 14 badges across milestone, streak, exploration, and special categories with confetti animations
- **Admin panel** — user management, SSO provider config, invite codes, dashboard KPIs
- **Dark mode** — light/dark/system theme toggle
- **Glassmorphism UI** — frosted glass aesthetic with blurred backdrops and depth layers across all surfaces

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |
| Auth | Better Auth 1.6 |
| CSS | Tailwind v4 + shadcn/ui |
| State | TanStack Query 5 |
| Forms | react-hook-form + Zod 4 |
| Charts | recharts |
| Deployment | Docker Compose |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Status

v1.3 — All core features implemented. Docker deployment complete — self-host with `docker compose up`.

### What's New in Recent Releases

- **v1.3** — Glassmorphism design system: frosted cards, blurred backdrops, depth layers on all surfaces
- **v1.2** — UI redesign: desktop sidebar, mobile bottom tabs, page migration to `(app)` route group, server-side auth guards
