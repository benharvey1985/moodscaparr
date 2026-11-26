import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { isValidTimeZone } from "@/lib/dates"
import { serializeMoodEntry } from "@/lib/mood-validation"
import { calendarDateFilter, earliestEffectiveEntryDate } from "@/lib/api/calendar"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")
  if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 })
  }

  let dateFilter: ReturnType<typeof calendarDateFilter>
  try {
    dateFilter = calendarDateFilter(month)
  } catch {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM" }, { status: 400 })
  }

  const [entries, firstDatedEntry, firstLegacyEntry, profile] = await Promise.all([
    prisma.moodEntry.findMany({
      where: {
        userId: session.user.id,
        ...dateFilter,
      },
      orderBy: [{ localDate: "asc" }, { date: "asc" }],
    }),
    prisma.moodEntry.findFirst({
      where: { userId: session.user.id, localDate: { not: null } },
      orderBy: { localDate: "asc" },
      select: { localDate: true, date: true },
    }),
    prisma.moodEntry.findFirst({
      where: { userId: session.user.id, localDate: null },
      orderBy: { date: "asc" },
      select: { localDate: true, date: true },
    }),
    prisma.userProfile.findUnique({
      where: { id: session.user.id },
      select: { timezone: true },
    }),
  ])

  const timezone = isValidTimeZone(profile?.timezone) ? profile.timezone : "UTC"
  const firstEntryDate = earliestEffectiveEntryDate([
    ...(firstDatedEntry ? [firstDatedEntry] : []),
    ...(firstLegacyEntry ? [firstLegacyEntry] : []),
  ])

  return NextResponse.json({
    entries: entries.map(serializeMoodEntry),
    firstEntryDate,
    month,
    timezone,
  })
}
