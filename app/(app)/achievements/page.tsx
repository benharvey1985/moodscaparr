"use client"

import { AchievementList } from "@/components/achievements/achievement-list"
import { ErrorBoundary } from "@/components/ui/error-boundary"

function AchievementsContent() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Achievements</h1>
      <AchievementList />
    </div>
  )
}

export default function AchievementsPage() {
  return (
    <ErrorBoundary>
      <AchievementsContent />
    </ErrorBoundary>
  )
}
