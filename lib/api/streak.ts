export interface StreakData {
  current: number
  longest: number
}

export interface DashboardStats {
  totalEntries: number
  avgMoodScore: number
  moodBalance: { positive: number; neutral: number; negative: number }
  entriesThisWeek: number
  currentStreak: number
  longestStreak: number
  streakGoal: number
}

export async function fetchStreak(): Promise<StreakData> {
  const res = await fetch("/api/streak", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch streak")
  return res.json()
}

export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch("/api/stats", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch stats")
  return res.json()
}
