import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"
import { checkAndUnlockAchievements } from "@/lib/achievements"

const importLimiter = rateLimit({ interval: 60000, max: 5 })

const importSchema = z.object({
  version: z.string(),
  data: z.object({
    entries: z.array(z.object({
      category: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
      moodIndex: z.number().int().min(0).max(18),
      intensity: z.number().int().min(1).max(10),
      date: z.string(),
      activities: z.array(z.string()).max(50).optional(),
      weather: z.string().max(100).optional(),
      sleepHours: z.number().optional(),
      sleepQuality: z.string().max(50).optional(),
      energyLevel: z.number().int().min(1).max(10).optional(),
      stressLevel: z.number().int().min(1).max(10).optional(),
      reflection1: z.string().max(500).optional(),
      reflection2: z.string().max(500).optional(),
      reflection3: z.string().max(500).optional(),
      reflection4: z.string().max(500).optional(),
    })).max(1000),
  }),
})

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = importLimiter.check(`import:${session.user.id}`)
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests", retryIn: rl.resetIn }, { status: 429 })
  }

  const body = await request.json()
  const parsed = importSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const userId = session.user.id

  const { imported, skipped } = await prisma.$transaction(async (tx) => {
    let imported = 0
    let skipped = 0

    for (const entry of parsed.data.data.entries) {
      const existing = await tx.moodEntry.findFirst({
        where: {
          userId,
          date: new Date(entry.date),
          category: entry.category,
        },
      })

      if (existing) {
        skipped++
        continue
      }

      await tx.moodEntry.create({
        data: {
          userId,
          category: entry.category,
          moodIndex: entry.moodIndex,
          intensity: entry.intensity,
          date: new Date(entry.date),
          activities: entry.activities ?? [],
          weather: entry.weather ?? null,
          sleepHours: entry.sleepHours ?? null,
          sleepQuality: entry.sleepQuality ?? null,
          energyLevel: entry.energyLevel ?? null,
          stressLevel: entry.stressLevel ?? null,
          reflection1: entry.reflection1 ?? null,
          reflection2: entry.reflection2 ?? null,
          reflection3: entry.reflection3 ?? null,
          reflection4: entry.reflection4 ?? null,
        },
      })
      imported++
    }

    return { imported, skipped }
  })

  if (imported > 0) {
    await checkAndUnlockAchievements(userId)
  }

  return NextResponse.json({ imported, skipped })
}
