import type { MoodEntry } from "@/types/mood"
import { isValidDateOnly, monthBounds, utcDateOnly } from "@/lib/dates"

export interface EffectiveDateEntry {
  localDate: string | null
  date: Date
}

export function calendarDateFilter(month: string) {
  const { start, end } = monthBounds(month)
  const utcStart = new Date(`${start}T00:00:00.000Z`)
  const utcEndExclusive = new Date(utcStart)
  utcEndExclusive.setUTCMonth(utcEndExclusive.getUTCMonth() + 1)

  return {
    OR: [
      { localDate: { gte: start, lte: end } },
      { localDate: null, date: { gte: utcStart, lt: utcEndExclusive } },
    ],
  }
}

export function earliestEffectiveEntryDate(entries: EffectiveDateEntry[]): string | null {
  let earliest: string | null = null
  for (const entry of entries) {
    const effectiveDate = isValidDateOnly(entry.localDate)
      ? entry.localDate
      : utcDateOnly(entry.date)
    if (earliest === null || effectiveDate < earliest) earliest = effectiveDate
  }
  return earliest
}

export interface CalendarResponse {
  entries: MoodEntry[]
  firstEntryDate: string | null
  month: string
  timezone: string
}

export async function fetchCalendarEntries(
  month: string,
  signal?: AbortSignal
): Promise<CalendarResponse> {
  const params = new URLSearchParams({ month })
  const response = await fetch(`/api/mood-entries/calendar?${params.toString()}`, {
    credentials: "include",
    signal,
  })
  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    throw new Error(payload?.error || "Failed to fetch calendar entries")
  }
  return response.json()
}
