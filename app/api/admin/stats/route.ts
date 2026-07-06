import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { subDays, startOfMonth } from "date-fns"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const thirtyDaysAgo = subDays(new Date(), 30)

  const [totalUsers, activeUsers, totalEntries, allEntries, profileCount] = await Promise.all([
    prisma.user.count(),
    prisma.moodEntry.groupBy({
      by: ["userId"],
      where: { date: { gte: thirtyDaysAgo } },
    }),
    prisma.moodEntry.count(),
    prisma.moodEntry.findMany({ select: { category: true, userId: true } }),
    prisma.userProfile.count(),
  ])

  const profileStreaks = await prisma.userProfile.findMany({
    where: { streakGoal: { gt: 0 } },
    select: { streakGoal: true },
  })
  const avgStreak = profileStreaks.length
    ? Math.round(profileStreaks.reduce((s, p) => s + p.streakGoal, 0) / profileStreaks.length)
    : 0

  const total = allEntries.length
  const positive = allEntries.filter((e) => e.category === "POSITIVE").length
  const neutral = allEntries.filter((e) => e.category === "NEUTRAL").length
  const negative = allEntries.filter((e) => e.category === "NEGATIVE").length
  const moodDistribution = {
    POSITIVE: total ? Math.round((positive / total) * 100) : 0,
    NEUTRAL: total ? Math.round((neutral / total) * 100) : 0,
    NEGATIVE: total ? Math.round((negative / total) * 100) : 0,
  }

  const twelveMonthsAgo = startOfMonth(subDays(new Date(), 365))
  const usersByMonth = await prisma.user.findMany({
    where: { createdAt: { gte: twelveMonthsAgo } },
    select: { createdAt: true },
  })
  const monthLabels: string[] = []
  const monthCounts: number[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const label = d.toLocaleString("en-US", { month: "short", year: "numeric" })
    monthLabels.push(label)
    const start = startOfMonth(d)
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    monthCounts.push(usersByMonth.filter((u) => u.createdAt >= start && u.createdAt <= end).length)
  }

  return NextResponse.json({
    totalUsers,
    activeUsers: activeUsers.length,
    totalEntries: totalEntries,
    avgStreak,
    registrationTrend: monthLabels.map((label, i) => ({
      month: label,
      count: monthCounts[i],
    })),
    moodDistribution,
  })
}
