"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Activity, BarChart3, Brain, Flame, TrendingDown, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AnalyticsStats } from "@/lib/api/analytics"
import { formatLocalDate } from "@/lib/dates"
import { ChartDataTable } from "@/components/analytics/chart-data-table"

interface OverviewTabProps {
  stats: AnalyticsStats | undefined
}

function KpiCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: string }) {
  return (
    <Card size="sm">
      <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
        <span className={color} aria-hidden="true">{icon}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-semibold tabular-nums">{value}</span>
      </CardContent>
    </Card>
  )
}

function MetricBar({
  label,
  value,
  count,
  total,
  max,
  unit,
  color,
}: {
  label: string
  value: number | null
  count: number
  total: number
  max: number
  unit: string
  color: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {value === null ? "Not recorded" : `${value}${unit}`}
          <span className="ml-2 text-xs">{count} of {total} entries</span>
        </span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={`${label}: ${value === null ? "no data" : `${value}${unit}`}, based on ${count} of ${total} entries`}
      >
        {value !== null && (
          <div
            className={`h-full rounded-full ${color}`}
            style={{ width: `${Math.min(100, Math.max(0, (value / max) * 100))}%` }}
          />
        )}
      </div>
    </div>
  )
}

export function OverviewTab({ stats }: OverviewTabProps) {
  const router = useRouter()

  if (!stats || stats.totalEntries === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <BarChart3 className="mb-3 size-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">No entries in this range</h2>
        <p className="mt-1 text-sm text-muted-foreground">Log a mood or choose a wider date range to see insights.</p>
        <Button className="mt-4 min-h-11" onClick={() => router.push("/wizard")}>Log a Mood</Button>
      </div>
    )
  }

  const { bestDay, worstDay, moodFrequency, moodBalance, avgEnergy, avgStress, avgSleepHours, metricCounts } = stats
  const maxFrequency = Math.max(1, ...moodFrequency.map((mood) => mood.count))
  const balanceRows = [
    { category: "Positive", percentage: moodBalance.positive, color: "bg-mood-positive-medium" },
    { category: "Neutral", percentage: moodBalance.neutral, color: "bg-mood-neutral-medium" },
    { category: "Negative", percentage: moodBalance.negative, color: "bg-mood-negative-medium" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard icon={<Activity className="size-4" />} label="Total Entries" value={String(stats.totalEntries)} color="text-primary" />
        <KpiCard icon={<Brain className="size-4" />} label="Avg Mood Score" value={`${stats.avgMoodScore}/10`} color="text-mood-positive-medium" />
        <KpiCard icon={<Flame className="size-4" />} label="Current Streak" value={`${stats.currentStreak} days`} color="text-mood-neutral-medium" />
        <KpiCard icon={<Flame className="size-4" />} label="Longest Streak" value={`${stats.longestStreak} days`} color="text-mood-negative-medium" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4 text-mood-positive-medium" aria-hidden="true" />
              Best Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestDay ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{bestDay.mood.emoji}</span>
                <div>
                  <p className="font-medium">{bestDay.mood.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatLocalDate(bestDay.date, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="size-4 text-mood-negative-medium" aria-hidden="true" />
              Worst Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {worstDay ? (
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{worstDay.mood.emoji}</span>
                <div>
                  <p className="font-medium">{worstDay.mood.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatLocalDate(worstDay.date, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            ) : <p className="text-sm text-muted-foreground">No data</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Mood Balance</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex h-5 w-full overflow-hidden rounded-full" role="img" aria-label="Mood category distribution">
            {balanceRows.map((row) => (
              <div key={row.category} className={row.color} style={{ width: `${row.percentage}%` }} />
            ))}
          </div>
          <div className="flex flex-wrap justify-between gap-2 text-xs">
            {balanceRows.map((row) => (
              <span key={row.category} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${row.color}`} aria-hidden="true" />
                {row.category} {row.percentage}%
              </span>
            ))}
          </div>
          <ChartDataTable
            caption="Mood balance percentages"
            summary={`${moodBalance.positive}% positive, ${moodBalance.neutral}% neutral, ${moodBalance.negative}% negative.`}
            columns={[
              { key: "category", label: "Category", value: (row) => row.category },
              { key: "percentage", label: "Percentage", value: (row) => `${row.percentage}%` },
            ]}
            rows={balanceRows}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Mood Frequency</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {moodFrequency.map((item, index) => (
              <div key={`${item.label}-${index}`} className="flex items-center gap-3">
                <span className="w-6 text-center text-lg" aria-hidden="true">{item.emoji}</span>
                <span className="w-28 text-sm font-medium">{item.label}</span>
                <span className="w-8 text-right text-xs tabular-nums text-muted-foreground">{item.count}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div className="h-full rounded-full bg-primary/60" style={{ width: `${(item.count / maxFrequency) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <ChartDataTable
            caption="Mood frequencies"
            summary={`${moodFrequency.length} recorded moods across ${stats.totalEntries} entries.`}
            columns={[
              { key: "mood", label: "Mood", value: (row) => `${row.emoji} ${row.label}` },
              { key: "count", label: "Entries", value: (row) => row.count },
            ]}
            rows={moodFrequency}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Wellbeing Stats</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <MetricBar label="Energy Level" value={avgEnergy} count={metricCounts.energy} total={stats.totalEntries} max={10} unit="/10" color="bg-mood-positive-medium" />
          <MetricBar label="Stress Level" value={avgStress} count={metricCounts.stress} total={stats.totalEntries} max={10} unit="/10" color="bg-mood-negative-medium" />
          <MetricBar label="Sleep Hours" value={avgSleepHours} count={metricCounts.sleep} total={stats.totalEntries} max={24} unit="h" color="bg-mood-neutral-medium" />
          <p className="text-xs text-muted-foreground">Missing measurements are excluded from each average, not treated as zero.</p>
        </CardContent>
      </Card>
    </div>
  )
}
