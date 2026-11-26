import { dayOfWeekIndex } from "@/lib/dates"

export interface AnalyticsEntry {
  localDate: string
  category: string
  intensity: number
  weather?: string | null
  activities?: string[]
  energyLevel?: number | null
  stressLevel?: number | null
  sleepHours?: number | null
}

export interface MetricAverage {
  average: number | null
  count: number
}

export interface MoodDay {
  date: string
  score: number
  count: number
}

export interface DayOfWeekMood {
  day: string
  score: number
  count: number
}

export interface CategoryMood {
  category: string
  score: number
  count: number
}

export interface WellbeingDay {
  date: string
  energy: number | null
  stress: number | null
  sleep: number | null
  energyCount: number
  stressCount: number
  sleepCount: number
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

function roundOne(value: number): number {
  return Math.round(value * 10) / 10
}

export function moodScore(entry: Pick<AnalyticsEntry, "category" | "intensity">): number {
  return entry.category === "NEGATIVE" ? 11 - entry.intensity : entry.intensity
}

export function averagePresent(values: Array<number | null | undefined>): MetricAverage {
  const present = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value))
  return {
    average: present.length > 0 ? roundOne(present.reduce((sum, value) => sum + value, 0) / present.length) : null,
    count: present.length,
  }
}

export function groupMoodByDay(entries: AnalyticsEntry[]): MoodDay[] {
  const grouped = new Map<string, { score: number; count: number }>()
  for (const entry of entries) {
    const current = grouped.get(entry.localDate) ?? { score: 0, count: 0 }
    current.score += moodScore(entry)
    current.count++
    grouped.set(entry.localDate, current)
  }
  return Array.from(grouped, ([date, value]) => ({
    date,
    score: roundOne(value.score / value.count),
    count: value.count,
  })).sort((a, b) => a.date.localeCompare(b.date))
}

export function groupMoodByDayOfWeek(entries: AnalyticsEntry[]): DayOfWeekMood[] {
  const grouped = new Map<number, { score: number; count: number }>()
  for (const entry of entries) {
    const dayIndex = dayOfWeekIndex(entry.localDate)
    const current = grouped.get(dayIndex) ?? { score: 0, count: 0 }
    current.score += moodScore(entry)
    current.count++
    grouped.set(dayIndex, current)
  }
  return Array.from(grouped, ([dayIndex, value]) => ({
    day: DAY_NAMES[dayIndex],
    score: roundOne(value.score / value.count),
    count: value.count,
  })).sort((a, b) => DAY_NAMES.indexOf(a.day) - DAY_NAMES.indexOf(b.day))
}

export function groupMoodByWeather(entries: AnalyticsEntry[]): CategoryMood[] {
  const grouped = new Map<string, { score: number; count: number }>()
  for (const entry of entries) {
    if (!entry.weather) continue
    const current = grouped.get(entry.weather) ?? { score: 0, count: 0 }
    current.score += moodScore(entry)
    current.count++
    grouped.set(entry.weather, current)
  }
  return Array.from(grouped, ([category, value]) => ({
    category,
    score: roundOne(value.score / value.count),
    count: value.count,
  })).sort((a, b) => b.score - a.score)
}

export function groupMoodByActivity(entries: AnalyticsEntry[]): CategoryMood[] {
  const grouped = new Map<string, { score: number; count: number }>()
  for (const entry of entries) {
    for (const activity of entry.activities ?? []) {
      const current = grouped.get(activity) ?? { score: 0, count: 0 }
      current.score += moodScore(entry)
      current.count++
      grouped.set(activity, current)
    }
  }
  return Array.from(grouped, ([category, value]) => ({
    category,
    score: roundOne(value.score / value.count),
    count: value.count,
  })).sort((a, b) => b.score - a.score)
}

export function groupWellbeingByDay(entries: AnalyticsEntry[]): WellbeingDay[] {
  const grouped = new Map<string, {
    energy: number[]
    stress: number[]
    sleep: number[]
  }>()

  for (const entry of entries) {
    const current = grouped.get(entry.localDate) ?? { energy: [], stress: [], sleep: [] }
    if (typeof entry.energyLevel === "number") current.energy.push(entry.energyLevel)
    if (typeof entry.stressLevel === "number") current.stress.push(entry.stressLevel)
    if (typeof entry.sleepHours === "number") current.sleep.push(entry.sleepHours)
    grouped.set(entry.localDate, current)
  }

  return Array.from(grouped, ([date, values]) => {
    const energy = averagePresent(values.energy)
    const stress = averagePresent(values.stress)
    const sleep = averagePresent(values.sleep)
    return {
      date,
      energy: energy.average,
      stress: stress.average,
      sleep: sleep.average,
      energyCount: energy.count,
      stressCount: stress.count,
      sleepCount: sleep.count,
    }
  }).sort((a, b) => a.date.localeCompare(b.date))
}
