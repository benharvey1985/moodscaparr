import type { MoodEntry } from "@/types/mood"

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
  avgEnergy: number
  avgStress: number
  avgSleepHours: number
}

export interface AnalyticsResponse {
  entries: MoodEntry[]
  stats: AnalyticsStats
}

export async function fetchAnalytics(range = "30d"): Promise<AnalyticsResponse> {
  const res = await fetch(`/api/analytics?range=${range}`, { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch analytics")
  return res.json()
}
