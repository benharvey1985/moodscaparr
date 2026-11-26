import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { utcDateOnly } from "@/lib/dates"
import { rateLimit } from "@/lib/rate-limit"
import { checkAndUnlockAchievementsSafely } from "@/lib/achievements"
import {
  moodImportChunkSchema,
  normalizeImportedEntry,
  type MoodImportEntry,
} from "@/lib/mood-validation"

const importLimiter = rateLimit({ interval: 60000, max: 120 })

function sameContent(entry: MoodImportEntry, normalized: ReturnType<typeof normalizeImportedEntry>, existing: {
  category: string
  moodIndex: number
  intensity: number
  localDate: string | null
  date: Date
  activities: string[]
  weather: string | null
  sleepHours: number | null
  sleepQuality: string | null
  energyLevel: number | null
  stressLevel: number | null
  reflection1: string | null
  reflection2: string | null
  reflection3: string | null
  reflection4: string | null
  createdAt: Date
}) {
  const localDate = existing.localDate ?? utcDateOnly(existing.date)
  const sortedExistingActivities = [...existing.activities].sort()
  const sameActivities =
    normalized.activities.length === existing.activities.length &&
    [...normalized.activities].sort().every(
      (activity, index) => activity === sortedExistingActivities[index]
    )

  return (
    normalized.category === existing.category &&
    normalized.moodIndex === existing.moodIndex &&
    normalized.intensity === existing.intensity &&
    normalized.localDate === localDate &&
    sameActivities &&
    normalized.weather === existing.weather &&
    normalized.sleepHours === existing.sleepHours &&
    normalized.sleepQuality === existing.sleepQuality &&
    normalized.energyLevel === existing.energyLevel &&
    normalized.stressLevel === existing.stressLevel &&
    normalized.reflection1 === existing.reflection1 &&
    normalized.reflection2 === existing.reflection2 &&
    normalized.reflection3 === existing.reflection3 &&
    normalized.reflection4 === existing.reflection4 &&
    (!entry.createdAt || normalized.createdAt?.getTime() === existing.createdAt.getTime())
  )
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const rate = await importLimiter.check(`import:${userId}`)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests", retryIn: rate.resetIn },
      { status: 429 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = moodImportChunkSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const counts = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`mood-entry:${userId}`}))`

    let imported = 0
    let skipped = 0
    let conflicts = 0

    for (const entry of parsed.data.data.entries) {
      const normalized = normalizeImportedEntry(entry)
      const existing = entry.id
        ? await tx.moodEntry.findUnique({ where: { id: entry.id } })
        : null

      if (existing) {
        if (existing.userId !== userId || !sameContent(entry, normalized, existing)) {
          conflicts++
        } else {
          skipped++
        }
        continue
      }

      await tx.moodEntry.create({
        data: {
          ...normalized,
          userId,
        },
      })
      imported++
    }

    return { imported, skipped, conflicts }
  })

  const newlyUnlocked = counts.imported > 0
    ? await checkAndUnlockAchievementsSafely(userId)
    : []
  return NextResponse.json({ ...counts, newlyUnlocked })
}
