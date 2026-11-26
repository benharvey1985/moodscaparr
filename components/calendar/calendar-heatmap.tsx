"use client"

import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatLocalDate, todayInTimeZone } from "@/lib/dates"
import { MOODS, type MoodCategory, type MoodEntry } from "@/types/mood"
import { getCalendarDays, indexEntriesByLocalDate } from "@/components/calendar/calendar-data"
import { MonthNavigation } from "@/components/calendar/month-navigation"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const CATEGORY_LABELS: Record<MoodCategory, string> = {
  POSITIVE: "Positive",
  NEUTRAL: "Neutral",
  NEGATIVE: "Negative",
}

const CELL_COLORS: Record<MoodCategory, { light: string; medium: string; dark: string }> = {
  POSITIVE: {
    light: "bg-mood-positive-light",
    medium: "bg-mood-positive-medium",
    dark: "bg-mood-positive-dark",
  },
  NEUTRAL: {
    light: "bg-mood-neutral-light",
    medium: "bg-mood-neutral-medium",
    dark: "bg-mood-neutral-dark",
  },
  NEGATIVE: {
    light: "bg-mood-negative-light",
    medium: "bg-mood-negative-medium",
    dark: "bg-mood-negative-dark",
  },
}

function getCellColor(entry: MoodEntry | undefined): string {
  if (!entry) return "bg-muted/50"
  const shade = entry.intensity <= 3 ? "light" : entry.intensity <= 7 ? "medium" : "dark"
  return CELL_COLORS[entry.category][shade]
}

function getDayLabel(entry: MoodEntry | undefined, date: string): string {
  const formattedDate = formatLocalDate(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  if (!entry) return `${formattedDate}. No entry. Log mood for this date.`

  const mood = MOODS[entry.category]?.[entry.moodIndex]
  return `${formattedDate}. ${mood?.label ?? "Unknown mood"}, ${CATEGORY_LABELS[entry.category]}, intensity ${entry.intensity} out of 10. View entry details.`
}

interface CalendarHeatmapProps {
  entries: MoodEntry[]
  month: string
  timezone: string
  onMonthChange: (month: string) => void
  onDayClick: (entry: MoodEntry | null, date: string) => void
}

export function CalendarHeatmap({
  entries,
  month,
  timezone,
  onMonthChange,
  onDayClick,
}: CalendarHeatmapProps) {
  const days = useMemo(() => getCalendarDays(month), [month])
  const entryMap = useMemo(() => indexEntriesByLocalDate(entries), [entries])
  const today = todayInTimeZone(timezone)

  return (
    <div className="space-y-3">
      <MonthNavigation month={month} onMonthChange={onMonthChange} />

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div key={day} className="py-1 text-center text-xs font-medium text-muted-foreground">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden" aria-hidden="true">{day[0]}</span>
            <span className="sr-only sm:hidden">{day}</span>
          </div>
        ))}

        {days.map((day) => {
          if (!day.isCurrentMonth) return <div key={day.date} aria-hidden="true" />

          const entry = entryMap.get(day.date)
          const mood = entry ? MOODS[entry.category]?.[entry.moodIndex] : undefined
          const label = getDayLabel(entry, day.date)
          const textColor = entry
            ? entry.intensity >= 8 ? "text-white" : "text-black"
            : "text-muted-foreground"

          return (
            <Button
              key={day.date}
              type="button"
              variant="ghost"
              className={cn(
                "h-auto min-h-11 w-full min-w-0 flex-col gap-0.5 rounded-md px-0 py-1 hover:bg-transparent",
                getCellColor(entry),
                textColor,
                day.date === today && "ring-2 ring-primary ring-offset-1",
                entry && "hover:opacity-80"
              )}
              aria-label={label}
              title={label}
              onClick={() => onDayClick(entry ?? null, day.date)}
            >
              <span className="tabular-nums">{day.dayOfMonth}</span>
              {mood && <span className="text-[10px] leading-none" aria-hidden="true">{mood.emoji}</span>}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
