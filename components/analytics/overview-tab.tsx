"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { AnalyticsStats } from "@/lib/api/analytics"
import { Activity, Brain, Flame, BarChart3, TrendingUp, TrendingDown } from "lucide-react"

interface OverviewTabProps {
  stats: AnalyticsStats | undefined
}

function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
        <span className={color}>{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold tabular-nums">{value}</span>
      </CardContent>
    </Card>
  )
}

export function OverviewTab({ stats }: OverviewTabProps) {
  if (!stats || stats.totalEntries < 3) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <BarChart3 className="mb-3 size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Not enough data yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Log more entries to unlock analytics insights!
        </p>
      </div>
    )
  }

  const { bestDay, worstDay, moodFrequency, moodBalance, avgEnergy, avgStress, avgSleepHours } =
    stats

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard
          icon={<Activity className="size-4" />}
          label="Total Entries"
          value={String(stats.totalEntries)}
          color="text-blue-500"
        />
        <KpiCard
          icon={<Brain className="size-4" />}
          label="Avg Mood Score"
          value={`${stats.avgMoodScore}/10`}
          color="text-purple-500"
        />
        <KpiCard
          icon={<Flame className="size-4" />}
          label="Current Streak"
          value={`${stats.currentStreak} days`}
          color="text-orange-500"
        />
        <KpiCard
          icon={<Flame className="size-4" />}
          label="Longest Streak"
          value={`${stats.longestStreak} days`}
          color="text-rose-500"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-green-500" />
              Best Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestDay ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{bestDay.mood.emoji}</span>
                <div>
                  <p className="font-medium">{bestDay.mood.label}</p>
                  <p className="text-xs text-muted-foreground">{bestDay.date}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="size-4 text-red-500" />
              Worst Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {worstDay ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{worstDay.mood.emoji}</span>
                <div>
                  <p className="font-medium">{worstDay.mood.label}</p>
                  <p className="text-xs text-muted-foreground">{worstDay.date}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mood Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex h-5 w-full overflow-hidden rounded-full">
            <div
              className="bg-[#22c55e] transition-all duration-500"
              style={{ width: `${moodBalance.positive}%` }}
            />
            <div
              className="bg-[#f59e0b] transition-all duration-500"
              style={{ width: `${moodBalance.neutral}%` }}
            />
            <div
              className="bg-[#ef4444] transition-all duration-500"
              style={{ width: `${moodBalance.negative}%` }}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#22c55e]">Positive {moodBalance.positive}%</span>
            <span className="text-[#f59e0b]">Neutral {moodBalance.neutral}%</span>
            <span className="text-[#ef4444]">Negative {moodBalance.negative}%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mood Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {moodFrequency.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 text-center text-lg">{item.emoji}</span>
                <span className="w-28 text-sm font-medium">{item.label}</span>
                <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">
                  {item.count}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/60 transition-all duration-500"
                    style={{
                      width: `${(item.count / Math.max(...moodFrequency.map((m) => m.count))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Wellbeing Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Energy Level</span>
              <span className="tabular-nums text-muted-foreground">{avgEnergy}/10</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-500"
                style={{ width: `${(avgEnergy / 10) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Stress Level</span>
              <span className="tabular-nums text-muted-foreground">{avgStress}/10</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-red-500 transition-all duration-500"
                style={{ width: `${(avgStress / 10) * 100}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Sleep Hours</span>
              <span className="tabular-nums text-muted-foreground">{avgSleepHours}h</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${(avgSleepHours / 12) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
