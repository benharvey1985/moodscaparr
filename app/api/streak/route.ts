import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { computeStreak } from "@/lib/stats"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: session.user.id },
  })
  const timezone = profile?.timezone ?? "UTC"

  const entries = await prisma.moodEntry.findMany({
    where: { userId: session.user.id },
    select: { date: true },
  })

  const streak = computeStreak(entries, timezone)

  return NextResponse.json(streak)
}
