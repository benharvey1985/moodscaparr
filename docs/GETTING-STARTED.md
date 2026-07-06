<!-- generated-by: gsd-doc-writer -->

# Getting Started

## Prerequisites

- **Node.js** — version 22.x or later (Docker image uses Node.js 22)
- **npm** — included with Node.js
- **PostgreSQL 16** — running locally or via Docker. The app connects to a Postgres database at the URL specified in `DATABASE_URL`
- **Docker** (optional) — for running with `docker compose up` without installing Node.js locally

## Installation

```bash
# Clone the repository
git clone https://github.com/benharvey1985/moodscaparr
cd moodscaparr

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and generate an auth secret

# Run database migrations
npx prisma migrate dev
```

## First Run

### Standard Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first user to register will be auto-assigned the admin role.

### With Docker (self-hosting)

```bash
docker compose up -d
```

Open [http://localhost:8080](http://localhost:8080). The Docker setup includes Postgres 16 with persistent storage.

## Common Setup Issues

- **Missing `DATABASE_URL`** — The app throws on startup if `DATABASE_URL` is not set. Ensure your `.env` file has the correct Postgres connection string
- **`BETTER_AUTH_SECRET` not set** — Generate one with `openssl rand -hex 32` and add it to `.env`
- **Prisma migration errors** — Ensure Postgres is running and the `DIRECT_URL` in `.env` points to the correct database. Run `npx prisma migrate dev` again after fixing the connection
- **Port conflict on 3000** — If something else is running on port 3000, stop it or set a different port in `.env` via the `BETTER_AUTH_URL`

## Next Steps

- [Development](DEVELOPMENT.md) — local setup, build commands, code style
- [Testing](TESTING.md) — test framework and commands
- [Architecture](ARCHITECTURE.md) — system overview and component diagram
