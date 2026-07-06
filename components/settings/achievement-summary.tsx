"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ACHIEVEMENT_DEFINITIONS } from "@/types/achievements"
import Link from "next/link"

const TOTAL_BADGES = ACHIEVEMENT_DEFINITIONS.length

export function AchievementSummary() {
  const { data: achievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements", { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch achievements")
      return res.json()
    },
  })

  const unlockedIds = new Set(
    (achievements ?? []).filter((a: { isUnlocked: boolean }) => a.isUnlocked).map((a: { badgeId: string }) => a.badgeId)
  )
  const unlockedCount = unlockedIds.size
  const pct = TOTAL_BADGES ? Math.round((unlockedCount / TOTAL_BADGES) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative flex size-14 items-center justify-center">
            <svg className="size-14 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15.5"
                fill="none" stroke="hsl(var(--muted))" strokeWidth="3"
              />
              <circle
                cx="18" cy="18" r="15.5"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="3"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-sm font-bold">{pct}%</span>
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
                <span className={unlocked ? "" : "grayscale opacity-30"}>
                  {badge.icon}
                </span>
              </div>
            )
          })}
        </div>

        <Link
          href="/achievements"
          className="inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          View All →
        </Link>
      </CardContent>
    </Card>
  )
}
