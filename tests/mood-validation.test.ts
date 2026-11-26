import test from "node:test"
import assert from "node:assert/strict"
import {
  createMoodEntrySchema,
  createMoodEntryBaseSchema,
  moodImportChunkSchema,
  moodEntryWriteData,
  normalizeImportedEntry,
  refineMoodSelection,
  serializeMoodEntry,
  updateMoodEntrySchema,
} from "../lib/mood-validation"
import type { MoodEntry } from "../types/mood"

const validEntry = {
  category: "NEUTRAL" as const,
  moodIndex: 5,
  intensity: 5,
  localDate: "2026-01-10",
}

test("mood indexes are validated against their category", () => {
  assert.equal(createMoodEntrySchema.safeParse(validEntry).success, true)
  assert.equal(createMoodEntrySchema.safeParse({ ...validEntry, moodIndex: 6 }).success, false)
  assert.equal(createMoodEntrySchema.safeParse({ ...validEntry, category: "POSITIVE", moodIndex: 6 }).success, true)
  assert.equal(createMoodEntrySchema.safeParse({ ...validEntry, category: "NEGATIVE", moodIndex: 5 }).success, true)
  assert.equal(createMoodEntrySchema.safeParse({ ...validEntry, category: null }).success, false)
})

test("wizard-style step schemas pick from the unrefined base and retain mood validation", () => {
  const step1Schema = createMoodEntryBaseSchema.pick({
    category: true,
    moodIndex: true,
    intensity: true,
    localDate: true,
  }).superRefine(refineMoodSelection)

  assert.equal(step1Schema.safeParse(validEntry).success, true)
  assert.equal(step1Schema.safeParse({ ...validEntry, moodIndex: 6 }).success, false)
})

test("new and updated entries require a valid localDate", () => {
  assert.equal(createMoodEntrySchema.safeParse({ category: "NEUTRAL", moodIndex: 0, intensity: 5 }).success, false)
  assert.equal(createMoodEntrySchema.safeParse({ ...validEntry, localDate: "2026-02-29" }).success, false)
  assert.equal(updateMoodEntrySchema.safeParse({ intensity: 6 }).success, false)
  assert.equal(updateMoodEntrySchema.safeParse({ localDate: validEntry.localDate, intensity: 6 }).success, true)
})

test("optional fields accept explicit null and activities clear with an empty array", () => {
  const parsed = createMoodEntrySchema.parse({
    ...validEntry,
    activities: [],
    weather: null,
    sleepHours: null,
    sleepQuality: null,
    energyLevel: null,
    stressLevel: null,
    reflection1: null,
  })
  const data = moodEntryWriteData(parsed)
  assert.deepEqual(data.activities, [])
  assert.equal(data.weather, null)
  assert.equal(data.sleepHours, null)
  assert.equal(data.reflection1, null)
  assert.equal(data.date.toISOString(), "2026-01-10T12:00:00.000Z")
})

test("serialization emits localDate and derives legacy values from UTC", () => {
  const entry: Omit<MoodEntry, "date" | "createdAt" | "updatedAt" | "localDate"> & {
    date: Date
    createdAt: Date
    updatedAt: Date
    localDate: string | null
  } = {
    id: "entry-1",
    userId: "user-1",
    category: "NEUTRAL",
    moodIndex: 0,
    intensity: 5,
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
    date: new Date("2026-01-01T23:30:00.000Z"),
    createdAt: new Date("2026-01-01T23:30:00.000Z"),
    updatedAt: new Date("2026-01-01T23:30:00.000Z"),
    localDate: null,
  }
  assert.equal(serializeMoodEntry(entry).localDate, "2026-01-01")
  assert.equal(serializeMoodEntry({ ...entry, localDate: "2025-12-31" }).localDate, "2025-12-31")
})

test("legacy imports derive UTC localDate and preserve stable metadata", () => {
  const parsed = moodImportChunkSchema.parse({
    version: "1.0",
    data: {
      entries: [{
        id: "legacy-id",
        category: "POSITIVE",
        moodIndex: 0,
        intensity: 7,
        date: "2026-01-01T23:30:00.000Z",
        createdAt: "2025-12-01T10:00:00.000Z",
      }],
    },
  })
  const normalized = normalizeImportedEntry(parsed.data.entries[0])
  assert.equal(normalized.id, "legacy-id")
  assert.equal(normalized.localDate, "2026-01-01")
  assert.equal(normalized.date.toISOString(), "2026-01-01T12:00:00.000Z")
  assert.equal(normalized.createdAt?.toISOString(), "2025-12-01T10:00:00.000Z")
})

test("explicit imported localDate is authoritative over the compatibility instant", () => {
  const normalized = normalizeImportedEntry({
    id: "stable-id",
    category: "NEGATIVE",
    moodIndex: 0,
    intensity: 4,
    date: "2026-01-01T00:00:00.000Z",
    localDate: "2025-12-31",
  })
  assert.equal(normalized.localDate, "2025-12-31")
  assert.equal(normalized.date.toISOString(), "2025-12-31T12:00:00.000Z")
})

test("import request chunks reject more than 500 entries", () => {
  const entry = {
    category: "NEUTRAL" as const,
    moodIndex: 0,
    intensity: 5,
    date: "2026-01-01",
  }
  const result = moodImportChunkSchema.safeParse({
    version: "2.0",
    data: { entries: Array.from({ length: 501 }, () => entry) },
  })
  assert.equal(result.success, false)
})
