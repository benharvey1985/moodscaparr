import { z } from "zod"
import { isValidDateOnly, parseDateOnly, utcDateOnly } from "@/lib/dates"
import {
  MOODS,
  SLEEP_QUALITIES,
  WEATHERS,
  type CreateMoodEntryInput,
  type MoodCategory,
  type MoodEntry,
} from "@/types/mood"

const categorySchema = z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"])
const localDateSchema = z.string().refine(isValidDateOnly, {
  message: "localDate must be a valid YYYY-MM-DD date",
})
const nullableWeatherSchema = z.enum(WEATHERS).nullable().optional()
const nullableSleepQualitySchema = z.enum(SLEEP_QUALITIES).nullable().optional()
const nullableReflectionSchema = z.string().max(500).nullable().optional()
const activitiesSchema = z
  .array(z.string().trim().min(1).max(100))
  .max(50)
  .optional()

const moodFields = {
  category: categorySchema,
  moodIndex: z.number().int().min(0),
  intensity: z.number().int().min(1).max(10),
}

export function isValidMoodSelection(
  category: unknown,
  moodIndex: unknown
): category is MoodCategory {
  if (
    typeof category !== "string" ||
    !Object.prototype.hasOwnProperty.call(MOODS, category) ||
    typeof moodIndex !== "number" ||
    !Number.isInteger(moodIndex)
  ) {
    return false
  }

  const moods = MOODS[category as MoodCategory]
  return moodIndex >= 0 && moodIndex < moods.length
}

export function refineMoodSelection(
  data: { category?: unknown; moodIndex?: unknown },
  ctx: z.RefinementCtx
) {
  if (data.category !== undefined && data.moodIndex !== undefined && !isValidMoodSelection(data.category, data.moodIndex)) {
    ctx.addIssue({
      code: "custom",
      message: "moodIndex must belong to the selected category",
      path: ["moodIndex"],
    })
  }
}

export const moodSelectionSchema = z
  .object(moodFields)
  .superRefine(refineMoodSelection)

/** Unrefined object schema for consumers that need pick/partial/extend. */
export const createMoodEntryBaseSchema = z.object({
  ...moodFields,
  localDate: localDateSchema,
  activities: activitiesSchema,
  weather: nullableWeatherSchema,
  sleepHours: z.number().finite().min(0).max(24).nullable().optional(),
  sleepQuality: nullableSleepQualitySchema,
  energyLevel: z.number().int().min(1).max(10).nullable().optional(),
  stressLevel: z.number().int().min(1).max(10).nullable().optional(),
  reflection1: nullableReflectionSchema,
  reflection2: nullableReflectionSchema,
  reflection3: nullableReflectionSchema,
  reflection4: nullableReflectionSchema,
})

export const createMoodEntrySchema = createMoodEntryBaseSchema.superRefine(refineMoodSelection)

const updateMoodEntryBaseSchema = createMoodEntryBaseSchema.partial().required({
  localDate: true,
})

export const updateMoodEntrySchema = updateMoodEntryBaseSchema.superRefine(refineMoodSelection)

const optionalDateTimeSchema = z.string().refine((value) => {
  if (isValidDateOnly(value)) return true
  return Number.isFinite(new Date(value).getTime())
}, "Must be a valid date or ISO timestamp")

export const moodImportEntrySchema = z
  .object({
    id: z.string().min(1).max(200).optional(),
    ...moodFields,
    date: z.string().min(1),
    localDate: localDateSchema.optional(),
    createdAt: optionalDateTimeSchema.optional(),
    updatedAt: optionalDateTimeSchema.optional(),
    activities: activitiesSchema,
    weather: nullableWeatherSchema,
    sleepHours: z.number().finite().min(0).max(24).nullable().optional(),
    sleepQuality: nullableSleepQualitySchema,
    energyLevel: z.number().int().min(1).max(10).nullable().optional(),
    stressLevel: z.number().int().min(1).max(10).nullable().optional(),
    reflection1: nullableReflectionSchema,
    reflection2: nullableReflectionSchema,
    reflection3: nullableReflectionSchema,
    reflection4: nullableReflectionSchema,
  })
  .superRefine(refineMoodSelection)

export const moodImportChunkSchema = z.object({
  version: z.enum(["1.0", "2.0"]),
  data: z.object({
    entries: z.array(moodImportEntrySchema).max(500),
  }),
})

export const moodImportFileSchema = z.object({
  version: z.enum(["1.0", "2.0"]),
  data: z.object({
    entries: z.array(moodImportEntrySchema),
  }),
})

export type MoodImportEntry = z.infer<typeof moodImportEntrySchema>
export type MoodImportChunk = z.infer<typeof moodImportChunkSchema>

export function moodEntryWriteData(input: CreateMoodEntryInput) {
  return {
    category: input.category,
    moodIndex: input.moodIndex,
    intensity: input.intensity,
    localDate: input.localDate,
    date: parseDateOnly(input.localDate),
    activities: input.activities ?? [],
    weather: input.weather ?? null,
    sleepHours: input.sleepHours ?? null,
    sleepQuality: input.sleepQuality ?? null,
    energyLevel: input.energyLevel ?? null,
    stressLevel: input.stressLevel ?? null,
    reflection1: input.reflection1 ?? null,
    reflection2: input.reflection2 ?? null,
    reflection3: input.reflection3 ?? null,
    reflection4: input.reflection4 ?? null,
  }
}

type SerializableMoodEntry = Omit<
  MoodEntry,
  "date" | "createdAt" | "updatedAt" | "localDate"
> & {
  date: Date
  createdAt: Date
  updatedAt: Date
  localDate?: string | null
}

export function serializeMoodEntry(entry: SerializableMoodEntry): MoodEntry {
  const localDate = isValidDateOnly(entry.localDate)
    ? entry.localDate
    : utcDateOnly(entry.date)

  return {
    ...entry,
    localDate,
    date: entry.date.toISOString(),
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  }
}

export function normalizeImportedEntry(entry: MoodImportEntry) {
  const localDate = entry.localDate ?? utcDateOnly(entry.date)
  if (!isValidDateOnly(localDate)) throw new RangeError("Invalid imported localDate")

  return {
    ...moodEntryWriteData({
      category: entry.category,
      moodIndex: entry.moodIndex,
      intensity: entry.intensity,
      localDate,
      activities: entry.activities,
      weather: entry.weather,
      sleepHours: entry.sleepHours,
      sleepQuality: entry.sleepQuality,
      energyLevel: entry.energyLevel,
      stressLevel: entry.stressLevel,
      reflection1: entry.reflection1,
      reflection2: entry.reflection2,
      reflection3: entry.reflection3,
      reflection4: entry.reflection4,
    }),
    ...(entry.id ? { id: entry.id } : {}),
    ...(entry.createdAt ? { createdAt: new Date(entry.createdAt) } : {}),
    ...(entry.updatedAt ? { updatedAt: new Date(entry.updatedAt) } : {}),
  }
}
