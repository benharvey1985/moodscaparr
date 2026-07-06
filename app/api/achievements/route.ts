import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserAchievements } from "@/lib/achievements"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const achievements = await getUserAchievements(session.user.id)
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length
  const totalCount = achievements.length
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0

  return NextResponse.json({
    achievements,
    completionPercentage,
    unlockedCount,
    totalCount,
  })
}
