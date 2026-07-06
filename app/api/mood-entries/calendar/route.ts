import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 })
  }

  const [yearStr, monthStr] = month.split("-")
  const year = parseInt(yearStr, 10)
  const monthIndex = parseInt(monthStr, 10) - 1

  const start = new Date(year, monthIndex, 1)
  const end = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999)

  const [entries, firstEntry] = await Promise.all([
    prisma.moodEntry.findMany({
      where: {
        userId: session.user.id,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "asc" },
    }),
    prisma.moodEntry.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
      select: { date: true },
    }),
  ])

  const serialized = entries.map((e) => ({
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }))

  return NextResponse.json({
    entries: serialized,
    firstEntryDate: firstEntry ? firstEntry.date.toISOString() : null,
    month,
  })
}
