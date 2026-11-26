import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { serializeMoodEntry } from "@/lib/mood-validation"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id
  const [user, profile, entries, achievements] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    }),
    prisma.userProfile.findUnique({ where: { id: userId } }),
    prisma.moodEntry.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.achievement.findMany({ where: { userId } }),
  ])

  return NextResponse.json(
    {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      data: {
        user: { ...user, createdAt: user.createdAt.toISOString() },
        profile,
        entries: entries.map(serializeMoodEntry),
        achievements: achievements.map((achievement) => ({
          ...achievement,
          unlockedAt: achievement.unlockedAt.toISOString(),
        })),
      },
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
