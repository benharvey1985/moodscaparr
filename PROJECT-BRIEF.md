# Moodscaper — Project Brief

## Overview
A daily mood diary web/mobile app. Users log how they feel each day with optional context (activities, weather, sleep, wellbeing, reflections). Visualizes patterns through history, calendar heatmap, analytics/charts, achievement badges, and streak tracking. Includes an admin panel for user/instance management.

---

## Core Requirements

### Authentication
- Email/password registration and login
- Password reset flow
- Optional SSO (Google, GitHub — toggleable in admin)
- Role-based access: regular users + admins
- Optional invite-only registration (admin generates time-limited invite codes)
- First registered user becomes admin

### Mood Logging (3-step wizard)
1. **Pick mood** — 19 mood options across 3 categories (Positive/Neutral/Negative) with intensity (1–10) and date
2. **Add context** — multi-select activities, single-select weather, sleep hours/quality, energy level, stress level
3. **Reflect** — 4 free-text prompts: "What went well?", "What was challenging?", "What are you grateful for?", "What's on your mind?" (all optional)

### Quick Log (Dashboard)
- One-tap mood logging from the home page: pick category → pick mood → saves instantly with sensible defaults
- Should feel faster than the full wizard

### Edit & Delete Entries
- Edit: pre-fills the wizard with existing data
- Delete: confirmation dialog, permanent removal

### Dashboard (Home)
- Greeting (time-aware, shows user's first name)
- Today's status (logged or not)
- Quick Log section
- KPI cards: total entries, avg mood score, current streak, entries this week
- Recent entries list (last 5)
- Streak progress toward goal

### Entry History
- Full list sorted by date (newest first)
- Search by any text field (mood, reflections, activities, weather)
- Filter by mood category (Positive/Neutral/Negative)
- Click entry to view full detail (dialog or expand)
- Edit and delete actions
- CSV export

### Calendar Heatmap
- Monthly grid view
- Color-coded cells (mood category + intensity)
- Month navigation (prev/next)
- Month summary stats (top mood, entry count, avg intensity, top activity, avg sleep)
- Click a day to see that entry's details
- Today highlighted
- Color legend

### Analytics
Date range filter: 7d / 30d / 90d / All Time

**Overview tab:** Entry count, avg mood score, current/longest streak, best/worst day, mood balance bar (positive/neutral/negative %), mood frequency ranking, avg wellbeing stats (sleep, energy, stress)

**Trends tab (charts):** Mood timeline (line), day-of-week comparison (bar), weather correlation (bar), wellbeing trends (line), activity impact (bar)

**Reflections tab:** Emotional transition matrix, word cloud, recent reflections

**PDF report** — downloadable summary of the filtered period

### User Profile
- Edit: full name, country (auto-selects timezone/date format), theme preference, timezone, date format
- Customizable streak goal
- Daily reminder toggle (browser notification) with custom time
- Achievement summary (count + progress)
- Data backup: export and restore (JSON file)

### Achievements
14 badges across 4 groups:

| Group | Badges |
|-------|--------|
| **Milestones** | Log 1 / 10 / 50 / 100 entries |
| **Streaks** | 7-day streak / 30-day streak / 60-day streak / 30-day longest streak |
| **Exploration** | Log all 19 moods / Log in all 7 weathers / 5+ activities in one entry / 50 reflections total |
| **Special** | Log before 9am / Log after 10pm |

- Progress bars on each achievement
- Confetti + toast notification on unlock
- Overall completion percentage

### Streak Tracking
- Consecutive day tracking (current + longest)
- Visual progress bar toward user's goal
- Integrated with achievements

### Theme
- Light / Dark / System (follow OS)
- Full dark mode for all components

### Onboarding Tour
- 3-step modal on first login: welcome → log first mood → explore analytics
- Replayable

### Feedback System
- FAB button (fixed position)
- Submit: bug report (with severity) or feature suggestion (with category)
- Feedback history page
- Opens GitHub issue URL on submission

### Admin Panel
**Dashboard:** KPIs (total users, active users, total entries, avg streak), mood trend chart, mood distribution pie, registration trend, activity density heatmap, CSV export

**User Management:** Table with search, role filter, promote/demote, suspend/activate, delete (with undo), user detail panel

**Instance Settings:** SSO config (Google/GitHub OAuth), invite-only mode, invite code generation/revocation

### Seed / Test Data
- Toggle to generate 60 days of sample entries
- Toggle off clears them

---

## 🔴 NON-NEGOTIABLE: Visual Unification of Mood Elements

Every visual element that represents a **mood category**, **mood bubble**, **card**, **badge**, or **color token** must be **exactly the same across every single screen**. This is the single most important design constraint:

### The 3 Category Colors
Every mood-related UI element uses exactly **3 color sets** — one per category:

- **Positive** — green tones (light background, dark text, accent ring)
- **Neutral** — amber tones
- **Negative** — red/pink tones

These same 3 color sets must appear on:
- Mood selection buttons (in the wizard AND on the home page quick log — identical visual treatment)
- Intensity badges next to mood names
- Calendar heatmap cells (3 shade intensities per category)
- Activity tags in detail views
- Mood distribution bars in analytics
- Stat cards referencing mood
- Any other element referencing a mood category

No variation, no deviation, no page-specific redesign of mood bubbles.

### Card Consistency
Card corner rounding must follow a consistent token system across all pages:
- **Most rounded (pill shape):** full entry cards in history, profile blocks
- **Moderately rounded:** log wizard step container, calendar heatmap grid, feature blocks
- **Standard rounded:** stat cards, KPI cards, admin cards
- **Slightly rounded:** minor containers

The same card types should have the same rounding on every page.

### Mood Selector Button Design
Mood selection buttons must be identical everywhere:
- Same grid layout, same proportions, same hover/active animations
- Same emoji size, same text size, same spacing
- Same border color strategy per category

---

## What the Developer Owns
- **Architecture:** Free to choose any stack (React/Vue/Svelte/Swift/Kotlin/etc.)
- **Persistence:** Any storage (localStorage, SQLite, PostgreSQL, Firebase, etc.)
- **Design concepts:** Free to interpret the visual style, typography, layout, spacing, animations, iconography — as long as the color/card unification above is respected
- **Component library:** Any UI library or custom components
