"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MOODS, type MoodCategory } from "@/types/mood"
import type { MoodEntry } from "@/types/mood"

interface MonthStatsProps {
  entries: MoodEntry[]
}

export function MonthStats({ entries }: MonthStatsProps) {
  if (entries.length === 0) return null

  const total = entries.length
  const avgIntensity = Math.round((entries.reduce((s, e) => s + e.intensity, 0) / total) * 10) / 10

  const activityCounts: Record<string, number> = {}
  let totalSleep = 0
  let sleepCount = 0

  for (const e of entries) {
    for (const a of e.activities) {
      activityCounts[a] = (activityCounts[a] || 0) + 1
    }
    if (e.sleepHours != null) {
      totalSleep += e.sleepHours
      sleepCount++
    }
  }

  const topActivity = Object.entries(activityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  const avgSleep = sleepCount > 0 ? Math.round((totalSleep / sleepCount) * 10) / 10 : null

  const moodCounts: Record<string, { emoji: string; label: string; count: number }> = {}
  for (const e of entries) {
    const moods = MOODS[e.category as MoodCategory]
    const m = moods?.[e.moodIndex]
    if (m) {
      const key = `${e.category}-${e.moodIndex}`
      if (!moodCounts[key]) {
        moodCounts[key] = { emoji: m.emoji, label: m.label, count: 0 }
      }
      moodCounts[key].count++
    }
  }
  const topMood = Object.values(moodCounts).sort((a, b) => b.count - a.count)[0] ?? null

  return (
    <Card size="sm">
      <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
        {topMood && (
          <div className="flex items-center gap-1.5">
            <span className="text-lg">{topMood.emoji}</span>
            <span className="text-sm font-medium">{topMood.label}</span>
          </div>
        )}
        <div className="text-sm">
          <span className="text-muted-foreground">Entries: </span>
          <span className="font-medium">{total}</span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Avg Intensity: </span>
          <span className="font-medium">{avgIntensity}/10</span>
        </div>
        {topActivity && (
          <div className="text-sm">
            <span className="text-muted-foreground">Top Activity: </span>
            <span className="font-medium">{topActivity}</span>
          </div>
        )}
        {avgSleep != null && (
          <div className="text-sm">
            <span className="text-muted-foreground">Avg Sleep: </span>
            <span className="font-medium">{avgSleep}h</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
