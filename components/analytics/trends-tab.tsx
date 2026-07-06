"use client"

import { useMemo } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { format } from "date-fns"
import type { MoodEntry } from "@/types/mood"
import { TrendingUp } from "lucide-react"

interface TrendsTabProps {
  entries: MoodEntry[] | undefined
}

function getScore(entry: { category: string; intensity: number }): number {
  return entry.category === "NEGATIVE" ? 11 - entry.intensity : entry.intensity
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-dashed">
      <div className="text-center">
        <TrendingUp className="mx-auto mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function TrendsTab({ entries }: TrendsTabProps) {
  const moodTimelineData = useMemo(() => {
    if (!entries || entries.length < 2) return null
    const grouped = new Map<string, { date: string; score: number; count: number }>()
    for (const entry of entries) {
      const key = format(new Date(entry.date), "yyyy-MM-dd")
      const existing = grouped.get(key)
      const score = getScore(entry)
      if (existing) {
        existing.score += score
        existing.count++
      } else {
        grouped.set(key, { date: key, score, count: 1 })
      }
    }
    return Array.from(grouped.values())
      .map((d) => ({ ...d, score: Math.round((d.score / d.count) * 10) / 10 }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [entries])

  const dayOfWeekData = useMemo(() => {
    if (!entries || entries.length < 2) return null
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const grouped = new Map<number, { day: string; score: number; count: number }>()
    for (const entry of entries) {
      const d = new Date(entry.date)
      const dayIndex = d.getDay()
      const existing = grouped.get(dayIndex)
      const score = getScore(entry)
      if (existing) {
        existing.score += score
        existing.count++
      } else {
        grouped.set(dayIndex, { day: dayNames[dayIndex], score, count: 1 })
      }
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([, v]) => ({ ...v, score: Math.round((v.score / v.count) * 10) / 10 }))
  }, [entries])

  const weatherData = useMemo(() => {
    if (!entries || entries.length < 2) return null
    const grouped = new Map<string, { weather: string; score: number; count: number }>()
    for (const entry of entries) {
      if (!entry.weather) continue
      const existing = grouped.get(entry.weather)
      const score = getScore(entry)
      if (existing) {
        existing.score += score
        existing.count++
      } else {
        grouped.set(entry.weather, { weather: entry.weather, score, count: 1 })
      }
    }
    const result = Array.from(grouped.values()).map((d) => ({
      ...d,
      score: Math.round((d.score / d.count) * 10) / 10,
    }))
    return result.length >= 2 ? result : null
  }, [entries])

  const wellbeingData = useMemo(() => {
    if (!entries || entries.length < 2) return null
    const grouped = new Map<
      string,
      { date: string; energy: number; stress: number; sleep: number; count: number }
    >()
    for (const entry of entries) {
      if (entry.energyLevel === null && entry.stressLevel === null && entry.sleepHours === null)
        continue
      const key = format(new Date(entry.date), "yyyy-MM-dd")
      const existing = grouped.get(key)
      if (existing) {
        existing.energy += entry.energyLevel ?? 0
        existing.stress += entry.stressLevel ?? 0
        existing.sleep += entry.sleepHours ?? 0
        existing.count++
      } else {
        grouped.set(key, {
          date: key,
          energy: entry.energyLevel ?? 0,
          stress: entry.stressLevel ?? 0,
          sleep: entry.sleepHours ?? 0,
          count: 1,
        })
      }
    }
    const result = Array.from(grouped.values())
      .map((d) => ({
        date: d.date,
        energy: Math.round((d.energy / d.count) * 10) / 10,
        stress: Math.round((d.stress / d.count) * 10) / 10,
        sleep: Math.round((d.sleep / d.count) * 10) / 10,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    return result.length >= 2 ? result : null
  }, [entries])

  const activityData = useMemo(() => {
    if (!entries || entries.length < 2) return null
    const grouped = new Map<string, { activity: string; score: number; count: number }>()
    for (const entry of entries) {
      if (!entry.activities || entry.activities.length === 0) continue
      for (const activity of entry.activities) {
        const existing = grouped.get(activity)
        const score = getScore(entry)
        if (existing) {
          existing.score += score
          existing.count++
        } else {
          grouped.set(activity, { activity, score, count: 1 })
        }
      }
    }
    const result = Array.from(grouped.values())
      .map((d) => ({ ...d, score: Math.round((d.score / d.count) * 10) / 10 }))
      .sort((a, b) => b.score - a.score)
    return result.length >= 2 ? result : null
  }, [entries])

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Mood Timeline
        </h3>
        {moodTimelineData ? (
          <div className="rounded-xl border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodTimelineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => format(new Date(v), "MMM d")}
                />
                <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(v) => format(new Date(v), "MMM d, yyyy")}
                  formatter={(value) => [`${Number(value)}/10`, "Mood Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#8884d8" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label="Not enough data for this chart" />
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Day of Week
          </h3>
          {dayOfWeekData ? (
            <div className="rounded-xl border p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${Number(value)}/10`, "Avg Mood"]} />
                  <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Not enough data for this chart" />
          )}
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Weather Correlation
          </h3>
          {weatherData ? (
            <div className="rounded-xl border p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weatherData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="weather" tick={{ fontSize: 11 }} />
                  <YAxis domain={[1, 10]} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`${Number(value)}/10`, "Avg Mood"]} />
                  <Bar dataKey="score" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Not enough data for this chart" />
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Wellbeing Trends
        </h3>
        {wellbeingData ? (
          <div className="rounded-xl border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={wellbeingData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => format(new Date(v), "MMM d")}
                />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip
                  labelFormatter={(v) => format(new Date(v), "MMM d, yyyy")}
                />
                <Legend />
                <Line type="monotone" dataKey="energy" stroke="#22c55e" strokeWidth={2} name="Energy" />
                <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} name="Stress" />
                <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} name="Sleep (hrs)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label="Not enough data for this chart" />
        )}
      </div>

      <div>
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Activity Impact
        </h3>
        {activityData ? (
          <div className="rounded-xl border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" domain={[1, 10]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="activity" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(value) => [`${Number(value)}/10`, "Avg Mood"]} />
                <Bar dataKey="score" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label="Not enough data for this chart" />
        )}
      </div>
    </div>
  )
}
