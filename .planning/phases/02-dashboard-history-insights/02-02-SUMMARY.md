# 02-02: History & Calendar Heatmap — Summary

## Files Created

### Task 1: History Page
| File | Description |
|------|-------------|
| `app/api/mood-entries/search/route.ts` | GET `/api/mood-entries/search` — paginated search across reflections, weather, category filter |
| `lib/api/history.ts` | Client wrappers: `searchEntries()`, `fetchAllEntries()` |
| `hooks/use-history.ts` | TanStack Query hooks: `useSearchEntries()`, `useAllEntries()` |
| `components/history/search-bar.tsx` | Debounced (300ms) input with search icon and clear button |
| `components/history/filter-bar.tsx` | All / Positive / Neutral / Negative toggle buttons with category colors |
| `components/history/entry-detail-dialog.tsx` | Full detail Dialog: emoji, label, color strip, date, intensity bar, activities chips, weather/sleep/energy/stress, reflections, Edit→/wizard, Delete→DeleteDialog |
| `components/history/csv-export.tsx` | Button fetches all entries, builds CSV (Blob+URL), headers include all 14 columns |
| `components/history/entry-list.tsx` | EntryCard list with click→detail dialog, loading skeleton, empty state, error+retry |
| `app/history/page.tsx` | Client page: SearchBar+FilterBar+EntryList+CSV+Load More pagination, auth guard |
| `app/history/layout.tsx` | Minimal layout wrapper |
| `app/history/loading.tsx` | DashboardSkeleton |
| `app/history/error.tsx` | Error boundary with Try Again / Go Home |

### Task 2: Calendar Heatmap
| File | Description |
|------|-------------|
| `app/api/mood-entries/calendar/route.ts` | GET `/api/mood-entries/calendar?month=YYYY-MM` — entries for month + `firstEntryDate` |
| `lib/api/calendar.ts` | Client wrapper: `fetchCalendarEntries()` |
| `components/calendar/calendar-heatmap.tsx` | CSS grid (7 cols Sun-Sat), color-coded cells by category+intensity, month nav, today ring, hover tooltip, click handler |
| `components/calendar/month-stats.tsx` | Card: top mood, entry count, avg intensity, top activity, avg sleep |
| `components/calendar/color-legend.tsx` | 3 swatches: green Positive, amber Neutral, red Negative |
| `app/calendar/page.tsx` | Client page: month nav, MonthStats, ColorLegend, CalendarHeatmap, selected day dialog, auth guard, CAL-07 first entry month |
| `app/calendar/layout.tsx` | Minimal layout wrapper |
| `app/calendar/loading.tsx` | DashboardSkeleton |
| `app/calendar/error.tsx` | Error boundary with Try Again / Go Home |

### Modified
| File | Change |
|------|--------|
| `components/header.tsx` | Added History & Calendar nav links (desktop nav + dropdown menu) |

## Coverage
- **HIST-01** → `/history` page with full entry list, newest first
- **HIST-02** → Search across reflections, weather; category filter
- **HIST-03** → Detail dialog with edit/delete
- **HIST-04** → CSV export with all fields
- **CAL-01** → Calendar grid with color-coded cells
- **CAL-02** → Month navigation (prev/next arrows)
- **CAL-03** → Month stats (top mood, count, avg intensity, top activity, avg sleep)
- **CAL-04** → Color legend
- **CAL-05** → Today highlighted (ring-2 ring-primary)
- **CAL-06** → Click day shows entry detail
- **CAL-07** → Default view starts from user's first entry month

## Build
```
npm run build → ✓ Compiled successfully
```
