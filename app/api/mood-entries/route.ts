import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { checkAndUnlockAchievements } from "@/lib/achievements"
import { z } from "zod"

const createSchema = z.object({
  category: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  moodIndex: z.number().int().min(0).max(18),
  intensity: z.number().int().min(1).max(10),
  date: z.string(),
  activities: z.array(z.string()).optional(),
  weather: z.string().optional(),
  sleepHours: z.number().optional(),
  sleepQuality: z.string().optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  stressLevel: z.number().int().min(1).max(10).optional(),
  reflection1: z.string().max(500).optional(),
  reflection2: z.string().max(500).optional(),
  reflection3: z.string().max(500).optional(),
  reflection4: z.string().max(500).optional(),
})

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const entries = await prisma.moodEntry.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 50,
  })

  const serialized = entries.map((e) => ({
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }))

  return NextResponse.json(serialized)
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { date, ...rest } = parsed.data

  const entry = await prisma.moodEntry.create({
    data: {
      ...rest,
      userId: session.user.id,
      date: new Date(date),
    },
  })

  const newlyUnlocked = await checkAndUnlockAchievements(session.user.id)

  return NextResponse.json(
    {
      ...entry,
      date: entry.date.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      newlyUnlocked,
    },
    { status: 201 }
  )
}
