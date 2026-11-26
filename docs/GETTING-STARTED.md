<!-- generated-by: gsd-doc-writer -->

# Getting Started with Moodscaparr

A daily mood diary web app. Log how you feel each day with optional context, then visualize your emotional patterns through charts, a calendar heatmap, achievements, and streak tracking.

---

## Prerequisites

| Dependency | Version | Notes |
|---|---|---|
| **Node.js** | 22.x+ | Required for local development. The Docker image uses Node.js 22 Alpine |
| **npm** | (included) | Comes with Node.js |
| **PostgreSQL** | 16 | Must be running and accessible via `DATABASE_URL` |
| **Docker** | 24+ | Only needed for the Docker quick start (recommended) |
| **Docker Compose** | v2 | Included with Docker Desktop; standalone install also works |
| **Git** | any | To clone the repository |

### Optional Tools

- **openssl** — to generate a secure `BETTER_AUTH_SECRET` (macOS/Linux have this pre-installed)
- **psql** — to inspect the database directly

---

## Quick Start with Docker (Recommended)

This is the fastest way to get Moodscaparr running. Docker Compose starts both the app and a PostgreSQL 16 database with persistent storage.

### 1. Clone the Repository

```bash
git clone https://github.com/benharvey1985/moodscaparr.git
cd moodscaparr
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
```

The defaults in `.env.example` are pre-configured for the Docker Compose stack. Before production, replace `BETTER_AUTH_SECRET` and the database password, set the real `BETTER_AUTH_URL`, and configure the optional services you need:

```bash
openssl rand -hex 32   # generate a secure auth secret
```

Password recovery requires `RESEND_API_KEY` and `EMAIL_FROM`; the sender must be verified in Resend. Google/GitHub SSO appears only when both variables for that provider are set. Feedback requires `NEXT_PUBLIC_GITHUB_REPO=owner/repository` and a rebuild after the value changes.

### 3. Start the Stack

```bash
docker compose up -d
```

Docker Compose will:
1. Pull the `postgres:16-alpine` image and start the database
2. Build the app image using the multi-stage `Dockerfile`
3. Wait for the database health check to pass
4. Run database migrations automatically via `entrypoint.sh`
5. Start the Next.js application server

### 4. Access the App

