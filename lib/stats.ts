import {
  calendarDayNumber,
  dayOfWeekIndex,
  isValidDateOnly,
  shiftDateOnly,
  todayInTimeZone,
  utcDateOnly,
} from "@/lib/dates"

export const STREAK_REST_DAYS_ALLOWED = 2

export interface StreakEntry {
  localDate?: string | null
  date?: Date | string
}

function localDateForEntry(entry: StreakEntry): string | null {
  if (isValidDateOnly(entry.localDate)) return entry.localDate
  if (!entry.date) return null
  try {
    return utcDateOnly(entry.date)
  } catch {
    return null
  }
}

function uniqueSortedDays(entries: StreakEntry[]): number[] {
  const days = new Set<number>()
  for (const entry of entries) {
    const localDate = localDateForEntry(entry)
    if (localDate) days.add(calendarDayNumber(localDate))
  }
  return Array.from(days).sort((a, b) => b - a)
}

function currentRunLength(days: number[], restDaysAllowed: number): number {
  if (days.length === 0) return 0

  let length = 1
  let restUsed = 0
  for (let index = 1; index < days.length; index++) {
    const missingDays = days[index - 1] - days[index] - 1
    if (missingDays === 0) {
      restUsed = 0
      length++
    } else if (missingDays <= restDaysAllowed - restUsed) {
      restUsed += missingDays
      length++
    } else {
      break
    }
  }
  return length
}

export function computeStreak(
  entries: StreakEntry[],
  timezone = "UTC",
  restDaysAllowed = STREAK_REST_DAYS_ALLOWED,
  now: Date = new Date()
): { current: number; longest: number } {
  if (!Number.isInteger(restDaysAllowed) || restDaysAllowed < 0) {
    throw new RangeError("restDaysAllowed must be a non-negative integer")
  }

  const days = uniqueSortedDays(entries)
  if (days.length === 0) return { current: 0, longest: 0 }

  const today = calendarDayNumber(todayInTimeZone(timezone, now))
  const current = today - days[0] <= restDaysAllowed
    ? currentRunLength(days, restDaysAllowed)
    : 0

  let longest = 1
  let run = 1
  let restUsed = 0
  for (let index = 1; index < days.length; index++) {
    const missingDays = days[index - 1] - days[index] - 1
    if (missingDays === 0) {
      restUsed = 0
      run++
      longest = Math.max(longest, run)
    } else if (missingDays <= restDaysAllowed - restUsed) {
      restUsed += missingDays
      run++
      longest = Math.max(longest, run)
    } else {
      run = 1
      restUsed = 0
    }
  }

  return { current, longest }
}

export function getAverageMoodScore(
  entries: Array<{ category: string; intensity: number }>
): number {
  if (entries.length === 0) return 0
  const total = entries.reduce((sum, entry) => {
    if (entry.category === "NEGATIVE") return sum + (11 - entry.intensity)
    return sum + entry.intensity
  }, 0)
  return Math.round((total / entries.length) * 10) / 10
}

export function getMoodBalance(
  entries: Array<{ category: string }>
): { positive: number; neutral: number; negative: number } {
  if (entries.length === 0) return { positive: 0, neutral: 0, negative: 0 }
  let positive = 0
  let neutral = 0
  let negative = 0
  for (const entry of entries) {
    if (entry.category === "POSITIVE") positive++
    else if (entry.category === "NEUTRAL") neutral++
    else negative++
  }
  const total = entries.length
  return {
    positive: Math.round((positive / total) * 100),
    neutral: Math.round((neutral / total) * 100),
    negative: Math.round((negative / total) * 100),
  }
}

export function getEntriesThisWeek(
  entries: StreakEntry[],
  timezone = "UTC",
  now: Date = new Date()
): number {
  const today = todayInTimeZone(timezone, now)
  const mondayOffset = dayOfWeekIndex(today) === 0 ? -6 : 1 - dayOfWeekIndex(today)
  const monday = calendarDayNumber(shiftDateOnly(today, mondayOffset))

  let count = 0
  for (const entry of entries) {
    const localDate = localDateForEntry(entry)
    if (localDate && calendarDayNumber(localDate) >= monday) count++
  }
  return count
}
