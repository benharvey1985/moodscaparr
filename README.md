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

## Quick Start with Docker

```bash
docker compose up -d
# Visit http://localhost:8080
```

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

v0.1.0 — All core features implemented. Docker deployment milestone in progress.
