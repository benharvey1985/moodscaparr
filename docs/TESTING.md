<!-- generated-by: gsd-doc-writer -->

# Testing

This project has no formal test framework. Testing is performed through compilation verification, linting, and manual walkthroughs.

## Prerequisites

Before running any commands, ensure your `.env` file is configured:

```bash
cp .env.example .env
# Generate a secret: openssl rand -hex 32
```

Start the database and application services:

```bash
docker compose up -d
```

Apply database migrations:

```bash
npx prisma migrate dev
```

Seed the database with sample data (60 days of mood entries for the admin user):

```bash
npx tsx prisma/seed.ts
```

## Build Verification

Run the production build to verify TypeScript compilation and Next.js bundling succeed:

```bash
npm run build
```

Expected output: a successful build with no errors. On failure, check the terminal output for the specific file and error. Common issues:

- TypeScript type errors — fix the reported type mismatches
- Missing modules — run `npm install`
- Prisma client not generated — run `npx prisma generate`

## Linting

Run ESLint to check for code quality and pattern issues:

```bash
npm run lint
```

The lint config (`eslint.config.mjs`) uses `eslint-config-next` with core-web-vitals and TypeScript rules. Ignored paths: `.next/`, `out/`, `build/`, `next-env.d.ts`.

## Development Server

For manual testing, start the dev server:

```bash
npm run dev
```

The app is served at `http://localhost:3000` (or `http://localhost:8080` via Docker).

## Manual Testing Checklist

### Authentication

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Registration | Navigate to `/auth/register`, fill in name/email/password, submit | User is created, redirected to dashboard |
| Login | Navigate to `/auth/login`, enter credentials, submit | Session created, redirected to dashboard |
| Logout | Click logout in header | Session cleared, redirected to login |
| Password reset | Navigate to `/auth/reset-password`, enter email | Reset email sent (check server logs if email transport is configured) |
| Session persistence | Close tab, reopen, navigate to `/dashboard` | Session restored, dashboard loads |
| Redirect on unauthenticated | Visit `/dashboard` while logged out | Redirected to `/auth/login` |

### Mood Entries

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Quick log from dashboard | Select a category, then pick a mood emoji | Entry saved, appears in recent entries, stats update |
| Full wizard entry | Navigate to `/wizard`, fill in mood, intensity, activities, optional fields, submit | Entry saved, redirected to dashboard |
| Edit entry | Click edit on an entry card, modify fields, save | Entry updated in list |
| Delete entry | Click delete on an entry card, confirm in dialog | Entry removed from list, stats recalculated |
| Edit via wizard | Navigate to `/wizard?id=<entry-id>`, modify, submit | Entry updated |

### Dashboard

| Test | Steps | Expected Result |
|------|-------|-----------------|
| KPI cards | Log in with seeded data | Total entries, avg mood score, streak, weekly count display |
| Streak goal bar | View dashboard | Current streak vs goal shown with animated progress bar |
| Recent entries | Log several entries | 5 most recent entries displayed as cards |
| Empty state | Log in as new user with no entries | "Log your first mood!" prompt with link to wizard |
| Refresh | Click refresh button on recent entries | Data refetched from API |
| Error state | Stop the database and refresh | Error card with "Try Again" button appears |

### Achievements

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View achievements | Navigate to `/achievements` | List of all badges with progress shown |
| Achievement unlock | Log first entry as a new user | "First Entry" badge unlocks (checked on next load) |
| Progress tracking | Continue logging entries | Progress bars advance toward thresholds (10, 50, 100 entries) |
| Streak achievements | Log entries on consecutive days | "Week Warrior" (7 days) and "Month Master" (30 days) progress |

### History

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View history | Navigate to `/history` | Paginated list of all mood entries |
| Search | Type a query in the search bar | Entries filtered by matching text |
| Category filter | Select Positive/Neutral/Negative | Entries filtered by mood category |
| CSV export | Click export button | CSV file downloaded with all entry data |
| Load more | Click "Load More" at bottom | Next page of entries appended |

### Calendar

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View calendar | Navigate to `/calendar` | Month grid with mood-color-coded days |
| Navigate months | Click previous/next month arrows | Calendar updates to selected month |
| View day details | Click a day with entries | Entries for that day displayed |
| Log from calendar | Click a day, use quick-log | Entry created for that date |

### Settings

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Update profile | Navigate to `/settings`, edit name/country/timezone/streak goal, save | Profile updated |
| View achievements | Navigate to `/settings` | Achievement summary shown |
| Export data | Click export | JSON file downloaded with all user data |
| Import data | Click import, select a JSON file | Data imported and entries updated |
| Delete account | Click delete account, confirm | Account and all data deleted |

### Admin Panel

Access requires an admin role. The first registered user is automatically granted admin.

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Admin dashboard | Navigate to `/admin` | Stats: total users, active users, total entries, avg streak, registration trend, mood distribution |
| User management | Go to Users tab | User list with search, role/banned filters |
| Update user role | Change a user's role | Role updated in database |
| Ban user | Toggle banned status | User cannot log in |
| Delete user | Delete a user | User removed from system |
| SSO configuration | Go to SSO tab | List of SSO providers with enable/disable toggles |
| Toggle SSO | Enable a provider | Provider marked enabled in database |

### Invitations

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View invite codes | Go to Admin > Invite Codes tab | List of codes with usage, expiry, status |
| Toggle invite-only mode | Switch the toggle | Setting saved, registration page shows invite prompt |
| Generate code | Set max uses and expiry, click Generate | New code appears in table |
| Copy code | Click copy icon | Code copied to clipboard |
| Register with invite | Navigate to `/auth/register` with invite-only on, enter valid code | Registration proceeds |
| Register without invite | Navigate to `/auth/register` with invite-only on, no code | Registration blocked |
| Revoke code | Click trash icon on an active code | Code marked revoked, no longer usable |
| Exhausted/expired status | View codes table | Badges show Exhausted (uses >= maxUses) or Expired (past expiry date) |

### Analytics

| Test | Steps | Expected Result |
|------|-------|-----------------|
| View analytics | Navigate to `/analytics` | Overview tab with summary stats |
| Overview tab | Default view | Mood distribution, streak info, entry counts |
| Trends tab | Click Trends | Charts showing mood trends over time |
| Reflections tab | Click Reflections | List of reflections from mood entries |
| Date range filter | Change the date range dropdown | Data refreshes for selected range (7d, 30d, 90d, all) |
| Refresh | Click refresh button | Data refetched from API |

### Onboarding

| Test | Steps | Expected Result |
|------|-------|-----------------|
| First-time tour | Register a new user, navigate to dashboard | Onboarding tour overlay appears |
| Complete tour | Click through all tour steps | Tour dismissed, `onboardingComplete` saved |
| Skip tour | Click skip | Tour dismissed without marking complete |

## API Endpoints

Key endpoints for ad-hoc API testing with `curl`:

```bash
# Health check
curl http://localhost:3000/api/health

# Mood entries (requires auth — get cookie first)
curl -b .next/cookies http://localhost:3000/api/mood-entries

# Admin stats (admin role required)
curl -b .next/cookies http://localhost:3000/api/admin/stats

# Analytics
curl -b .next/cookies 'http://localhost:3000/api/analytics?range=30d'

# Achievements
curl -b .next/cookies http://localhost:3000/api/achievements
```

## Known Limitations

- No automated test suite exists (no test framework in `package.json`)
- No CI/CD pipeline configured
- Rate limiting is implemented server-side (`lib/rate-limit.ts`) — multiple rapid requests may be throttled
- The first user created when the database is empty is automatically assigned the admin role
