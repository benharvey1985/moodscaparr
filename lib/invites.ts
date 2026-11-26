import { Prisma } from "../prisma/generated/prisma"
import { prisma } from "./prisma"
import {
  getInviteCodeError,
  inviteReservationExpiresAt,
  isInviteReservationActive,
  normalizeEmail,
} from "./invite-helpers"

export {
  getInviteCodeError,
  inviteReservationExpiresAt,
  isInviteReservationActive,
  normalizeEmail,
} from "./invite-helpers"

export type InviteResult =
  | { ok: true }
  | { ok: false; error: string; status: 400 | 409 }

export class InviteServiceBusyError extends Error {
  constructor() {
    super("Invite service is busy. Please retry.")
    this.name = "InviteServiceBusyError"
  }
}

function errorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null
  return typeof error.code === "string" ? error.code : null
}

function isRetryableTransactionError(error: unknown): boolean {
  return ["P2002", "P2034", "40001", "40P01"].includes(errorCode(error) ?? "")
}

async function withSerializableRetry<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>
): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(operation, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 10_000,
        timeout: 15_000,
      })
    } catch (error) {
      if (!isRetryableTransactionError(error)) throw error
      if (attempt === 2) throw new InviteServiceBusyError()
    }
  }

  throw new InviteServiceBusyError()
}

async function cleanupExpiredReservations(tx: Prisma.TransactionClient): Promise<void> {
  await tx.$executeRaw`
    WITH expired AS (
      DELETE FROM "InviteConsumption"
      WHERE "expiresAt" IS NULL OR "expiresAt" <= NOW()
      RETURNING "code"
    ), released AS (
      SELECT "code", COUNT(*)::int AS count
      FROM expired
      GROUP BY "code"
    )
    UPDATE "InviteCode" AS invite
    SET "uses" = GREATEST(invite."uses" - released.count, 0)
    FROM released
    WHERE invite."code" = released."code"
  `
}

export async function reserveInvite(rawEmail: string, rawCode: string): Promise<InviteResult> {
  const email = normalizeEmail(rawEmail)
  const code = rawCode.trim()

  if (!email || !code) {
    return { ok: false, error: "Code and email are required", status: 400 }
  }

  return withSerializableRetry(async (tx) => {
    await cleanupExpiredReservations(tx)

    const existing = await tx.inviteConsumption.findUnique({ where: { email } })
    if (existing) {
      if (existing.code !== code) {
        return {
          ok: false as const,
          error: "This email already has a pending invitation reservation",
          status: 409 as const,
        }
      }

      const invite = await tx.inviteCode.findUnique({ where: { code } })
      if (!invite?.active) {
        return { ok: false as const, error: "Invite code has been revoked", status: 400 as const }
      }
      if (invite.expiresAt.getTime() <= Date.now()) {
        return { ok: false as const, error: "Invite code has expired", status: 400 as const }
      }
      if (!isInviteReservationActive(existing.expiresAt)) {
        return {
          ok: false as const,
          error: "Invitation reservation has expired. Please validate again.",
          status: 400 as const,
        }
      }

      // The reservation already owns one use, so being at maxUses is valid here.
      return { ok: true as const }
    }

    const now = new Date()
    const invite = await tx.inviteCode.findUnique({ where: { code } })
    const inviteError = getInviteCodeError(invite, now)
    if (inviteError || !invite) {
      return { ok: false as const, error: inviteError ?? "Invalid invite code", status: 400 as const }
    }

    // A conditional UPDATE locks the invite row and compares both counters in SQL.
    const claimed = await tx.$queryRaw<Array<{ id: string }>>`
      UPDATE "InviteCode"
      SET "uses" = "uses" + 1
      WHERE "code" = ${code}
        AND "active" = true
        AND "expiresAt" > ${now}
        AND "uses" < "maxUses"
      RETURNING "id"
    `

    if (claimed.length === 0) {
      const current = await tx.inviteCode.findUnique({ where: { code } })
      return {
        ok: false as const,
        error: getInviteCodeError(current, new Date()) ?? "Invite code is no longer available",
        status: 400 as const,
      }
    }

    await tx.inviteConsumption.create({
      data: { email, code, expiresAt: inviteReservationExpiresAt(now) },
    })

    return { ok: true as const }
  })
}

export async function releaseInvite(rawEmail: string, rawCode: string): Promise<void> {
  const email = normalizeEmail(rawEmail)
  const code = rawCode.trim()
  if (!email || !code) return

  await withSerializableRetry(async (tx) => {
    await cleanupExpiredReservations(tx)

    const existing = await tx.inviteConsumption.findUnique({ where: { email } })
    if (!existing || existing.code !== code) return

    const deleted = await tx.inviteConsumption.deleteMany({
      where: { id: existing.id, email, code },
    })
    if (deleted.count === 0) return

    await tx.inviteCode.updateMany({
      where: { code, uses: { gt: 0 } },
      data: { uses: { decrement: 1 } },
    })
  })
}
