"use client"

import type { UserAchievement } from "@/types/achievements"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const categoryColors: Record<string, { bg: string; text: string; bar: string; border: string }> = {
  milestone: {
    bg: "bg-green-50 dark:bg-green-950/30",
    text: "text-green-700 dark:text-green-300",
    bar: "bg-green-500",
    border: "border-green-200 dark:border-green-800",
  },
  streak: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    text: "text-amber-700 dark:text-amber-300",
    bar: "bg-amber-500",
    border: "border-amber-200 dark:border-amber-800",
  },
  exploration: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    text: "text-blue-700 dark:text-blue-300",
    bar: "bg-blue-500",
    border: "border-blue-200 dark:border-blue-800",
  },
  special: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    text: "text-purple-700 dark:text-purple-300",
    bar: "bg-purple-500",
    border: "border-purple-200 dark:border-purple-800",
  },
}

interface AchievementCardProps {
  achievement: UserAchievement
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const { definition, isUnlocked, progress, maxProgress } = achievement
  const colors = categoryColors[definition.category] ?? categoryColors.milestone
  const safeMax = Math.max(1, maxProgress)
  const currentProgress = Math.min(Math.max(progress, 0), safeMax)
  const percentage = Math.round((currentProgress / safeMax) * 100)

  return (
    <Card
      className={cn(
        "flex flex-col gap-2 p-4 transition-all motion-reduce:transition-none",
        isUnlocked ? "shadow-sm" : "border-border",
        isUnlocked && colors.border,
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn("text-2xl", !isUnlocked && "grayscale")} aria-hidden="true">
          {definition.icon}
        </span>
        {isUnlocked ? (
          <Badge variant="default" className="bg-mood-positive-medium text-xs text-white">
            Unlocked
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">Locked</Badge>
        )}
      </div>
      <div>
        <h3 className={cn("text-sm font-semibold", isUnlocked ? colors.text : "text-foreground")}>
          {definition.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{definition.description}</p>
      </div>
      <div className="mt-auto space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{currentProgress} / {safeMax}</span>
          <span>{percentage}%</span>
        </div>
        <div
          role="progressbar"
          aria-label={`${definition.title} progress`}
          aria-valuemin={0}
          aria-valuemax={safeMax}
          aria-valuenow={currentProgress}
          aria-valuetext={`${currentProgress} of ${safeMax}`}
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
        >
          <div
            className={cn("h-full rounded-full transition-all duration-500 motion-reduce:transition-none", colors.bar)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  )
}
