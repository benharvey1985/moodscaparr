<!-- generated-by: gsd-doc-writer -->

# API Reference

## Overview

Moodscaparr uses Next.js App Router API routes under `app/api/`. All routes are server-side only (no client-side API gateway) and return JSON responses. Authentication is handled via session cookies set by Better Auth.

## Authentication

All API routes except `/api/health` require an active session. The middleware (`middleware.ts`) protects `/dashboard/*`, `/wizard/*`, and `/admin/*` pages — but API routes are authenticated at the route level via the session token in cookies.

## Route Index

### Health

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/health` | Container health check with DB connectivity | No |

**Response (200):** `{"status":"healthy","database":"connected","timestamp":"..."}`
**Response (503):** `{"status":"unhealthy","database":"disconnected","timestamp":"..."}`

### Mood Entries

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/mood-entries` | List mood entries (paginated) |
| POST | `/api/mood-entries` | Create a new mood entry |
| GET | `/api/mood-entries/[id]` | Get a single mood entry |
| PUT | `/api/mood-entries/[id]` | Update a mood entry |
| DELETE | `/api/mood-entries/[id]` | Delete a mood entry |
| GET | `/api/mood-entries/search` | Search/filter entries |
| GET | `/api/mood-entries/calendar` | Calendar heatmap data |

### Analytics & Stats

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/analytics` | Analytics data (overview, trends, reflections) |
| GET | `/api/stats` | User stats summary |
| GET | `/api/streak` | Current and longest logging streak |

### Achievements

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/achievements` | List achievements with progress |
| POST | `/api/achievements/check` | Check and award new achievements |

### Auth

| Method | Path | Description |
|--------|------|-------------|
| * | `/api/auth/[...all]` | Better Auth catch-all (login, register, logout, session, etc.) |

### User

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/user/profile` | Get user profile and settings |
| PUT | `/api/user/profile` | Update user profile and settings |
| GET | `/api/user/export` | Export user data as JSON |
| POST | `/api/user/import` | Restore user data from JSON |
| POST | `/api/user/onboarding-complete` | Mark onboarding as complete |

### Admin

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/stats` | Admin dashboard KPIs (users, entries, streaks) |
| GET | `/api/admin/users` | List all users |
| PUT | `/api/admin/users/[id]` | Update user role or status |
| DELETE | `/api/admin/users/[id]` | Suspend or delete a user |
| GET | `/api/admin/sso` | List SSO providers |
| PUT | `/api/admin/sso` | Configure SSO providers |
| GET | `/api/admin/invite-codes` | List invite codes |
| POST | `/api/admin/invite-codes` | Generate invite codes |
| DELETE | `/api/admin/invite-codes/[id]` | Revoke an invite code |

### Feedback

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/feedback` | Submit feedback (creates GitHub issue) |

### Seed

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/seed` | Seed sample data (admin toggle, dev-only) |

## Response Format

All API routes return JSON. Success responses use HTTP 200. Error responses follow patterns:

```json
{
  "error": "message description",
  "code": "ERROR_CODE"
}
```

Common HTTP status codes:
- **200** — Success
- **400** — Bad request (missing/invalid fields)
- **401** — Unauthorized (no session)
- **403** — Forbidden (non-admin accessing admin route)
- **404** — Resource not found
- **429** — Rate limited
- **503** — Service unavailable (health endpoint when DB is down)
