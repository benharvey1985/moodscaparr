"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatLocalDate } from "@/lib/dates"
import { shiftCalendarMonth } from "@/components/calendar/calendar-data"

interface MonthNavigationProps {
  month: string
  onMonthChange: (month: string) => void
  disabled?: boolean
}

export function monthLabel(month: string): string {
  return formatLocalDate(`${month}-01`, { month: "long", year: "numeric" })
}

export function MonthNavigation({ month, onMonthChange, disabled = false }: MonthNavigationProps) {
  const previousMonth = shiftCalendarMonth(month, -1)
  const nextMonth = shiftCalendarMonth(month, 1)
  const label = monthLabel(month)

  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label={`Previous month, ${monthLabel(previousMonth)}`}
        disabled={disabled}
        onClick={() => onMonthChange(previousMonth)}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <h3 className="text-sm font-semibold" aria-live="polite" aria-atomic="true">{label}</h3>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label={`Next month, ${monthLabel(nextMonth)}`}
        disabled={disabled}
        onClick={() => onMonthChange(nextMonth)}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  )
}
