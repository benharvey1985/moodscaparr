import test from "node:test"
import assert from "node:assert/strict"
import { computeStreak, getEntriesThisWeek } from "../lib/stats"

test("streaks use unique local dates and the shared two-rest-day rule", () => {
  const result = computeStreak([
    { localDate: "2026-01-10" },
    { localDate: "2026-01-09" },
    { localDate: "2026-01-07" },
    { localDate: "2026-01-05" },
    { localDate: "2026-01-04" },
    { localDate: "2026-01-04" },
  ], "UTC", 2, new Date("2026-01-10T12:00:00.000Z"))

  assert.deepEqual(result, { current: 5, longest: 5 })
})

test("rest allowance resets after consecutive logged days", () => {
  const result = computeStreak([
    { localDate: "2026-01-10" },
    { localDate: "2026-01-09" },
    { localDate: "2026-01-06" },
    { localDate: "2026-01-04" },
    { localDate: "2026-01-03" },
  ], "UTC", 2, new Date("2026-01-10T12:00:00.000Z"))

  assert.deepEqual(result, { current: 3, longest: 3 })
})

test("a stale latest entry ends the current streak but preserves longest history", () => {
  const result = computeStreak([
    { localDate: "2026-01-05" },
    { localDate: "2026-01-04" },
    { localDate: "2026-01-03" },
  ], "UTC", 2, new Date("2026-01-10T12:00:00.000Z"))

  assert.deepEqual(result, { current: 0, longest: 3 })
})

test("profile timezone controls today only; historical localDate never shifts", () => {
  const result = computeStreak([
    { localDate: "2025-12-31", date: new Date("2026-01-01T00:00:00.000Z") },
    { localDate: "2025-12-30", date: new Date("2026-01-01T00:00:00.000Z") },
  ], "America/Los_Angeles", 2, new Date("2026-01-01T02:00:00.000Z"))

  assert.deepEqual(result, { current: 2, longest: 2 })
})

test("legacy entries without localDate fall back to their UTC calendar date", () => {
  const result = computeStreak([
    { date: new Date("2026-01-09T23:30:00.000Z") },
    { date: new Date("2026-01-08T01:00:00.000Z") },
  ], "UTC", 2, new Date("2026-01-10T12:00:00.000Z"))

  assert.deepEqual(result, { current: 2, longest: 2 })
})

test("entries this week counts entries, including preserved same-day duplicates", () => {
  const count = getEntriesThisWeek([
    { localDate: "2026-01-05" },
    { localDate: "2026-01-05" },
    { localDate: "2026-01-04" },
    { localDate: "2026-01-07" },
  ], "UTC", new Date("2026-01-07T12:00:00.000Z"))

  assert.equal(count, 3)
})
