import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { checkAndUnlockAchievementsSafely } from "@/lib/achievements"
import {
  createMoodEntrySchema,
  moodEntryWriteData,
  serializeMoodEntry,
} from "@/lib/mood-validation"

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

  return NextResponse.json(entries.map(serializeMoodEntry))
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = createMoodEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const userId = session.user.id
  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`mood-entry:${userId}`}))`

    const existing = await tx.moodEntry.findFirst({
      where: { userId, localDate: parsed.data.localDate },
      select: { id: true },
    })
    if (existing) return { conflict: true as const, existingId: existing.id }

    const entry = await tx.moodEntry.create({
      data: {
        ...moodEntryWriteData(parsed.data),
        userId,
      },
    })
    return { conflict: false as const, entry }
  })

  if (result.conflict) {
    return NextResponse.json(
      {
        error: "An entry already exists for this local date",
        existingId: result.existingId,
      },
      { status: 409 }
    )
  }

  const newlyUnlocked = await checkAndUnlockAchievementsSafely(userId)

  return NextResponse.json(
    {
      ...serializeMoodEntry(result.entry),
      newlyUnlocked,
    },
    { status: 201 }
  )
}
