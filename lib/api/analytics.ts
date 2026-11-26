import type { MoodEntry } from "@/types/mood"

export type AnalyticsRange = "7d" | "30d" | "90d" | "all"

export function analyticsDateFilter(rangeStart: string | null) {
  if (!rangeStart) return {}

  const utcStart = new Date(`${rangeStart}T00:00:00.000Z`)
  return {
    OR: [
      { localDate: { gte: rangeStart } },
      { localDate: null, date: { gte: utcStart } },
    ],
  }
}

export interface AnalyticsMood {
  emoji: string
  label: string
}

export interface AnalyticsDay {
  date: string
  mood: AnalyticsMood
}

export interface AnalyticsStats {
  totalEntries: number
  avgMoodScore: number
  currentStreak: number
  longestStreak: number
  bestDay: AnalyticsDay | null
  worstDay: AnalyticsDay | null
  moodBalance: { positive: number; neutral: number; negative: number }
  moodFrequency: Array<{ label: string; emoji: string; count: number }>
  avgEnergy: number | null
  avgStress: number | null
  avgSleepHours: number | null
  metricCounts: {
    energy: number
    stress: number
    sleep: number
  }
}

export interface AnalyticsResponse {
  entries: MoodEntry[]
  stats: AnalyticsStats
}

export async function fetchAnalytics(range: AnalyticsRange = "30d"): Promise<AnalyticsResponse> {
  const params = new URLSearchParams({ range })
  const response = await fetch(`/api/analytics?${params.toString()}`, { credentials: "include" })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to fetch analytics")
  }
  return response.json()
}
