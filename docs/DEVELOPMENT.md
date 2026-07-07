<!-- generated-by: gsd-doc-writer -->

# Development Guide

## Prerequisites

- **Node.js** 22+ (the Docker image uses `node:22-alpine`)
- **npm** 10+
- **PostgreSQL** 16 (for local dev) or Docker Desktop

## Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file and edit it
cp .env.example .env
```

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Postgres connection string | `postgresql://moodscaparr:password@localhost:5432/moodscaparr` |
| `DIRECT_URL` | Direct connection for migrations | `postgresql://moodscaparr:password@localhost:5432/moodscaparr` |
| `BETTER_AUTH_SECRET` | Session encryption key | `openssl rand -hex 32` to generate |
| `BETTER_AUTH_URL` | Deployed app URL | `http://localhost:3000` |
| `NEXT_PUBLIC_GITHUB_REPO` | GitHub repo for feedback links | `benharvey1985/moodscaparr` |

## Running the Dev Server

```bash
# Start Next.js development server on http://localhost:3000
npm run dev
```

The dev server uses the Next.js Turbopack bundler automatically (Next.js 16 default).

## Database Setup

This project uses **Prisma 7** with a custom config file (`prisma.config.ts`).

```bash
# Generate the Prisma client (after schema changes or first install)
npx prisma generate

# Push schema to the database (creates tables without migration files)
npx prisma db push

# Run pending migrations
npx prisma migrate dev

# Seed the database with sample data
npx prisma db seed

# Open Prisma Studio (GUI for your data)
npx prisma studio
```

> **Note:** `prisma.config.ts` controls Prisma config. It reads `DIRECT_URL` from the environment and uses `tsx` to run the seed script at `prisma/seed.ts`.

## Docker Environment

### Start the full stack

```bash
docker compose up -d
```

This starts:
- **app** — Next.js production build on `http://localhost:8080`
- **db** — PostgreSQL 16 Alpine with health check

Migrations run **automatically** on container startup via `entrypoint.sh`.

### Useful Docker commands

```bash
# View logs
docker compose logs -f app

# Run a command inside the app container
docker compose exec app npx prisma db seed

# Rebuild after code changes
docker compose build && docker compose up -d

# Stop containers
docker compose down

# Stop and delete all data (including the database volume)
docker compose down -v
```

## Build and Lint Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production (`next build`; outputs standalone `.next/`) |
| `npm run start` | Start the production server (`next start`) |
| `npm run lint` | Run ESLint across the project |

The lint config (`eslint.config.mjs`) uses `eslint-config-next` with core-web-vitals and TypeScript rules, ignoring `.next/`, `out/`, `build/`, and `next-env.d.ts`.

> **Important:** This project uses Next.js 16 with breaking changes from earlier versions. Read `node_modules/next/dist/docs/` before writing code.

## Adding New Dependencies

```bash
# Production dependency
npm install <package-name>

# Dev dependency
npm install --save-dev <package-name>
```

After adding a dependency that requires type definitions, install `@types/<package>` as a dev dependency if not included automatically.

## Project Structure

```
├── app/              # Next.js App Router pages and API routes
├── components/       # Shared React components (shadcn/ui based)
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and shared logic
├── prisma/
│   ├── schema.prisma # Database schema
│   ├── seed.ts       # Database seed script
│   └── generated/    # Generated Prisma client (gitignored)
├── public/           # Static assets
├── scripts/          # Utility scripts (e.g., add-dummy-users.ts)
├── types/            # Shared TypeScript types
├── prisma.config.ts  # Prisma 7 configuration
├── proxy.ts          # API proxy configuration
└── next.config.ts    # Next.js configuration (standalone output, CSP headers)
```

## Commit Convention

All commits must be **atomic** — each commit should represent a single logical change, with all related files staged together and unrelated changes kept separate.
