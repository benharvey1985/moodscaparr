import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { serializeMoodEntry } from "@/lib/mood-validation"
import { MOODS, type MoodCategory } from "@/types/mood"
import { csvCell } from "@/lib/csv"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const records = await prisma.moodEntry.findMany({
    where: { userId: session.user.id },
    orderBy: [{ date: "desc" }],
  })
  const entries = records.map(serializeMoodEntry)

  const header = [
    "id",
    "localDate",
    "date",
    "category",
    "moodLabel",
    "moodIndex",
    "intensity",
    "activities",
    "weather",
    "sleepHours",
    "sleepQuality",
    "energyLevel",
    "stressLevel",
    "reflection1",
    "reflection2",
    "reflection3",
    "reflection4",
    "createdAt",
    "updatedAt",
  ]

  const rows = entries.map((entry) => {
    const mood = MOODS[entry.category as MoodCategory]?.[entry.moodIndex]
    return [
      entry.id,
      entry.localDate,
      entry.date,
      entry.category,
      mood?.label ?? "",
      entry.moodIndex,
      entry.intensity,
      entry.activities.join("; "),
      entry.weather,
      entry.sleepHours,
      entry.sleepQuality,
      entry.energyLevel,
      entry.stressLevel,
      entry.reflection1,
      entry.reflection2,
      entry.reflection3,
      entry.reflection4,
      entry.createdAt,
      entry.updatedAt,
    ]
      .map(csvCell)
      .join(",")
  })

  const filenameDate = new Date().toISOString().slice(0, 10)
  return new Response([header.map(csvCell).join(","), ...rows].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="moodscaparr-entries-${filenameDate}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
