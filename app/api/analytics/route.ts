import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { computeStreak, getAverageMoodScore, getMoodBalance } from "@/lib/stats"
import { MOODS } from "@/types/mood"
import { subDays, startOfDay } from "date-fns"

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const range = request.nextUrl.searchParams.get("range") || "30d"

  const profile = await prisma.userProfile.findUnique({
    where: { id: session.user.id },
  })
  const timezone = profile?.timezone ?? "UTC"

  let dateFilter: Date | undefined
  const now = new Date()

  switch (range) {
    case "7d":
      dateFilter = startOfDay(subDays(now, 7))
      break
    case "30d":
      dateFilter = startOfDay(subDays(now, 30))
      break
    case "90d":
      dateFilter = startOfDay(subDays(now, 90))
      break
  }

  const entries = await prisma.moodEntry.findMany({
    where: {
      userId: session.user.id,
      ...(dateFilter ? { date: { gte: dateFilter } } : {}),
    },
    orderBy: { date: "desc" },
  })

  const streak = computeStreak(entries, timezone)
  const avgMoodScore = getAverageMoodScore(entries)
  const moodBalance = getMoodBalance(entries)

  function getMood(category: string, moodIndex: number): { emoji: string; label: string } | undefined {
    const cat = category as keyof typeof MOODS
    const moods = MOODS[cat]
    if (!moods) return undefined
    return moods[moodIndex]
  }

  const freqMap = new Map<string, { label: string; emoji: string; count: number }>()
  for (const entry of entries) {
    const mood = getMood(entry.category, entry.moodIndex)
    if (!mood) continue
    const key = `${entry.category}-${entry.moodIndex}`
    const existing = freqMap.get(key)
    if (existing) {
      existing.count++
    } else {
      freqMap.set(key, { label: mood.label, emoji: mood.emoji, count: 1 })
    }
  }
  const moodFrequency = Array.from(freqMap.values()).sort((a, b) => b.count - a.count)

  const withEnergy = entries.filter((e) => e.energyLevel !== null)
  const withStress = entries.filter((e) => e.stressLevel !== null)
  const withSleepHours = entries.filter((e) => e.sleepHours !== null)

  const avgEnergy = withEnergy.length
    ? Math.round(
        (withEnergy.reduce((s, e) => s + (e.energyLevel ?? 0), 0) / withEnergy.length) * 10
      ) / 10
    : 0

  const avgStress = withStress.length
    ? Math.round(
        (withStress.reduce((s, e) => s + (e.stressLevel ?? 0), 0) / withStress.length) * 10
      ) / 10
    : 0

  const avgSleepHours = withSleepHours.length
    ? Math.round(
        (withSleepHours.reduce((s, e) => s + (e.sleepHours ?? 0), 0) / withSleepHours.length) * 10
      ) / 10
    : 0

  function scoreEntry(entry: { category: string; intensity: number }): number {
    if (entry.category === "POSITIVE") return entry.intensity
    if (entry.category === "NEGATIVE") return -entry.intensity
    return 0
  }

  let bestDay: { date: string; mood: { emoji: string; label: string } } | null = null
  let worstDay: { date: string; mood: { emoji: string; label: string } } | null = null

  if (entries.length > 0) {
    let bestScore = -Infinity
    let worstScore = Infinity
    for (const entry of entries) {
      const score = scoreEntry(entry)
      const mood = getMood(entry.category, entry.moodIndex)
      if (!mood) continue

      if (score > bestScore) {
        bestScore = score
        bestDay = { date: entry.date.toISOString().split("T")[0], mood }
      }
      if (score < worstScore) {
        worstScore = score
        worstDay = { date: entry.date.toISOString().split("T")[0], mood }
      }
    }
  }

  return NextResponse.json({
    entries,
    stats: {
      totalEntries: entries.length,
      avgMoodScore,
      currentStreak: streak.current,
      longestStreak: streak.longest,
      bestDay,
      worstDay,
      moodBalance,
      moodFrequency,
      avgEnergy,
      avgStress,
      avgSleepHours,
    },
  })
}
