"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { BarChart3 } from "lucide-react"
import type { MoodEntry } from "@/types/mood"
import { formatLocalDate } from "@/lib/dates"
import {
  groupMoodByActivity,
  groupMoodByDay,
  groupMoodByDayOfWeek,
  groupMoodByWeather,
  groupWellbeingByDay,
} from "@/components/analytics/analytics-data"
import { ChartDataTable } from "@/components/analytics/chart-data-table"

interface TrendsTabProps {
  entries: MoodEntry[] | undefined
}

const TOOLTIP_STYLE = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
}

const AXIS_TICK = { fill: "var(--muted-foreground)", fontSize: 11 }

function shortDate(date: string): string {
  return formatLocalDate(date, { month: "short", day: "numeric" })
}

function longDate(date: string): string {
  return formatLocalDate(date, { month: "short", day: "numeric", year: "numeric" })
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed">
      <div className="text-center">
        <BarChart3 className="mx-auto mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function TrendsTab({ entries }: TrendsTabProps) {
  const moodTimelineData = useMemo(() => groupMoodByDay(entries ?? []), [entries])
  const dayOfWeekData = useMemo(() => groupMoodByDayOfWeek(entries ?? []), [entries])
  const weatherData = useMemo(() => groupMoodByWeather(entries ?? []), [entries])
  const activityData = useMemo(() => groupMoodByActivity(entries ?? []), [entries])
  const wellbeingData = useMemo(() => groupWellbeingByDay(entries ?? []), [entries])
  const energyStressData = wellbeingData.filter((day) => day.energy !== null || day.stress !== null)
  const sleepData = wellbeingData.filter((day) => day.sleep !== null)

  const energyCount = entries?.filter((entry) => entry.energyLevel !== null).length ?? 0
  const stressCount = entries?.filter((entry) => entry.stressLevel !== null).length ?? 0
  const sleepCount = entries?.filter((entry) => entry.sleepHours !== null).length ?? 0
  const totalEntries = entries?.length ?? 0

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">Mood Timeline</h2>
        {moodTimelineData.length > 0 ? (
          <div className="rounded-xl border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodTimelineData} accessibilityLayer title="Average mood score by local date">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={AXIS_TICK} tickFormatter={shortDate} />
                <YAxis domain={[1, 10]} tick={AXIS_TICK} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={(value) => longDate(String(value))}
                  formatter={(value) => [`${Number(value)}/10`, "Mood Score"]}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Mood Score"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--chart-1)" }}
                  activeDot={{ r: 6 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <ChartDataTable
              caption="Average mood score by local date"
              summary={`${moodTimelineData.length} days with entries. Scores range from 1 to 10.`}
              columns={[
                { key: "date", label: "Local date", value: (row) => longDate(row.date) },
                { key: "score", label: "Avg mood", value: (row) => `${row.score}/10` },
                { key: "count", label: "Entries", value: (row) => row.count },
              ]}
              rows={moodTimelineData}
            />
          </div>
        ) : <EmptyChart label="No mood entries in this range" />}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">Day of Week</h2>
          {dayOfWeekData.length > 0 ? (
            <div className="rounded-xl border p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dayOfWeekData} accessibilityLayer title="Average mood score by day of week">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={AXIS_TICK} />
                  <YAxis domain={[1, 10]} tick={AXIS_TICK} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${Number(value)}/10`, "Avg Mood"]} />
                  <Bar dataKey="score" name="Avg Mood" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <ChartDataTable
                caption="Average mood score by day of week"
                summary="Weekday labels use each entry's profile-local calendar date."
                columns={[
                  { key: "day", label: "Day", value: (row) => row.day },
                  { key: "score", label: "Avg mood", value: (row) => `${row.score}/10` },
                  { key: "count", label: "Entries", value: (row) => row.count },
                ]}
                rows={dayOfWeekData}
              />
            </div>
          ) : <EmptyChart label="No entries for day-of-week trends" />}
        </section>

        <section>
          <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">Weather Correlation</h2>
          {weatherData.length > 0 ? (
            <div className="rounded-xl border p-4">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weatherData} accessibilityLayer title="Average mood score by weather">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="category" tick={AXIS_TICK} />
                  <YAxis domain={[1, 10]} tick={AXIS_TICK} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${Number(value)}/10`, "Avg Mood"]} />
                  <Bar dataKey="score" name="Avg Mood" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <ChartDataTable
                caption="Average mood score by weather"
                summary={`${weatherData.length} weather categories with recorded entries.`}
                columns={[
                  { key: "weather", label: "Weather", value: (row) => row.category },
                  { key: "score", label: "Avg mood", value: (row) => `${row.score}/10` },
                  { key: "count", label: "Entries", value: (row) => row.count },
                ]}
                rows={weatherData}
              />
            </div>
          ) : <EmptyChart label="No weather data in this range" />}
        </section>
      </div>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">Energy &amp; Stress Trends</h2>
        {energyStressData.length > 0 ? (
          <div className="rounded-xl border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyStressData} accessibilityLayer title="Energy and stress by local date">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={AXIS_TICK} tickFormatter={shortDate} />
                <YAxis yAxisId="energy-stress" domain={[0, 10]} tick={AXIS_TICK} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={(value) => longDate(String(value))}
                  formatter={(value, name) => [`${Number(value)}/10`, String(name)]}
                />
                <Legend />
                <Line yAxisId="energy-stress" type="monotone" dataKey="energy" name="Energy" stroke="var(--chart-4)" strokeWidth={2} connectNulls={false} />
                <Line yAxisId="energy-stress" type="monotone" dataKey="stress" name="Stress" stroke="var(--chart-5)" strokeWidth={2} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
            <ChartDataTable
              caption="Energy and stress by local date"
              summary={`Energy recorded in ${energyCount} of ${totalEntries} entries; stress recorded in ${stressCount} of ${totalEntries}. Missing values stay unrecorded.`}
              columns={[
                { key: "date", label: "Local date", value: (row) => longDate(row.date) },
                { key: "energy", label: "Energy", value: (row) => row.energy === null ? "Not recorded" : `${row.energy}/10` },
                { key: "stress", label: "Stress", value: (row) => row.stress === null ? "Not recorded" : `${row.stress}/10` },
              ]}
              rows={energyStressData}
            />
          </div>
        ) : <EmptyChart label="No energy or stress data in this range" />}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">Sleep Trends</h2>
        {sleepData.length > 0 ? (
          <div className="rounded-xl border p-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sleepData} accessibilityLayer title="Sleep hours by local date">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={AXIS_TICK} tickFormatter={shortDate} />
                <YAxis domain={[0, 24]} tick={AXIS_TICK} />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  labelFormatter={(value) => longDate(String(value))}
                  formatter={(value) => [`${Number(value)} hours`, "Sleep"]}
                />
                <Line type="monotone" dataKey="sleep" name="Sleep Hours" stroke="var(--chart-1)" strokeWidth={2} connectNulls={false} />
              </LineChart>
            </ResponsiveContainer>
            <ChartDataTable
              caption="Sleep hours by local date"
              summary={`Sleep recorded in ${sleepCount} of ${totalEntries} entries. Sleep uses a separate 0–24 hour scale.`}
              columns={[
                { key: "date", label: "Local date", value: (row) => longDate(row.date) },
                { key: "sleep", label: "Sleep", value: (row) => row.sleep === null ? "Not recorded" : `${row.sleep} hours` },
              ]}
              rows={sleepData}
            />
          </div>
        ) : <EmptyChart label="No sleep data in this range" />}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold tracking-wider text-muted-foreground uppercase">Activity Impact</h2>
        {activityData.length > 0 ? (
          <div className="rounded-xl border p-4">
            <ResponsiveContainer width="100%" height={Math.max(260, activityData.length * 36)}>
              <BarChart data={activityData} layout="vertical" accessibilityLayer title="Average mood score by activity">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" domain={[1, 10]} tick={AXIS_TICK} />
                <YAxis type="category" dataKey="category" tick={AXIS_TICK} width={90} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${Number(value)}/10`, "Avg Mood"]} />
                <Bar dataKey="score" name="Avg Mood" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <ChartDataTable
              caption="Average mood score by activity"
              summary={`${activityData.length} activities with recorded entries.`}
              columns={[
                { key: "activity", label: "Activity", value: (row) => row.category },
                { key: "score", label: "Avg mood", value: (row) => `${row.score}/10` },
                { key: "count", label: "Entries", value: (row) => row.count },
              ]}
              rows={activityData}
            />
          </div>
        ) : <EmptyChart label="No activity data in this range" />}
      </section>
    </div>
  )
}
