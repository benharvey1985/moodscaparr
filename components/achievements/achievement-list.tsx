"use client"

import { useAchievements } from "@/hooks/use-achievements"
import { AchievementCard } from "./achievement-card"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { cn } from "@/lib/utils"
const categoryLabels: Record<string, { label: string; className: string }> = {
  milestone: { label: "Milestones", className: "text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" },
  streak: { label: "Streaks", className: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
  exploration: { label: "Exploration", className: "text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
  special: { label: "Special", className: "text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800" },
}

const categoryOrder = ["milestone", "streak", "exploration", "special"]

export function AchievementList() {
  const { data, isLoading, isError, error } = useAchievements()

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-40 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-destructive text-lg">Failed to load achievements</p>
        <p className="text-sm text-muted-foreground">{error?.message}</p>
      </div>
    )
  }

  if (!data || data.achievements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <p className="text-lg text-muted-foreground">No achievements found</p>
      </div>
    )
  }

  const { achievements, completionPercentage, unlockedCount, totalCount } = data

  const sorted = [...achievements].sort((a, b) => {
    if (a.isUnlocked !== b.isUnlocked) return a.isUnlocked ? -1 : 1
    const aPct = a.progress / a.maxProgress
    const bPct = b.progress / b.maxProgress
    return bPct - aPct
  })

  const grouped = categoryOrder.reduce(
    (acc, cat) => {
      acc[cat] = sorted.filter((a) => a.definition.category === cat)
      return acc
    },
    {} as Record<string, typeof achievements>
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="relative inline-flex items-center justify-center">
          <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
            <circle
              className="stroke-muted"
              fill="none"
              cx="18"
              cy="18"
              r="15.5"
              strokeWidth="3"
            />
            <circle
              className="stroke-primary"
              fill="none"
              cx="18"
              cy="18"
              r="15.5"
              strokeWidth="3"
              strokeDasharray={`${completionPercentage} ${100 - completionPercentage}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          </svg>
          <span className="absolute text-lg font-bold">{unlockedCount}</span>
        </div>
        <p className="text-lg font-semibold">
          {unlockedCount} of {totalCount} badges unlocked ({completionPercentage}%)
        </p>
      </div>

      {categoryOrder.map((cat) => {
        const items = grouped[cat]
        if (!items || items.length === 0) return null
        const catInfo = categoryLabels[cat]
        return (
          <section key={cat}>
            <h2 className={cn("text-lg font-semibold border-b pb-2 mb-4", catInfo.className)}>
              {catInfo.label}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((a) => (
                <AchievementCard key={a.badgeId} achievement={a} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
