import "server-only"
import { prisma } from "@/lib/prisma"
import { ACHIEVEMENT_DEFINITIONS, getDefinition, type UserAchievement } from "@/types/achievements"

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const records = await prisma.achievement.findMany({
    where: { userId },
  })

  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const record = records.find((r) => r.badgeId === def.id)
    return {
      id: record?.id ?? "",
      badgeId: def.id,
      unlockedAt: (record?.unlockedAt ?? new Date(0)).toISOString(),
      progress: record?.progress ?? 0,
      maxProgress: def.maxProgress,
      definition: def,
      isUnlocked: !!record,
    }
  })
}

async function countEntries(userId: string): Promise<number> {
  return prisma.moodEntry.count({ where: { userId } })
}

async function getCurrentStreak(userId: string): Promise<number> {
  const entries = await prisma.moodEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  })

  if (entries.length === 0) return 0

  const dates = [...new Set(entries.map((e) => {
    const d = new Date(e.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }))].sort().reverse()

  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

async function getLongestStreak(userId: string): Promise<number> {
  const entries = await prisma.moodEntry.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true },
  })

  if (entries.length === 0) return 0

  const dates = [...new Set(entries.map((e) => {
    const d = new Date(e.date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }))].sort()

  let longest = 1
  let current = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    if (diff === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }
  return Math.max(longest, current)
}

async function distinctMoods(userId: string): Promise<number> {
  const result = await prisma.moodEntry.findMany({
    where: { userId },
    select: { moodIndex: true },
    distinct: ["moodIndex"],
  })
  return result.length
}

async function distinctWeathers(userId: string): Promise<number> {
  const result = await prisma.moodEntry.findMany({
    where: { userId, weather: { not: null } },
    select: { weather: true },
    distinct: ["weather"],
  })
  return result.length
}

async function maxActivitiesInOneEntry(userId: string): Promise<number> {
  const entries = await prisma.moodEntry.findMany({
    where: { userId },
    select: { activities: true },
  })
  if (entries.length === 0) return 0
  return Math.max(...entries.map((e) => e.activities.length))
}

async function totalReflections(userId: string): Promise<number> {
  const entries = await prisma.moodEntry.findMany({
    where: { userId },
    select: { reflection1: true, reflection2: true, reflection3: true, reflection4: true },
  })
  return entries.reduce((sum, e) => {
    let count = 0
    if (e.reflection1) count++
    if (e.reflection2) count++
    if (e.reflection3) count++
    if (e.reflection4) count++
    return sum + count
  }, 0)
}

async function hasEntryBeforeHour(userId: string, hour: number): Promise<boolean> {
  const userTz = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { timezone: true },
  })
  const tz = userTz?.timezone ?? "UTC"

  const entries = await prisma.moodEntry.findMany({
    where: { userId },
    select: { date: true },
  })

  return entries.some((e) => {
    const localHour = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour: "numeric",
      hour12: false,
    }).format(new Date(e.date))
    const h = parseInt(localHour, 10)
    return hour < 12 ? h < hour : h >= hour
  })
}

interface CheckResult {
  badgeId: string
  progress: number
  isNewlyUnlocked: boolean
}

export async function checkAndUnlockAchievements(userId: string): Promise<CheckResult[]> {
  const existing = await prisma.achievement.findMany({
    where: { userId },
  })
  const existingBadgeIds = new Set(existing.map((r) => r.badgeId))

  const functions: Record<string, () => Promise<number>> = {
    "first-entry": () => countEntries(userId),
    "double-digits": () => countEntries(userId),
    "half-century": () => countEntries(userId),
    "century": () => countEntries(userId),
    "week-warrior": () => getCurrentStreak(userId),
    "month-master": () => getCurrentStreak(userId),
    "bimonthly": () => getCurrentStreak(userId),
    "endurance": () => getLongestStreak(userId),
    "mood-explorer": () => distinctMoods(userId),
    "weather-watcher": () => distinctWeathers(userId),
    "activity-diver": () => maxActivitiesInOneEntry(userId),
    "reflection-king": () => totalReflections(userId),
    "early-bird": () => hasEntryBeforeHour(userId, 9).then((v) => (v ? 1 : 0)),
    "night-owl": () => hasEntryBeforeHour(userId, 22).then((v) => (v ? 1 : 0)),
  }

  const results: CheckResult[] = []

  for (const def of ACHIEVEMENT_DEFINITIONS) {
    const fn = functions[def.id]
    if (!fn) continue

    const currentProgress = Math.min(await fn(), def.maxProgress)
    const isUnlocked = currentProgress >= def.maxProgress
    const wasUnlocked = existingBadgeIds.has(def.id)

    const wasUpdated = existingBadgeIds.has(def.id)

    if (isUnlocked && !wasUnlocked) {
      await prisma.achievement.create({
        data: {
          userId,
          badgeId: def.id,
          progress: currentProgress,
          maxProgress: def.maxProgress,
        },
      })
      results.push({ badgeId: def.id, progress: currentProgress, isNewlyUnlocked: true })
    } else if (wasUnlocked) {
      results.push({ badgeId: def.id, progress: currentProgress, isNewlyUnlocked: false })
    } else {
      await prisma.achievement.upsert({
        where: { userId_badgeId: { userId, badgeId: def.id } },
        update: { progress: currentProgress },
        create: {
          userId,
          badgeId: def.id,
          progress: currentProgress,
          maxProgress: def.maxProgress,
        },
      })
      results.push({ badgeId: def.id, progress: currentProgress, isNewlyUnlocked: false })
    }
  }

  return results.filter((r) => r.isNewlyUnlocked)
}
