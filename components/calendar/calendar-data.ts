import { dayOfWeekIndex, isValidDateOnly } from "@/lib/dates"

export interface CalendarDay {
  date: string
  dayOfMonth: number
  isCurrentMonth: boolean
}

export function shiftCalendarMonth(month: string, offset: number): string {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return month

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1 + offset
  const shifted = new Date(Date.UTC(year, monthIndex, 1))
  return shifted.toISOString().slice(0, 7)
}

export function getCalendarDays(month: string): CalendarDay[] {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) return []

  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  const firstDate = `${month}-01`
  const leadingDays = dayOfWeekIndex(firstDate)
  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
  const cellCount = Math.ceil((leadingDays + daysInMonth) / 7) * 7

  return Array.from({ length: cellCount }, (_, index) => {
    const date = new Date(Date.UTC(year, monthIndex, index - leadingDays + 1))
    const dateOnly = date.toISOString().slice(0, 10)
    return {
      date: dateOnly,
      dayOfMonth: date.getUTCDate(),
      isCurrentMonth: dateOnly.startsWith(`${month}-`),
    }
  })
}

export function indexEntriesByLocalDate<T extends { localDate: string | null }>(
  entries: T[]
): Map<string, T> {
  const index = new Map<string, T>()
  for (const entry of entries) {
    if (!isValidDateOnly(entry.localDate) || index.has(entry.localDate)) continue
    index.set(entry.localDate, entry)
  }
  return index
}
