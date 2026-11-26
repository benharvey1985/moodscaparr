import { prisma } from "./prisma"

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetIn: number
}

export function rateLimit(options: { interval: number; max: number }) {
  if (!Number.isFinite(options.interval) || options.interval <= 0) {
    throw new Error("Rate-limit interval must be a positive number")
  }
  if (!Number.isInteger(options.max) || options.max <= 0) {
    throw new Error("Rate-limit max must be a positive integer")
  }

  return {
    async check(key: string): Promise<RateLimitResult> {
      const normalizedKey = key.trim()
      if (!normalizedKey) throw new Error("Rate-limit key is required")
      if (normalizedKey.length > 512) throw new Error("Rate-limit key is too long")

      const now = Date.now()
      const resetAt = BigInt(now + options.interval)

      return prisma.$transaction(async (tx) => {
        await tx.$executeRaw`DELETE FROM "ApiRateLimit" WHERE "resetAt" < ${now}`

        const [entry] = await tx.$queryRaw<Array<{ count: number; resetAt: bigint }>>`
          INSERT INTO "ApiRateLimit" ("key", "count", "resetAt")
          VALUES (${normalizedKey}, 1, ${resetAt})
          ON CONFLICT ("key") DO UPDATE
          SET "count" = CASE
                WHEN "ApiRateLimit"."resetAt" <= ${now} THEN 1
                ELSE "ApiRateLimit"."count" + 1
              END,
              "resetAt" = CASE
                WHEN "ApiRateLimit"."resetAt" <= ${now} THEN ${resetAt}
                ELSE "ApiRateLimit"."resetAt"
              END
          RETURNING "count", "resetAt"
        `

        if (!entry) throw new Error("Rate-limit upsert returned no row")
        const entryResetAt = Number(entry.resetAt)

        return {
          allowed: entry.count <= options.max,
          remaining: Math.max(0, options.max - entry.count),
          resetIn: Math.max(0, entryResetAt - now),
        }
      })
    },
  }
}