Open **[http://localhost:8080](http://localhost:8080)** in your browser.

> Port `8080` on the host maps to port `3000` inside the container. This avoids conflicts with any local Node.js dev server you might have running on port `3000`.

### 5. Create the First Admin User

1. Click **Register** on the login page
2. Enter your name, email, and password
3. Submit the registration form
4. You will be automatically assigned the **admin** role

The first user to register in any Moodscaparr instance is automatically promoted to admin. All subsequent users are regular users by default.

### Seed Sample Data (Optional)

```bash
docker compose exec app npx prisma db seed
```

This generates 60 days of realistic mood entries for testing and exploration. The seed script requires at least one admin user to exist.

### Docker Management Commands

| Command | Description |
|---|---|
| `docker compose up -d` | Start the stack in the background |
| `docker compose down` | Stop the stack (data persists in the `pgdata` volume) |
| `docker compose down -v` | Stop the stack **and delete all data** |
| `docker compose build` | Rebuild the app image after code changes |
| `docker compose logs -f app` | Follow live app logs |
| `docker compose exec app sh` | Open a shell inside the app container |
| `docker compose ps` | Check service status |

---

## Quick Start without Docker (Development Mode)

Use this path for local development with hot reload, debugging, and direct access to Node.js tooling.

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/benharvey1985/moodscaparr.git
cd moodscaparr
npm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your local PostgreSQL connection string:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/moodscaparr
DIRECT_URL=postgresql://your_user:your_password@localhost:5432/moodscaparr
BETTER_AUTH_SECRET=<run: openssl rand -hex 32>
BETTER_AUTH_URL=http://localhost:3000

# Required only for password-reset email
RESEND_API_KEY=
EMAIL_FROM=Moodscaparr <no-reply@example.com>

# Optional SSO; set both values for a provider
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Optional feedback drafts
NEXT_PUBLIC_GITHUB_REPO=owner/repository
```

> For local dev, `.env.local` takes precedence over `.env` in Next.js. This keeps your local credentials separate from the Docker defaults.

### Password reset email

The reset flow sends a real email through Resend. Set `RESEND_API_KEY` and a verified `EMAIL_FROM` address. If either is missing, the app reports that email delivery is unavailable; it does not show a false success. Password recovery applies to email/password accounts, not SSO-only accounts.

### Social sign-in

Google and GitHub providers are configured only through `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`. The admin SSO screen is read-only status, not a database-backed toggle. Restart the server after changing these values and register the provider callback URLs shown in the admin screen.

### Feedback

Set `NEXT_PUBLIC_GITHUB_REPO` to the repository that should receive feedback. The app prepares a prefilled GitHub issue draft and opens it; the user must submit the draft on GitHub to create an issue. Settings → Feedback History shows browser-local pending/confirmed drafts for the signed-in account. If delivery is not configured, the form shows an error and stores no success.

### 3. Set Up the Database

Make sure PostgreSQL 16 is running, then:

```bash
# Generate the Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed sample data
npx prisma db seed
```

### 4. Start the Development Server

```bash
npm run dev
```

This starts the Next.js dev server with Turbopack (hot module replacement). The app will be available at **[http://localhost:3000](http://localhost:3000)**.

### 5. Create the First Admin User

Follow the same steps as the Docker quick start above — register, and the first account is auto-promoted to admin.

### Development Commands

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start the production server (run `build` first) |
| `npm run lint` | Run ESLint across the codebase |
| `npx prisma studio` | Open Prisma Studio (database GUI) |
| `npx prisma db seed` | Seed sample data |
| `npx prisma migrate dev` | Run pending migrations in dev |

---

## Changing Ports

- **Docker:** Edit `docker-compose.yml` and change `"8080:3000"` to the desired host port (e.g., `"80:3000"`). Update `BETTER_AUTH_URL` in `.env` to match.
- **Local dev:** Set the `PORT` environment variable or update `BETTER_AUTH_URL` to reflect the new URL.

---

## Key Features Overview

### Mood Logging (3-Step Wizard)

Pick from **19 moods** across 3 categories (Positive / Neutral / Negative), set intensity (1-10), add optional context (activities, weather, sleep, energy, stress), and reflect with guided prompts. Each entry is tied to a user-local `localDate`. The app allows one entry per user/local day; a second create request returns a conflict so you can edit the existing entry.

### Quick Log

Log a mood in 3 taps directly from the dashboard — pick a category, pick a mood, and it saves instantly with sensible defaults. Faster than the full wizard for quick check-ins.

### Dashboard

Time-aware greeting with your name, today's mood status, KPI cards (total entries, average mood score, current streak, entries this week), recent entries list, and streak progress toward your goal.

### Entry History

Browse and search all past entries (newest first). Filter by mood category, search by text (mood label, reflections, activities, weather). View full details in a dialog. Edit, delete, or export as CSV.

### Calendar Heatmap

Monthly grid view with color-coded cells (mood category + intensity). Navigate months, see summary stats (top mood, entry count, average intensity, top activity, average sleep). Click a day to view that entry.

### Analytics

Date range filter (7d / 30d / 90d / All Time) across three tabs:
- **Overview** — KPIs, mood balance bar, mood frequency ranking, wellbeing stats
- **Trends** — mood timeline (line), day-of-week comparison (bar), weather/activity correlation charts
- **Reflections** — filterable recent reflections with progressive loading
- **Print / Save PDF** — opens the browser print dialog for the active tab and range; choose Save as PDF to create a local PDF

The word cloud and emotional transition matrix are deferred and are not presented as shipped features.

### Achievements

**14 badges** across 4 groups with progress tracking:
- **Milestones** — Log 1 / 10 / 50 / 100 entries
- **Streaks** — 7 / 30 / 60 logged-day milestones and a 30-day longest streak; every streak measure allows up to two rest days between logged days rather than requiring unbroken calendar days
- **Exploration** — Log all 19 moods, log in all weathers, 5+ activities in one entry, 50 reflections
- **Special** — Morning log (before 9am), Night owl log (at or after 10pm)

Badges unlock with confetti animations and toast notifications.

### Streak Tracking

Tracks current and longest logged-day streaks (current + longest), allowing up to two rest days between logged days. Visual progress bar on the dashboard. Customizable streak goal in user settings.

### Admin Panel

- **Dashboard** — KPIs (total users, active users, total entries, average streak goal), registration trend, mood distribution, CSV export
- **User Management** — table with search, role filter, promote/demote, suspend/activate, and permanent deletion with no undo. Self-deletion and deletion of the last administrator are blocked.
- **Instance Settings** — read-only environment-configured SSO status (Google/GitHub), invite-only registration mode, invite code generation/revocation

### User Profile & Settings

Edit your name, country (auto-selects a timezone), timezone, and customizable streak goal. Theme preference is available from the header theme control. Settings also includes achievement progress, Feedback History, Replay Tour, JSON export/import, and account deletion. Date display formatting is not user-configurable, and daily reminders are not implemented.

Account deletion is permanent. Email/password accounts must confirm their password. SSO-only accounts cannot use password confirmation; export first and ask another administrator to delete the account.

### Onboarding Tour

A 3-step modal on first login: welcome → log your first mood → explore analytics. Skip, close, Escape, and Finish all persist dismissal through the onboarding API. A failed save keeps the tour open with a retry action. Replay it from Settings.

### Feedback System

Floating action button for bug reports (with severity) or feature suggestions (with category). It prepares a prefilled GitHub issue draft; it does not create an issue. The action is labeled Continue to GitHub, popup blocking shows a fallback link, and history stays pending until the user confirms submission. Feedback History is available in Settings and uses account-scoped browser storage.

### Theme

Full light/dark/system theme support via `next-themes`. Toggle from the header. Dark mode is applied consistently across all components.

### Local dates and legacy backfill

New mood entries store an authoritative `localDate` in the user's profile timezone and enforce one entry per user/local day. Older rows may have only the compatibility `date` timestamp. After migrating an existing database, review and backfill those rows:

```bash
npx tsx scripts/backfill-local-dates.ts --dry-run
npx tsx scripts/backfill-local-dates.ts
```

The dry run writes nothing. The backfill derives missing values from the UTC date portion of the legacy timestamp and reports duplicate user/local-date groups. It never deletes or merges rows; resolve duplicates before treating the dataset as one-entry-per-day. Seed data from older versions also needs this backfill.

---

## Production Deployment Checklist

- [ ] Generate a secure `BETTER_AUTH_SECRET` (`openssl rand -hex 32`)
- [ ] Change the database password in `.env` and update `POSTGRES_PASSWORD` in `docker-compose.yml`
- [ ] Set `BETTER_AUTH_URL` to your actual domain (e.g., `https://moodscaparr.example.com`)
- [ ] Set up a reverse proxy (Caddy, Nginx) with TLS termination
- [ ] Configure `RESEND_API_KEY` and a verified `EMAIL_FROM` for password recovery
- [ ] Configure optional Google/GitHub client IDs, secrets, and callback URLs
- [ ] Set `NEXT_PUBLIC_GITHUB_REPO` and rebuild for the feedback feature
- [ ] Back up the database before permanent user deletions or destructive maintenance

---

## Troubleshooting

| Problem | Solution |
|---|---|
| App won't start — `DATABASE_URL` not set | Ensure `.env` (Docker) or `.env.local` (dev) has a valid connection string |
| `BETTER_AUTH_SECRET` error | Generate one with `openssl rand -hex 32` |
| Prisma migration errors | Make sure PostgreSQL is running and accessible. Run `npx prisma migrate dev` again |
| Port 3000 already in use | Stop the other process, or use Docker (runs on port 8080) |
| Docker build fails | Ensure your Docker version is 24+. Run `docker compose build --no-cache` to force a clean build |
| Cannot connect to database in Docker | Ensure no other Postgres is running on the host that conflicts with the compose network |
| Password reset says email is not configured | Set `RESEND_API_KEY` and a Resend-verified `EMAIL_FROM`, then restart |
| Google/GitHub sign-in is missing | Set both client ID and secret, register the callback URL, then restart |
| Feedback says delivery is not configured | Set `NEXT_PUBLIC_GITHUB_REPO=owner/repository` and rebuild |
| Backfill reports duplicate local dates | Review the reported rows; the script does not merge or delete them |

---

## Next Steps

- [Development Guide](DEVELOPMENT.md) — local setup, build commands, code style
- [Configuration Reference](CONFIGURATION.md) — all environment variables explained
- [Architecture Overview](ARCHITECTURE.md) — system design, data flow, component map
- [API Documentation](API.md) — REST endpoints and client usage
- [Testing Guide](TESTING.md) — test framework and commands
- [Deployment Guide](DEPLOYMENT.md) — production deployment in detail
