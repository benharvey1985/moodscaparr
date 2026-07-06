import { differenceInCalendarDays } from "date-fns"

function toLocalMidnight(date: Date, timezone: string): Date {
  const localStr = date.toLocaleDateString("en-CA", { timeZone: timezone })
  const [y, m, d] = localStr.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function computeStreak(
  entries: Array<{ date: Date }>,
  timezone: string,
  restDaysAllowed = 2
): { current: number; longest: number } {
  const seen = new Set<number>()

  for (const entry of entries) {
    const localDate = toLocalMidnight(new Date(entry.date), timezone)
    seen.add(localDate.getTime())
  }

  const sorted = Array.from(seen)
    .map((ts) => new Date(ts))
    .sort((a, b) => b.getTime() - a.getTime())

  if (sorted.length === 0) return { current: 0, longest: 0 }

  const today = toLocalMidnight(new Date(), timezone)

  let current = 0
  const daysSinceLastEntry = differenceInCalendarDays(today, sorted[0])

  if (daysSinceLastEntry <= restDaysAllowed) {
    current = 1
    let restUsed = 0

    for (let i = 1; i < sorted.length; i++) {
      const diff = differenceInCalendarDays(sorted[i - 1], sorted[i])
      if (diff === 1) {
        current++
        restUsed = 0
      } else if (diff - 1 <= restDaysAllowed - restUsed) {
        restUsed += diff - 1
        current++
      } else {
        break
      }
    }
  }

  let longest = 1
  let temp = 1
  let restUsed = 0

  for (let i = 1; i < sorted.length; i++) {
    const diff = differenceInCalendarDays(sorted[i - 1], sorted[i])
    if (diff === 1) {
      temp++
      restUsed = 0
    } else if (diff - 1 <= restDaysAllowed - restUsed) {
      restUsed += diff - 1
      temp++
    } else {
      longest = Math.max(longest, temp)
      temp = 1
      restUsed = 0
    }
  }
  longest = Math.max(longest, temp)

  return { current, longest }
}

export function getAverageMoodScore(
  entries: Array<{ category: string; intensity: number }>
): number {
  if (entries.length === 0) return 0
  const total = entries.reduce((sum, e) => {
    if (e.category === "NEGATIVE") return sum + (11 - e.intensity)
    return sum + e.intensity
  }, 0)
  return Math.round((total / entries.length) * 10) / 10
}

export function getMoodBalance(
  entries: Array<{ category: string }>
): { positive: number; neutral: number; negative: number } {
  if (entries.length === 0) return { positive: 0, neutral: 0, negative: 0 }
  let pos = 0
  let neu = 0
  let neg = 0
  for (const e of entries) {
    if (e.category === "POSITIVE") pos++
    else if (e.category === "NEUTRAL") neu++
    else neg++
  }
  const total = entries.length
  return {
    positive: Math.round((pos / total) * 100),
    neutral: Math.round((neu / total) * 100),
    negative: Math.round((neg / total) * 100),
  }
}

export function getEntriesThisWeek(
  entries: Array<{ date: Date }>,
  timezone: string
): number {
  const today = toLocalMidnight(new Date(), timezone)
  const dayOfWeek = today.getUTCDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(today)
  monday.setUTCDate(today.getUTCDate() + mondayOffset)

  let count = 0
  for (const entry of entries) {
    const localDate = toLocalMidnight(new Date(entry.date), timezone)
    if (localDate >= monday) count++
  }
  return count
}
