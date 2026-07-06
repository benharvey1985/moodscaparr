import type { MoodEntry } from "@/types/mood"

export interface CalendarResponse {
  entries: MoodEntry[]
  firstEntryDate: string | null
  month: string
}

export async function fetchCalendarEntries(month: string): Promise<CalendarResponse> {
  const res = await fetch(`/api/mood-entries/calendar?month=${month}`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to fetch calendar entries")
  return res.json()
}
