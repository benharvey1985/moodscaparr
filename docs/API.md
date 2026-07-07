<!-- generated-by: gsd-doc-writer -->

# Moodscaparr API Reference

Base path: `/api`

All timestamps are ISO 8601 strings. All errors return `{ error: string }` unless otherwise noted.

---

## Public

### `GET /api/health`

Health check — verifies the server is running and the database is reachable.

**Auth:** None

**Response `200`:**
```json
{ "status": "healthy", "timestamp": "2025-01-01T00:00:00.000Z", "database": "connected" }
```

**Response `503`:**
```json
{ "status": "unhealthy", "timestamp": "2025-01-01T00:00:00.000Z", "database": "disconnected" }
```

---

## Auth

### `GET /api/auth/invite-status`

Check whether the application is in invite-only registration mode.

**Auth:** None

**Response:**
```json
{ "inviteOnly": true }
```

---

### `POST /api/auth/validate-invite`

Validate an invite code and record its consumption against an email address.

**Auth:** None

**Request body:**
```json
{ "code": "AB12CD34", "email": "user@example.com" }
```

**Response `200`:**
```json
{ "valid": true }
```

**Errors:** `400` — code missing, expired, revoked, or exhausted.

---

### `GET|POST /api/auth/[...all]`

Catch-all handler for [Better Auth](https://www.better-auth.com/) endpoints (sign-in, sign-up, sign-out, session, etc.). All auth routes pass through this handler.

**Auth:** Varies by endpoint (handled by Better Auth).

---

## Mood Entries

All mood entry endpoints require a valid user session.

### `GET /api/mood-entries`

List the authenticated user's most recent 50 mood entries, ordered by date descending.

**Auth:** Session required

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "category": "POSITIVE",
    "moodIndex": 1,
    "intensity": 7,
    "date": "2025-01-01T12:00:00.000Z",
    "activities": ["Work", "Exercise"],
    "weather": "Sunny",
    "sleepHours": 8,
    "sleepQuality": "Good",
    "energyLevel": 7,
    "stressLevel": 3,
    "reflection1": "...",
    "reflection2": null,
    "reflection3": null,
    "reflection4": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

### `POST /api/mood-entries`

Create a new mood entry. On success, triggers achievement checking for the user.

**Auth:** Session required

**Request body:**
```json
{
  "category": "POSITIVE | NEUTRAL | NEGATIVE",
  "moodIndex": 0,
  "intensity": 5,
  "date": "2025-01-01T12:00:00.000Z",
  "activities": ["Work", "Exercise"],
  "weather": "Sunny",
  "sleepHours": 8,
  "sleepQuality": "Good",
  "energyLevel": 7,
  "stressLevel": 3,
  "reflection1": "Had a productive day.",
  "reflection2": null,
  "reflection3": null,
  "reflection4": null
}
```

**Response `201`:** Full entry object plus `newlyUnlocked` array of achievement IDs unlocked by this creation.

**Errors:** `400` — validation error (Zod).

---

### `GET /api/mood-entries/[id]`

Get a single mood entry by ID. Ownership is enforced (must belong to authenticated user).

**Auth:** Session required

**Response `200`:** Full entry object.

**Errors:** `404` — not found or not owned by user.

---

### `PUT /api/mood-entries/[id]`

Update a mood entry. Only fields provided in the body are changed.

**Auth:** Session required

**Request body:** Same shape as `POST /api/mood-entries` but all fields optional.

**Response `200`:** Updated entry object.

**Errors:** `404` — not found or not owned by user; `400` — validation error.

---

### `DELETE /api/mood-entries/[id]`

Delete a mood entry.

**Auth:** Session required

**Response `200`:**
```json
{ "success": true }
```

**Errors:** `404` — not found or not owned by user.

---

### `GET /api/mood-entries/search?q=&category=&page=1&limit=20`

Search the authenticated user's mood entries by keyword (searches reflection fields and weather) and/or filter by category. Paginated.

**Auth:** Session required

**Query parameters:**
| Param    | Type     | Description                                                |
|----------|----------|------------------------------------------------------------|
| `q`      | string   | Free-text search across reflections and weather (optional) |
| `category` | string | Filter by `POSITIVE`, `NEUTRAL`, or `NEGATIVE` (optional)  |
| `page`   | int      | Page number (default: 1)                                   |
| `limit`  | int      | Items per page, max 100 (default: 20)                      |

**Response `200`:**
```json
{
  "entries": [ ... ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### `GET /api/mood-entries/calendar?month=2025-01`

Get all mood entries for a specific month, plus the date of the user's first ever entry.

**Auth:** Session required

**Query parameters:**
| Param   | Type   | Description                          |
|---------|--------|--------------------------------------|
| `month` | string | Required. Format: `YYYY-MM`          |

**Response `200`:**
```json
{
  "entries": [ ... ],
  "firstEntryDate": "2024-06-15T12:00:00.000Z",
  "month": "2025-01"
}
```

**Errors:** `400` — invalid month format.

---

## User Profile

### `GET /api/user/profile`

Get the authenticated user's account info and profile settings.

**Auth:** Session required

**Response `200`:**
```json
{
  "user": {
    "id": "uuid",
    "name": "Alice",
    "email": "alice@example.com",
    "role": "user",
    "image": null,
    "createdAt": "..."
  },
  "profile": {
    "id": "uuid",
    "country": "US",
    "timezone": "America/New_York",
    "streakGoal": 7,
    "onboardingComplete": true
  }
}
```

---

### `PUT /api/user/profile`

Update the authenticated user's profile. Supports partial updates.

**Auth:** Session required

**Request body (all optional):**
```json
{
  "name": "Alice",
  "country": "US",
  "timezone": "America/New_York",
  "streakGoal": 7
}
```

If `name` is provided, it is also propagated to the User record.

**Response `200`:**
```json
{ "profile": { ... } }
```

**Errors:** `400` — validation error.

---

### `GET /api/user/export`

Export all of the authenticated user's data (account, profile, mood entries, achievements).

**Auth:** Session required

**Response `200`:**
```json
{
  "version": "1.0",
  "exportedAt": "...",
  "data": {
    "user": { ... },
    "profile": { ... },
    "entries": [ ... ],
    "achievements": [ ... ]
  }
}
```

---

### `POST /api/user/import`

Import mood entries from a previous export. Duplicate detection is done by matching `(userId, date, category)`. Rate-limited to 5 requests per minute.

**Auth:** Session required

**Request body:**
```json
{
  "version": "1.0",
  "data": {
    "entries": [ ... ]
  }
}
```

Each entry matches the `POST /api/mood-entries` schema. Max 1000 entries per import.

**Response `200`:**
```json
{ "imported": 42, "skipped": 3 }
```

**Errors:** `429` — rate limited; `400` — validation error.

---

### `GET /api/user/onboarding-complete`

Check whether the user has completed onboarding.

**Auth:** Session required

**Response `200`:**
```json
{ "onboardingComplete": false }
```

---

### `POST /api/user/onboarding-complete`

Mark the user's onboarding as complete.

**Auth:** Session required

**Response `200`:**
```json
{ "success": true }
```

---

## Streak

### `GET /api/streak`

Compute the authenticated user's current and longest check-in streak, respecting their timezone.

**Auth:** Session required

**Response `200`:**
```json
{
  "current": 5,
  "longest": 14,
  "streakGoal": 7,
  "isOnStreak": true
}
```

---

## Achievements

### `GET /api/achievements`

List all achievements for the authenticated user, including locked/unlocked status and overall progress.

**Auth:** Session required

**Response `200`:**
```json
{
  "achievements": [
    {
      "id": "first_entry",
      "name": "First Steps",
      "description": "Log your first mood",
      "isUnlocked": true,
      "unlockedAt": "...",
      "icon": "..."
    }
  ],
  "completionPercentage": 25,
  "unlockedCount": 2,
  "totalCount": 8
}
```

---

### `POST /api/achievements/check`

Force-recheck all achievement conditions for the authenticated user.

**Auth:** Session required

**Response `200`:**
```json
{ "newlyUnlocked": ["first_entry"] }
```

---

## Feedback

### `POST /api/feedback`

Submit a bug report or feature suggestion. If `NEXT_PUBLIC_GITHUB_REPO` is configured, generates a prefilled GitHub issue URL. Rate-limited to 5 requests per minute.

**Auth:** Session required

**Request body:**
```json
{
  "type": "bug | feature",
  "title": "Short summary",
  "description": "Detailed description",
  "severity": "low | medium | high | critical",
  "category": "ui | performance | etc"
}
```

**Response `200`:**
```json
{ "url": "https://github.com/...", "id": "uuid", "message": "Feedback submitted" }
```

**Errors:** `429` — rate limited; `400` — validation error.

---

## Analytics

### `GET /api/analytics?range=30d`

Get detailed analytics for the authenticated user, including aggregated stats, mood frequency distribution, averages for energy/stress/sleep, and best/worst day identification.

**Auth:** Session required

**Query parameters:**
| Param   | Type   | Description                                       |
|---------|--------|---------------------------------------------------|
| `range` | string | `7d`, `30d` (default), `90d`, or omit for all time |

**Response `200`:**
```json
{
  "entries": [ ... ],
  "stats": {
    "totalEntries": 120,
    "avgMoodScore": 0.45,
    "currentStreak": 5,
    "longestStreak": 14,
    "bestDay": { "date": "2025-01-15", "mood": { "emoji": "😊", "label": "Ecstatic" } },
    "worstDay": { "date": "2025-01-10", "mood": { "emoji": "😢", "label": "Sad" } },
    "moodBalance": 0.35,
    "moodFrequency": [
      { "label": "Happy", "emoji": "😄", "count": 18 }
    ],
    "avgEnergy": 6.5,
    "avgStress": 4.2,
    "avgSleepHours": 7.3
  }
}
```

---

## Stats

### `GET /api/stats`

Get quick summary statistics for the authenticated user (total entries, average mood score, balance, this week's count, streaks, and streak goal).

**Auth:** Session required

**Response `200`:**
```json
{
  "totalEntries": 120,
  "avgMoodScore": 0.45,
  "moodBalance": 0.35,
  "entriesThisWeek": 5,
  "currentStreak": 5,
  "longestStreak": 14,
  "streakGoal": 7
}
```

---

## Seed

### `GET /api/seed`

Check whether the authenticated admin user already has seeded data.

**Auth:** Admin only

**Response `200`:**
```json
{ "seeded": true, "count": 60 }
```

---

### `POST /api/seed`

Generate 60 days of sample mood entries for the authenticated admin user. No-op if entries already exist.

**Auth:** Admin only

**Response `201`:**
```json
{ "message": "Seeded 60 entries", "count": 60 }
```

**Errors:** `403` — not admin.

---

### `DELETE /api/seed`

Delete all mood entries belonging to the authenticated admin user.

**Auth:** Admin only

**Response `200`:**
```json
{ "message": "Cleared 60 entries", "count": 60 }
```

**Errors:** `403` — not admin.

---

## Admin — Stats

### `GET /api/admin/stats`

Get dashboard-level statistics: total users, active users (past 30 days), total entries, average streak goal, registration trend (12 months), and mood distribution percentages.

**Auth:** Admin only

**Response `200`:**
```json
{
  "totalUsers": 100,
  "activeUsers": 42,
  "totalEntries": 5000,
  "avgStreak": 7,
  "registrationTrend": [
    { "month": "Jan 2025", "count": 10 }
  ],
  "moodDistribution": {
    "POSITIVE": 55,
    "NEUTRAL": 30,
    "NEGATIVE": 15
  }
}
```

**Errors:** `403` — not admin.

---

## Admin — Users

### `GET /api/admin/users?q=&role=&page=1&limit=20`

List users with optional search and role filtering. Paginated.

**Auth:** Admin only

**Query parameters:**
| Param   | Type   | Description                                              |
|---------|--------|----------------------------------------------------------|
| `q`     | string | Search name/email (optional)                             |
| `role`  | string | Filter by `user` or `admin` (optional)                   |
| `page`  | int    | Page number (default: 1)                                 |
| `limit` | int    | Items per page, max 100 (default: 20)                    |

**Response `200`:**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "Alice",
      "email": "alice@example.com",
      "role": "user",
      "banned": false,
      "entryCount": 42,
      "lastEntryDate": "2025-01-15T12:00:00.000Z",
      "createdAt": "..."
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

**Errors:** `403` — not admin.

---

### `PUT /api/admin/users/[id]`

Update a user's role, ban status, ban reason, and/or ban expiry.

**Auth:** Admin only

**Request body (all optional):**
```json
{
  "role": "user | admin",
  "banned": true,
  "banReason": "violation of terms",
  "banExpires": "2025-02-15T00:00:00.000Z"
}
```

If `banned` is `true` and no `banExpires` is given, defaults to 30 days from now. Setting `banned: false` clears `banReason` and `banExpires`. All mutations are logged via the audit trail.

**Response `200`:**
```json
{ "user": { ... } }
```

**Errors:** `403` — not admin; `400` — validation error.

---

### `DELETE /api/admin/users/[id]`

Permanently delete a user and all associated data.

**Auth:** Admin only

**Response `200`:**
```json
{ "deleted": true }
```

**Errors:** `403` — not admin; `404` — user not found.

---

## Admin — Invite Codes

### `GET /api/admin/invite-codes`

List all invite codes.

**Auth:** Admin only

**Response `200`:** Array of invite code objects.

**Errors:** `403` — not admin.

---

### `POST /api/admin/invite-codes`

Generate a new invite code.

**Auth:** Admin only

**Request body (all optional):**
```json
{
  "maxUses": 1,
  "expiresAt": "2025-02-01T00:00:00.000Z"
}
```

Defaults: `maxUses: 1`, expires 7 days from now.

**Response `200`:**
```json
{
  "id": "uuid",
  "code": "AB12CD34",
  "maxUses": 1,
  "uses": 0,
  "active": true,
  "expiresAt": "...",
  "createdBy": "uuid",
  "createdAt": "..."
}
```

**Errors:** `403` — not admin; `400` — validation error.

---

### `DELETE /api/admin/invite-codes/[id]`

Revoke an invite code by setting it to inactive.

**Auth:** Admin only

**Response `200`:**
```json
{ "revoked": true }
```

**Errors:** `403` — not admin.

---

## Admin — SSO

### `GET /api/admin/sso`

List SSO provider configurations (Google, GitHub).

**Auth:** Admin only

**Response `200`:**
```json
[
  { "provider": "google", "enabled": true },
  { "provider": "github", "enabled": false }
]
```

**Errors:** `403` — not admin.

---

### `PUT /api/admin/sso`

Enable or disable an SSO provider.

**Auth:** Admin only

**Request body:**
```json
{
  "provider": "google | github",
  "enabled": true
}
```

**Response `200`:**
```json
{ "provider": "google", "enabled": true }
```

**Errors:** `403` — not admin; `400` — validation error.

---

## Admin — Settings

### `GET /api/admin/settings/[key]`

Get the value of an application setting by key.

**Auth:** None (public read)

**Response `200`:**
```json
{ "key": "invite_only", "value": "true" }
```

If the key does not exist, `value` is `null`.

---

### `PUT /api/admin/settings/[key]`

Set or update an application setting. All mutations are logged via the audit trail.

**Auth:** Admin only

**Request body:**
```json
{ "value": "true" }
```

**Response `200`:**
```json
{ "key": "invite_only", "value": "true" }
```

**Errors:** `403` — not admin.
