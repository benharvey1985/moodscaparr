import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userId = session.user.id

  const [user, profile, entries, achievements] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
    }),
    prisma.userProfile.findUnique({ where: { id: userId } }),
    prisma.moodEntry.findMany({ where: { userId } }),
    prisma.achievement.findMany({ where: { userId } }),
  ])

  return NextResponse.json({
    version: "1.0",
    exportedAt: new Date().toISOString(),
    data: {
      user,
      profile,
      entries: entries.map((e) => ({
        ...e,
        date: e.date.toISOString(),
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
      achievements: achievements.map((a) => ({
        ...a,
        unlockedAt: a.unlockedAt.toISOString(),
      })),
    },
  })
}
