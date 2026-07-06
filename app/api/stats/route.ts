import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import {
  computeStreak,
  getAverageMoodScore,
  getMoodBalance,
  getEntriesThisWeek,
} from "@/lib/stats"

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
    orderBy: { date: "desc" },
  })

  const streak = computeStreak(entries, timezone)

  return NextResponse.json({
    totalEntries: entries.length,
    avgMoodScore: getAverageMoodScore(entries),
    moodBalance: getMoodBalance(entries),
    entriesThisWeek: getEntriesThisWeek(entries, timezone),
    currentStreak: streak.current,
    longestStreak: streak.longest,
    streakGoal: profile?.streakGoal ?? 7,
  })
}
