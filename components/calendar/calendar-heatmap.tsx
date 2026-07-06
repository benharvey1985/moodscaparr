"use client"

import { useMemo } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MOODS, type MoodCategory } from "@/types/mood"
import type { MoodEntry } from "@/types/mood"

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function getCellColor(entry: MoodEntry | undefined): string {
  if (!entry) return "bg-muted/50"
  const intensity = entry.intensity
  if (entry.category === "POSITIVE") {
    if (intensity <= 3) return "bg-[var(--color-mood-positive-light)]"
    if (intensity <= 7) return "bg-[var(--color-mood-positive-medium)]"
    return "bg-[var(--color-mood-positive-dark)]"
  }
  if (entry.category === "NEUTRAL") {
    if (intensity <= 3) return "bg-[var(--color-mood-neutral-light)]"
    if (intensity <= 7) return "bg-[var(--color-mood-neutral-medium)]"
    return "bg-[var(--color-mood-neutral-dark)]"
  }
  if (intensity <= 3) return "bg-[var(--color-mood-negative-light)]"
  if (intensity <= 7) return "bg-[var(--color-mood-negative-medium)]"
  return "bg-[var(--color-mood-negative-dark)]"
}

function getMoodEmoji(entry: MoodEntry | undefined): string {
  if (!entry) return ""
  const moods = MOODS[entry.category as MoodCategory]
  return moods?.[entry.moodIndex]?.emoji ?? ""
}

function getMoodLabel(entry: MoodEntry | undefined): string {
  if (!entry) return ""
  const moods = MOODS[entry.category as MoodCategory]
  return moods?.[entry.moodIndex]?.label ?? ""
}

interface CalendarHeatmapProps {
  entries: MoodEntry[]
  month: string
  onMonthChange: (month: string) => void
  onDayClick: (entry: MoodEntry | null, dateStr: string) => void
}

export function CalendarHeatmap({ entries, month, onMonthChange, onDayClick }: CalendarHeatmapProps) {
  const [year, m] = month.split("-").map(Number)
  const currentDate = new Date(year, m - 1)

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart)
    const calEnd = endOfWeek(monthEnd)
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentDate])

  const entryMap = useMemo(() => {
    const map = new Map<string, MoodEntry>()
    for (const e of entries) {
      const key = format(new Date(e.date), "yyyy-MM-dd")
      if (!map.has(key)) map.set(key, e)
    }
    return map
  }, [entries])

  function handlePrev() {
    const prev = subMonths(currentDate, 1)
    onMonthChange(format(prev, "yyyy-MM"))
  }

  function handleNext() {
    const next = addMonths(currentDate, 1)
    onMonthChange(format(next, "yyyy-MM"))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={handlePrev}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm font-semibold">
          {format(currentDate, "MMMM yyyy")}
        </span>
        <Button variant="ghost" size="icon-sm" onClick={handleNext}>
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d[0]}</span>
          </div>
        ))}

        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          const entry = entryMap.get(dateStr)
          const isCurrentMonth = day.getMonth() === currentDate.getMonth()
          const todayMatch = isToday(day)

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick(entry || null, dateStr)}
              className={cn(
                "relative flex items-center justify-center rounded-md text-xs transition-colors",
                "size-8 sm:size-9",
                isCurrentMonth ? getCellColor(entry) : "bg-transparent",
                todayMatch && "ring-2 ring-primary ring-offset-1",
                isCurrentMonth && entry && "cursor-pointer hover:opacity-80",
                isCurrentMonth && !entry && "cursor-default"
              )}
              title={entry ? `${getMoodLabel(entry)} - ${dateStr}` : dateStr}
            >
              <span className={cn(
                "tabular-nums",
                !isCurrentMonth && "text-muted-foreground/30",
                entry && "font-medium text-white"
              )}>
                {format(day, "d")}
              </span>
              {entry && (
                <span className="absolute -top-1 -right-1 text-[10px] sm:hidden">
                  {getMoodEmoji(entry)}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
