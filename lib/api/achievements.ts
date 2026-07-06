export interface AchievementResponse {
  achievements: Array<{
    id: string
    badgeId: string
    unlockedAt: string
    progress: number
    maxProgress: number
    definition: {
      id: string
      category: string
      icon: string
      title: string
      description: string
      condition: string
      maxProgress: number
    }
    isUnlocked: boolean
  }>
  completionPercentage: number
  unlockedCount: number
  totalCount: number
}

export async function fetchAchievements(): Promise<AchievementResponse> {
  const res = await fetch("/api/achievements")
  if (!res.ok) throw new Error("Failed to fetch achievements")
  return res.json()
}

export async function checkAchievements(): Promise<{ newlyUnlocked: Array<{ badgeId: string; progress: number }> }> {
  const res = await fetch("/api/achievements/check", { method: "POST" })
  if (!res.ok) throw new Error("Failed to check achievements")
  return res.json()
}
