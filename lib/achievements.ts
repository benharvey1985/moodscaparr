import "server-only"
import { prisma } from "@/lib/prisma"
import { computeStreak } from "@/lib/stats"
import {
  ACHIEVEMENT_DEFINITIONS,
  type UserAchievement,
} from "@/types/achievements"

export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const records = await prisma.achievement.findMany({ where: { userId } })

  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const record = records.find((item) => item.badgeId === definition.id)
    return {
      id: record?.id ?? "",
      badgeId: definition.id,
      unlockedAt: (record?.unlockedAt ?? new Date(0)).toISOString(),
      progress: record?.progress ?? 0,
      maxProgress: definition.maxProgress,
      definition,
      isUnlocked: (record?.progress ?? 0) >= definition.maxProgress,
    }
  })
}

function localHour(createdAt: Date, timezone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hourCycle: "h23",
  }).formatToParts(createdAt)
  return Number.parseInt(parts.find((part) => part.type === "hour")?.value ?? "0", 10)
}

export interface AchievementCheckResult {
  badgeId: string
  progress: number
  isNewlyUnlocked: boolean
}

export async function checkAndUnlockAchievements(
  userId: string
): Promise<AchievementCheckResult[]> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`mood-entry:${userId}`}))`

    const [existing, entries, profile] = await Promise.all([
      tx.achievement.findMany({ where: { userId } }),
      tx.moodEntry.findMany({
        where: { userId },
        select: {
          localDate: true,
          date: true,
          category: true,
          moodIndex: true,
          activities: true,
          weather: true,
          reflection1: true,
          reflection2: true,
          reflection3: true,
          reflection4: true,
          createdAt: true,
        },
      }),
      tx.userProfile.findUnique({
        where: { id: userId },
        select: { timezone: true },
      }),
    ])

    const timezone = profile?.timezone ?? "UTC"
    const streak = computeStreak(entries, timezone)
    const distinctMoods = new Set(
      entries.map((entry) => `${entry.category}:${entry.moodIndex}`)
    ).size
    const distinctWeathers = new Set(
      entries.map((entry) => entry.weather).filter((value): value is string => !!value)
    ).size
    const maxActivities = entries.reduce(
      (maximum, entry) => Math.max(maximum, entry.activities.length),
      0
    )
    const totalReflections = entries.reduce(
      (total, entry) =>
        total +
        [entry.reflection1, entry.reflection2, entry.reflection3, entry.reflection4].filter(
          (value) => !!value
        ).length,
      0
    )
    const hasEarlyEntry = entries.some((entry) => localHour(entry.createdAt, timezone) < 9)
    const hasNightEntry = entries.some((entry) => localHour(entry.createdAt, timezone) >= 22)

    const progressByBadge: Record<string, number> = {
      "first-entry": entries.length,
      "double-digits": entries.length,
      "half-century": entries.length,
      century: entries.length,
      "week-warrior": streak.current,
      "month-master": streak.current,
      bimonthly: streak.current,
      endurance: streak.longest,
      "mood-explorer": distinctMoods,
      "weather-watcher": distinctWeathers,
      "activity-diver": maxActivities >= 5 ? 1 : 0,
      "reflection-king": totalReflections,
      "early-bird": hasEarlyEntry ? 1 : 0,
      "night-owl": hasNightEntry ? 1 : 0,
    }

    const newlyUnlocked: AchievementCheckResult[] = []
    const unlockedAt = new Date()

    for (const definition of ACHIEVEMENT_DEFINITIONS) {
      const record = existing.find((item) => item.badgeId === definition.id)
      const computed = Math.min(progressByBadge[definition.id] ?? 0, definition.maxProgress)
      const progress = Math.max(record?.progress ?? 0, computed)
      const wasUnlocked = (record?.progress ?? 0) >= definition.maxProgress
      const isUnlocked = progress >= definition.maxProgress

      if (!record) {
        await tx.achievement.create({
          data: {
            userId,
            badgeId: definition.id,
            progress,
            maxProgress: definition.maxProgress,
            ...(isUnlocked ? { unlockedAt } : {}),
          },
        })
      } else if (progress !== record.progress || record.maxProgress !== definition.maxProgress || (!wasUnlocked && isUnlocked)) {
        await tx.achievement.update({
          where: { userId_badgeId: { userId, badgeId: definition.id } },
          data: {
            progress,
            maxProgress: definition.maxProgress,
            ...(!wasUnlocked && isUnlocked ? { unlockedAt } : {}),
          },
        })
      }

      if (isUnlocked && !wasUnlocked) {
        newlyUnlocked.push({
          badgeId: definition.id,
          progress,
          isNewlyUnlocked: true,
        })
      }
    }

    return newlyUnlocked
  })
}

/** Achievement bookkeeping must never make an already-committed mood write fail. */
export async function checkAndUnlockAchievementsSafely(
  userId: string
): Promise<AchievementCheckResult[]> {
  try {
    return await checkAndUnlockAchievements(userId)
  } catch (error) {
    console.error("Achievement check failed after mood write", { userId, error })
    return []
  }
}
