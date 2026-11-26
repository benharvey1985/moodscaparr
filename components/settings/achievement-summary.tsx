"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ACHIEVEMENT_DEFINITIONS } from "@/types/achievements"
import Link from "next/link"

const TOTAL_BADGES = ACHIEVEMENT_DEFINITIONS.length

export function AchievementSummary() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const response = await fetch("/api/achievements", { credentials: "include" })
      if (!response.ok) throw new Error("Failed to fetch achievements")
      return response.json() as Promise<{
        achievements: Array<{ badgeId: string; isUnlocked: boolean }>
        completionPercentage: number
        unlockedCount: number
        totalCount: number
      }>
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
        <CardContent><p role="status" className="text-sm text-muted-foreground">Loading achievements...</p></CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader><CardTitle>Achievements</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p role="alert" className="text-sm text-destructive">Could not load achievements.</p>
          <Button type="button" variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>
            {isFetching ? "Retrying..." : "Retry"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  const achievements = data?.achievements ?? []
  const unlockedIds = new Set(
    achievements.filter((achievement) => achievement.isUnlocked).map((achievement) => achievement.badgeId)
  )
  const unlockedCount = unlockedIds.size
  const percentage = TOTAL_BADGES ? Math.round((unlockedCount / TOTAL_BADGES) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="relative flex size-14 items-center justify-center"
            role="progressbar"
            aria-label="Achievement completion"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percentage}
            aria-valuetext={`${unlockedCount} of ${TOTAL_BADGES} badges unlocked`}
          >
            <svg className="size-14 -rotate-90" viewBox="0 0 36 36" aria-hidden="true">
              <circle
                cx="18" cy="18" r="15.5"
                fill="none" stroke="var(--muted)" strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                pathLength="100"
                strokeDasharray={`${percentage} ${100 - percentage}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold">{percentage}%</span>
          </div>
          <div>
            <p className="text-lg font-semibold">
              {unlockedCount} of {TOTAL_BADGES} badges
            </p>
            <p className="text-xs text-muted-foreground">
              {TOTAL_BADGES - unlockedCount} more to unlock
            </p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {ACHIEVEMENT_DEFINITIONS.map((badge) => {
            const unlocked = unlockedIds.has(badge.id)
            return (
              <div
                key={badge.id}
                className="flex items-center justify-center rounded-md p-1 text-lg"
                title={`${badge.title} — ${unlocked ? "Unlocked" : "Locked"}`}
              >
                <span className={unlocked ? "" : "grayscale"} aria-hidden="true">{badge.icon}</span>
              </div>
            )
          })}
        </div>

        <Link
          href="/achievements"
          className="inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          View All →
        </Link>
      </CardContent>
    </Card>
  )
}
