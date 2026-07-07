---
status: fixing
trigger: Bug #1: Dashboard Issue — KPI cards not refreshing after quick log
created: 2026-07-07
updated: 2026-07-07
---

## Current Focus

**Hypothesis:** `useCreateMoodEntry`, `useUpdateMoodEntry`, and `useDeleteMoodEntry` in `hooks/use-mood-entry.ts` only invalidate `["mood-entries"]` on success. The KPI cards use `useStats()` with query key `["stats"]`, which is never invalidated. After a quick log, the entry list refreshes but the KPI cards stay stale.

**Test:** Add `queryClient.invalidateQueries({ queryKey: ["stats"] })` to the `onSettled` callback of all three mutations.

## Evidence

- `hooks/use-mood-entry.ts:64-66` — `onSettled` only invalidates `moodKeys.all` (`["mood-entries"]`)
- `hooks/use-mood-entry.ts:93-95` — same for update
- `hooks/use-mood-entry.ts:119-121` — same for delete
- `hooks/use-streak.ts:18-22` — `useStats` uses `queryKey: ["stats"]`
- Dashboard KPI cards at `app/dashboard/page.tsx:131-170` use `useStats()`

## Resolution

**Fix:** Add `["stats"]` invalidation to all three `onSettled` handlers.

**Files changed:**
- `hooks/use-mood-entry.ts`
