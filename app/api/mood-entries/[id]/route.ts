import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { utcDateOnly } from "@/lib/dates"
import { checkAndUnlockAchievementsSafely } from "@/lib/achievements"
import {
  createMoodEntrySchema,
  moodEntryWriteData,
  serializeMoodEntry,
  updateMoodEntrySchema,
} from "@/lib/mood-validation"

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const entry = await prisma.moodEntry.findUnique({ where: { id } })
  if (!entry || entry.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(serializeMoodEntry(entry))
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = updateMoodEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const userId = session.user.id
  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`mood-entry:${userId}`}))`

    const existing = await tx.moodEntry.findUnique({ where: { id } })
    if (!existing || existing.userId !== userId) {
      return { notFound: true as const }
    }

    const merged = createMoodEntrySchema.safeParse({
      ...existing,
      ...parsed.data,
    })
    if (!merged.success) {
      return { notFound: false as const, invalid: merged.error.flatten() }
    }

    const previousLocalDate = existing.localDate ?? utcDateOnly(existing.date)
    if (merged.data.localDate !== previousLocalDate) {
      const duplicate = await tx.moodEntry.findFirst({
        where: {
          userId,
          localDate: merged.data.localDate,
          id: { not: id },
        },
        select: { id: true },
      })
      if (duplicate) {
        return {
          notFound: false as const,
          conflict: true as const,
          existingId: duplicate.id,
        }
      }
    }

    const entry = await tx.moodEntry.update({
      where: { id },
      data: moodEntryWriteData(merged.data),
    })
    return { notFound: false as const, entry }
  })

  if (result.notFound) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if ("invalid" in result) {
    return NextResponse.json({ error: result.invalid }, { status: 400 })
  }
  if ("conflict" in result) {
    return NextResponse.json(
      {
        error: "An entry already exists for this local date",
        existingId: result.existingId,
      },
      { status: 409 }
    )
  }

  const newlyUnlocked = await checkAndUnlockAchievementsSafely(userId)
  return NextResponse.json({ ...serializeMoodEntry(result.entry), newlyUnlocked })
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const existing = await prisma.moodEntry.findUnique({ where: { id } })
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.moodEntry.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
