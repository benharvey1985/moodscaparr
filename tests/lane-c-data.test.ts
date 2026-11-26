import test from "node:test"
import assert from "node:assert/strict"
import {
  averagePresent,
  groupMoodByDay,
  groupMoodByDayOfWeek,
  groupWellbeingByDay,
} from "../components/analytics/analytics-data"
import {
  getCalendarDays,
  indexEntriesByLocalDate,
  shiftCalendarMonth,
} from "../components/calendar/calendar-data"
import { countCsvEntries } from "../components/history/csv"
import {
  calendarDateFilter,
  earliestEffectiveEntryDate,
} from "../lib/api/calendar"
import { analyticsDateFilter } from "../lib/api/analytics"
import { serializeMoodEntry } from "../lib/mood-validation"

test("metric averages exclude missing values and disclose their denominator", () => {
  assert.deepEqual(averagePresent([6, null, 8, undefined]), { average: 7, count: 2 })
  assert.deepEqual(averagePresent([null, undefined]), { average: null, count: 0 })
})

test("mood charts group by authoritative localDate rather than compatibility instants", () => {
  const entries = [
    { localDate: "2026-11-25", date: "2026-11-24T23:30:00.000Z", category: "POSITIVE", intensity: 8 },
    { localDate: "2026-11-25", date: "2026-11-25T12:30:00.000Z", category: "NEGATIVE", intensity: 3 },
    { localDate: "2026-11-26", date: "2026-11-26T12:30:00.000Z", category: "NEUTRAL", intensity: 5 },
  ]

  assert.deepEqual(groupMoodByDay(entries), [
    { date: "2026-11-25", score: 8, count: 2 },
    { date: "2026-11-26", score: 5, count: 1 },
  ])
  assert.deepEqual(groupMoodByDayOfWeek(entries), [
    { day: "Wednesday", score: 8, count: 2 },
    { day: "Thursday", score: 5, count: 1 },
  ])
})

test("wellbeing grouping keeps missing metrics null with independent counts", () => {
  const result = groupWellbeingByDay([
    { localDate: "2026-11-25", category: "NEUTRAL", intensity: 5, energyLevel: 4, stressLevel: null, sleepHours: 7 },
    { localDate: "2026-11-25", category: "NEUTRAL", intensity: 5, energyLevel: 8, stressLevel: 6, sleepHours: null },
    { localDate: "2026-11-26", category: "NEUTRAL", intensity: 5, energyLevel: null, stressLevel: null, sleepHours: null },
  ])

  assert.deepEqual(result, [
    { date: "2026-11-25", energy: 6, stress: 6, sleep: 7, energyCount: 2, stressCount: 1, sleepCount: 1 },
    { date: "2026-11-26", energy: null, stress: null, sleep: null, energyCount: 0, stressCount: 0, sleepCount: 0 },
  ])
})

test("calendar indexing stores entries by localDate and ignores invalid dates", () => {
  const first = { id: "first", localDate: "2026-11-25" }
  const duplicate = { id: "duplicate", localDate: "2026-11-25" }
  const invalid = { id: "invalid", localDate: null }
  const index = indexEntriesByLocalDate([first, duplicate, invalid])

  assert.equal(index.get("2026-11-25"), first)
  assert.equal(index.size, 1)
})

test("calendar month helpers handle year boundaries and leap years", () => {
  assert.equal(shiftCalendarMonth("2026-01", -1), "2025-12")
  assert.equal(shiftCalendarMonth("2024-12", 1), "2025-01")

  const leapDays = getCalendarDays("2024-02").filter((day) => day.isCurrentMonth)
  assert.equal(leapDays.length, 29)
  assert.equal(leapDays[0].date, "2024-02-01")
  assert.equal(leapDays[28].date, "2024-02-29")
})

test("CSV entry counting handles quoted multiline fields and escaped quotes", () => {
  const csv = 'date,reflection\r\n2026-11-25,"line one\r\nline ""two"""\r\n2026-11-26,plain'
  assert.equal(countCsvEntries(csv), 2)
  assert.equal(countCsvEntries("date,reflection\r\n"), 0)
  assert.equal(countCsvEntries(""), 0)
})

test("calendar query includes legacy null-localDate rows inside the UTC month", () => {
  const filter = calendarDateFilter("2026-11")
  assert.deepEqual(filter.OR[0], { localDate: { gte: "2026-11-01", lte: "2026-11-30" } })

  const legacyBranch = filter.OR[1]
  assert.equal(legacyBranch.localDate, null)
  assert.ok("date" in legacyBranch)
  assert.equal(legacyBranch.date.gte.toISOString(), "2026-11-01T00:00:00.000Z")
  assert.equal(legacyBranch.date.lt.toISOString(), "2026-12-01T00:00:00.000Z")

  const legacyDate = new Date("2026-11-15T18:30:00.000Z")
  assert.equal(legacyDate >= legacyBranch.date.gte && legacyDate < legacyBranch.date.lt, true)
  assert.equal(new Date("2026-12-01T00:00:00.000Z") < legacyBranch.date.lt, false)
})

test("calendar firstEntryDate uses the earliest dated or legacy effective date", () => {
  assert.equal(earliestEffectiveEntryDate([
    { localDate: "2026-11-20", date: new Date("2026-11-20T12:00:00.000Z") },
    { localDate: null, date: new Date("2026-11-03T23:30:00.000Z") },
  ]), "2026-11-03")
  assert.equal(earliestEffectiveEntryDate([]), null)
})

test("ranged analytics includes legacy rows from the UTC range start and all-time includes both", () => {
  const filter = analyticsDateFilter("2026-11-20")
  assert.deepEqual(filter.OR?.[0], { localDate: { gte: "2026-11-20" } })

  const legacyBranch = filter.OR?.[1]
  assert.ok(legacyBranch)
  assert.equal(legacyBranch.localDate, null)
  assert.ok("date" in legacyBranch)
  assert.equal(legacyBranch.date.gte.toISOString(), "2026-11-20T00:00:00.000Z")

  const legacyDate = new Date("2026-11-21T02:00:00.000Z")
  assert.equal(legacyDate >= legacyBranch.date.gte, true)
  assert.equal(new Date("2026-11-19T23:59:59.999Z") >= legacyBranch.date.gte, false)
  assert.deepEqual(analyticsDateFilter(null), {})
})

test("legacy null-localDate entries serialize with their UTC compatibility date before backfill", () => {
  const serialized = serializeMoodEntry({
    id: "legacy",
    userId: "user",
    category: "NEUTRAL",
    moodIndex: 0,
    intensity: 5,
    localDate: null,
    date: new Date("2026-11-15T23:30:00.000Z"),
    activities: [],
    weather: null,
    sleepHours: null,
    sleepQuality: null,
    energyLevel: null,
    stressLevel: null,
    reflection1: null,
    reflection2: null,
    reflection3: null,
    reflection4: null,
    createdAt: new Date("2026-11-15T23:30:00.000Z"),
    updatedAt: new Date("2026-11-15T23:30:00.000Z"),
  })

  assert.equal(serialized.localDate, "2026-11-15")
  assert.equal(serialized.date, "2026-11-15T23:30:00.000Z")
})
