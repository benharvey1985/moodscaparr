import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { computeStreak, getAverageMoodScore, getMoodBalance } from "@/lib/stats"
import { MOODS } from "@/types/mood"
import { dateRangeStart, isValidTimeZone, parseDateOnly } from "@/lib/dates"
import { serializeMoodEntry } from "@/lib/mood-validation"
import { analyticsDateFilter } from "@/lib/api/analytics"

const RANGES = new Set(["7d", "30d", "90d", "all"])

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10
}

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const range = request.nextUrl.searchParams.get("range") || "30d"
  if (!RANGES.has(range)) {
    return NextResponse.json({ error: "Invalid analytics range" }, { status: 400 })
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: session.user.id },
    select: { timezone: true },
  })
  const timezone = isValidTimeZone(profile?.timezone) ? profile.timezone : "UTC"
  const rangeStart = range === "all" ? null : dateRangeStart(range, timezone)

  const records = await prisma.moodEntry.findMany({
    where: {
      userId: session.user.id,
      ...analyticsDateFilter(rangeStart),
    },
    orderBy: [{ localDate: "desc" }, { date: "desc" }],
  })
  const entries = records.map(serializeMoodEntry)

  const streak = computeStreak(
    entries.map((entry) => ({ date: parseDateOnly(entry.localDate) })),
    "UTC"
  )
  const avgMoodScore = getAverageMoodScore(entries)
  const moodBalance = getMoodBalance(entries)

  const freqMap = new Map<string, { label: string; emoji: string; count: number }>()
  for (const entry of entries) {
    const mood = MOODS[entry.category]?.[entry.moodIndex]
    if (!mood) continue
    const key = `${entry.category}-${entry.moodIndex}`
    const existing = freqMap.get(key)
    if (existing) existing.count++
    else freqMap.set(key, { label: mood.label, emoji: mood.emoji, count: 1 })
  }
  const moodFrequency = Array.from(freqMap.values()).sort((a, b) => b.count - a.count)

  const energyValues = entries.flatMap((entry) => entry.energyLevel === null ? [] : [entry.energyLevel])
  const stressValues = entries.flatMap((entry) => entry.stressLevel === null ? [] : [entry.stressLevel])
  const sleepValues = entries.flatMap((entry) => entry.sleepHours === null ? [] : [entry.sleepHours])

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
      const mood = MOODS[entry.category]?.[entry.moodIndex]
      if (!mood) continue

      if (score > bestScore) {
        bestScore = score
        bestDay = { date: entry.localDate, mood }
      }
      if (score < worstScore) {
        worstScore = score
        worstDay = { date: entry.localDate, mood }
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
      avgEnergy: average(energyValues),
      avgStress: average(stressValues),
      avgSleepHours: average(sleepValues),
      metricCounts: {
        energy: energyValues.length,
        stress: stressValues.length,
        sleep: sleepValues.length,
      },
    },
  })
}
