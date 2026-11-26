import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { serializeMoodEntry } from "@/lib/mood-validation"
import { MOODS, type MoodCategory } from "@/types/mood"

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim() ?? ""
  const category = searchParams.get("category")
  const page = positiveInteger(searchParams.get("page"), 1)
  const limit = Math.min(100, positiveInteger(searchParams.get("limit"), 20))
  const offset = (page - 1) * limit

  const where: Record<string, unknown> = { userId: session.user.id }
  if (category && ["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(category)) {
    where.category = category
  }

  if (q) {
    const normalized = q.toLowerCase()
    const activityQueries = Array.from(
      new Set([q, normalized, normalized.charAt(0).toUpperCase() + normalized.slice(1)])
    )
    const moodMatches: Array<Record<string, unknown>> = []

    for (const [moodCategory, moods] of Object.entries(MOODS) as Array<
      [MoodCategory, (typeof MOODS)[MoodCategory]]
    >) {
      moods.forEach((mood, moodIndex) => {
        if (mood.label.toLowerCase().includes(normalized)) {
          moodMatches.push({ category: moodCategory, moodIndex })
        }
      })
    }

    where.OR = [
      { reflection1: { contains: q, mode: "insensitive" } },
      { reflection2: { contains: q, mode: "insensitive" } },
      { reflection3: { contains: q, mode: "insensitive" } },
      { reflection4: { contains: q, mode: "insensitive" } },
      { weather: { contains: q, mode: "insensitive" } },
      { activities: { hasSome: activityQueries } },
      ...moodMatches,
    ]
  }

  const [entries, total] = await Promise.all([
    prisma.moodEntry.findMany({
      where,
      orderBy: { date: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.moodEntry.count({ where }),
  ])

  return NextResponse.json({
    entries: entries.map(serializeMoodEntry),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
