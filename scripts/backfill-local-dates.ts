import { loadEnvConfig } from "@next/env"
import { isValidDateOnly, utcDateOnly } from "../lib/dates"

const BATCH_SIZE = 500

type BackfillRow = {
  id: string
  userId: string
  date: Date
  localDate: string | null
}

async function main() {
  loadEnvConfig(process.cwd())
  const { prisma } = await import("../lib/prisma")
  const dryRun = process.argv.includes("--dry-run")
  let cursor: string | null = null
  let scanned = 0
  let updated = 0
  let alreadySet = 0
  const byUserAndDate = new Map<string, number>()

  try {
    while (true) {
      const rows: BackfillRow[] = await prisma.moodEntry.findMany({
        where: cursor ? { id: { gt: cursor } } : {},
        orderBy: { id: "asc" },
        take: BATCH_SIZE,
        select: { id: true, userId: true, date: true, localDate: true },
      })
      if (rows.length === 0) break

      for (const row of rows) {
        scanned++
        const legacyDate = utcDateOnly(row.date)
        const effectiveDate = isValidDateOnly(row.localDate) ? row.localDate : legacyDate
        const key = `${row.userId}\u0000${effectiveDate}`
        byUserAndDate.set(key, (byUserAndDate.get(key) ?? 0) + 1)

        if (row.localDate === null) {
          if (dryRun) {
            updated++
          } else {
            const result = await prisma.moodEntry.updateMany({
              where: { id: row.id, localDate: null },
              data: { localDate: legacyDate },
            })
            if (result.count > 0) updated++
            else alreadySet++
          }
        } else {
          alreadySet++
        }
      }

      cursor = rows[rows.length - 1].id
    }

    const duplicates = Array.from(byUserAndDate.entries())
      .filter(([, count]) => count > 1)
      .map(([key, count]) => {
        const [userId, localDate] = key.split("\u0000")
        return { userId, localDate, count }
      })
      .sort((a, b) => a.userId.localeCompare(b.userId) || a.localDate.localeCompare(b.localDate))

    console.log(`Scanned ${scanned} entries.`)
    console.log(`${dryRun ? "Would update" : "Updated"} ${updated}; already set ${alreadySet}.`)
    console.log(`Duplicate user/localDate groups: ${duplicates.length}.`)
    for (const duplicate of duplicates) {
      console.log(`${duplicate.userId} ${duplicate.localDate}: ${duplicate.count} entries`)
    }
    console.log("No rows were deleted or merged.")
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error("Local-date backfill failed", error)
  process.exitCode = 1
})
