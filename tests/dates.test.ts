import test from "node:test"
import assert from "node:assert/strict"
import {
  dateRangeStart,
  dayOfWeekIndex,
  formatLocalDate,
  isValidDateOnly,
  isValidTimeZone,
  monthBounds,
  parseDateOnly,
  shiftDateOnly,
  todayInTimeZone,
  utcDateOnly,
} from "../lib/dates"

test("date-only validation rejects impossible dates and non-date strings", () => {
  assert.equal(isValidDateOnly("2024-02-29"), true)
  assert.equal(isValidDateOnly("2025-02-29"), false)
  assert.equal(isValidDateOnly("2026-13-01"), false)
  assert.equal(isValidDateOnly("2026-1-01"), false)
  assert.equal(isValidDateOnly(null), false)
})

test("parseDateOnly uses noon UTC for compatibility", () => {
  assert.equal(parseDateOnly("2026-03-08").toISOString(), "2026-03-08T12:00:00.000Z")
  assert.throws(() => parseDateOnly("2026-02-30"), RangeError)
})

test("todayInTimeZone resolves UTC boundaries and DST without host-local parsing", () => {
  const instant = new Date("2026-01-01T02:30:00.000Z")
  assert.equal(todayInTimeZone("America/Los_Angeles", instant), "2025-12-31")
  assert.equal(todayInTimeZone("Asia/Tokyo", instant), "2026-01-01")
  assert.equal(todayInTimeZone("America/New_York", new Date("2026-03-08T06:59:00.000Z")), "2026-03-08")
  assert.equal(todayInTimeZone("America/New_York", new Date("2026-03-08T07:00:00.000Z")), "2026-03-08")
  assert.equal(isValidTimeZone("Not/A_Timezone"), false)
  assert.throws(() => todayInTimeZone("Not/A_Timezone"), RangeError)
})

test("calendar shifts and month bounds stay stable across DST", () => {
  assert.equal(shiftDateOnly("2026-03-07", 1), "2026-03-08")
  assert.equal(shiftDateOnly("2026-01-01", -1), "2025-12-31")
  assert.equal(shiftDateOnly("2024-02-28", 1), "2024-02-29")
  assert.deepEqual(monthBounds("2024-02"), { start: "2024-02-01", end: "2024-02-29" })
  assert.deepEqual(monthBounds("2026-04"), { start: "2026-04-01", end: "2026-04-30" })
  assert.throws(() => monthBounds("2026-13"), RangeError)
})

test("formatLocalDate always formats in UTC", () => {
  assert.equal(
    formatLocalDate("2026-01-02", { weekday: "long", timeZone: "America/Los_Angeles" }),
    "Friday"
  )
  assert.equal(formatLocalDate("2026-01-02", { dateStyle: "long" }), "January 2, 2026")
})

test("range starts are inclusive calendar dates", () => {
  const now = new Date("2026-01-10T12:00:00.000Z")
  assert.equal(dateRangeStart("today", "UTC", now), "2026-01-10")
  assert.equal(dateRangeStart("yesterday", "UTC", now), "2026-01-09")
  assert.equal(dateRangeStart("7d", "UTC", now), "2026-01-04")
  assert.equal(dateRangeStart("30d", "UTC", now), "2025-12-12")
  assert.equal(dateRangeStart("month", "UTC", now), "2026-01-01")
  assert.throws(() => dateRangeStart("unknown", "UTC", now), RangeError)
})

test("day indexes are Sunday-based and legacy fallback uses UTC", () => {
  assert.equal(dayOfWeekIndex("2026-01-04"), 0)
  assert.equal(dayOfWeekIndex("2026-01-05"), 1)
  assert.equal(utcDateOnly(new Date("2026-01-01T23:59:59.000Z")), "2026-01-01")
  assert.equal(utcDateOnly("2026-01-01"), "2026-01-01")
})
