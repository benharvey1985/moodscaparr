import { requireAuth } from "@/lib/auth-actions"
import { AchievementList } from "@/components/achievements/achievement-list"

export default async function AchievementsPage() {
  await requireAuth()
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Achievements</h1>
      <AchievementList />
    </div>
  )
}
