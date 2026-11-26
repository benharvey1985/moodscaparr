<!-- generated-by: gsd-doc-writer -->

# Moodscaparr

A self-hosted daily mood diary. Log one mood entry per local day with optional context, then explore patterns through history, a calendar heatmap, analytics, achievements, and streak tracking.

## Getting Started

```bash
# Install dependencies
npm install

# Set up your environment
cp .env.example .env
# Edit database/auth values; configure Resend and optional providers as needed

# Set up the database
npx prisma migrate dev

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The first user to register becomes the admin.

### Required and optional configuration

| Variable | Purpose |
|---|---|
| `DATABASE_URL` / `DIRECT_URL` | PostgreSQL runtime and migration connections |
| `BETTER_AUTH_SECRET` | Session/auth secret; generate with `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Deployment origin used for auth callbacks |
| `RESEND_API_KEY` / `EMAIL_FROM` | Required for real password-reset email; `EMAIL_FROM` must be a Resend-verified sender |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional Google SSO; both are required |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Optional GitHub SSO; both are required |
| `NEXT_PUBLIC_GITHUB_REPO` | `owner/repository` for feedback drafts; rebuild after changing |

SSO availability is controlled by server environment variables, not database toggles. Restart after changing provider configuration. Register provider callbacks at:

- `${BETTER_AUTH_URL}/api/auth/callback/google`
- `${BETTER_AUTH_URL}/api/auth/callback/github`

Password recovery is available only for credential accounts and only when Resend is configured. Without `RESEND_API_KEY` and a verified `EMAIL_FROM`, the reset request reports that delivery is unavailable instead of pretending an email was sent.

## Docker Setup

### Prerequisites

- Docker 24+
- Docker Compose v2
- Git

### Quick Start

1. Clone the repository and enter it.
2. Copy `.env.example` to `.env` and replace production secrets/passwords.
3. Run `docker compose up -d`.
4. Open [http://localhost:8080](http://localhost:8080).
5. Register the first user; that account becomes admin.

### Environment defaults

| Variable | Docker default |
|---|---|
| `DATABASE_URL` | `postgresql://moodscaparr:change-me-in-production@db:5432/moodscaparr` |
| `DIRECT_URL` | Same as `DATABASE_URL` |
| `BETTER_AUTH_SECRET` | `change-me-in-production` — replace outside local testing |
| `BETTER_AUTH_URL` | `http://localhost:8080` |
| `RESEND_API_KEY` / `EMAIL_FROM` | Empty/placeholder; password reset is unavailable until configured |
| `NEXT_PUBLIC_GITHUB_REPO` | `benharvey1985/moodscaparr` — set your own repository |

### Database and containers

- Migrations run automatically on container startup.
- Seed sample entries with `docker compose exec app npx prisma db seed`. Seeding skips when entries already exist and requires an admin.
- `docker compose down` preserves the database volume.
- `docker compose down -v` permanently deletes container data.
- Rebuild after source or public environment changes: `docker compose build && docker compose up -d`.

### Production checklist

- Replace `BETTER_AUTH_SECRET` and database passwords.
- Set `BETTER_AUTH_URL` and trusted origins for the deployment.
- Configure Resend and a verified sender for password recovery.
- Configure each optional SSO provider and its callback URL.
- Set `NEXT_PUBLIC_GITHUB_REPO` for feedback.
- Terminate TLS with a reverse proxy.

## Features

- **Mood logging** — 19 moods across Positive, Neutral, and Negative; intensity, date, activities, weather, sleep, energy, stress, and optional reflections.
- **One entry per local day** — the API rejects a second entry for the same user and `localDate`. Edit the existing entry instead.
- **Quick Log and dashboard** — fast mood entry, today's status, KPIs, recent entries, and streak goal progress.
- **History** — search/filter, full entry details, edit/delete, and complete CSV export.
- **Calendar heatmap** — monthly mood cells, navigation, summaries, and day details.
- **Analytics** — range-filtered overview, trends, wellbeing metrics, reflection browsing, chart data tables, and browser **Print / Save PDF** for the current view.
- **Achievements** — 14 badges with readable locked states, progress, toasts, and reduced-motion-safe confetti.
- **Feedback** — prepares a prefilled GitHub issue draft. Nothing is created until the user submits it on GitHub. Drafts stay pending until confirmed and are listed in Settings → Feedback History.
- **Admin** — user management, suspension, invite codes, metrics, and read-only environment-driven SSO status.
- **Privacy controls** — JSON export/import and permanent account deletion. Credential accounts require password confirmation; SSO-only accounts must export and arrange deletion with another administrator.
- **Theme** — light, dark, and system modes.

## Dates and legacy data

`localDate` is the authoritative user-local calendar date. New entries contain one row per user/local date. Legacy rows without `localDate` can be backfilled from the UTC date portion of their existing `date` value:

```bash
# Review first; this does not write
npx tsx scripts/backfill-local-dates.ts --dry-run

# Apply the backfill
npx tsx scripts/backfill-local-dates.ts
```

The script reports duplicate user/local-date groups. It never deletes or merges rows; review duplicates before relying on one-entry-per-day reporting. Seed data created by older versions also needs this backfill.

## Printing analytics

Choose the desired analytics tab and date range, then select **Print / Save PDF**. The browser print dialog can save the current report as PDF or send it to a printer. This is not a server-generated PDF download, and only the active tab/range is printed.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 + React 19 |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| ORM | Prisma 7 |
| Auth | Better Auth 1.6 |
| CSS | Tailwind v4 + shadcn/ui + Base UI |
| State | TanStack Query 5 |
| Forms | react-hook-form + Zod 4 |
| Charts | Recharts |
| Deployment | Docker Compose |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm test` | Run the focused TypeScript tests |

## Project Status

Core mood logging, history, calendar, analytics, achievements, settings, feedback drafts, and admin flows are implemented and self-hostable. The project is not described as feature-complete: the word cloud and emotional transition matrix are deferred, and there are no daily reminders or user-selectable date-format controls. Account deletion is permanent and has no undo.
