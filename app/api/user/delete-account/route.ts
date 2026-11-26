import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { getServerSessionDetails } from "@/lib/auth-actions"
import { prisma } from "@/lib/prisma"
import { rateLimit } from "@/lib/rate-limit"
import { ADMIN_MUTATION_LOCK_ID } from "@/lib/admin-mutation-lock"
import { isLastActiveAdmin } from "@/lib/admin-guards"
import { audit } from "@/lib/audit"

const deleteAccountLimiter = rateLimit({ interval: 60_000, max: 5 })
const schema = z.object({ password: z.string().min(1, "Password is required").max(128) })

class AccountDeletionError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 404 | 409
  ) {
    super(message)
    this.name = "AccountDeletionError"
  }
}

function errorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null
  return typeof error.code === "string" ? error.code : null
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { session, banned } = await getServerSessionDetails(request.headers)
  if (banned) return NextResponse.json({ error: "Account suspended" }, { status: 403 })
  if (!session) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

  const userId = session.user.id
  const credentialAccount = await prisma.account.findFirst({
    where: { userId, providerId: "credential", password: { not: null } },
    select: { id: true },
  })
  if (!credentialAccount) {
    return NextResponse.json(
      {
        error:
          "Password confirmation is unavailable for SSO-only accounts. Ask another administrator to delete this account.",
        code: "CREDENTIAL_ACCOUNT_REQUIRED",
      },
      { status: 403 }
    )
  }

  try {
    const limit = await deleteAccountLimiter.check(`delete-account:${userId}`)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many deletion attempts. Please retry later.", retryable: true },
        { status: 429, headers: { "Retry-After": String(Math.ceil(limit.resetIn / 1000)) } }
      )
    }

    let verification: { status: boolean }
    try {
      verification = await auth.api.verifyPassword({
        headers: request.headers,
        body: { password: parsed.data.password },
      })
    } catch {
      return NextResponse.json(
        { error: "Invalid password or expired session. Sign in again and retry." },
        { status: 401 }
      )
    }
    if (verification.status !== true) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 })
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${ADMIN_MUTATION_LOCK_ID}::bigint)`

        const actor = await tx.user.findUnique({
          where: { id: userId },
          select: { role: true, banned: true },
        })
        if (!actor) throw new AccountDeletionError("User not found", 404)
        if (actor.banned) throw new AccountDeletionError("Account suspended", 403)

        const credential = await tx.account.findFirst({
          where: { userId, providerId: "credential", password: { not: null } },
          select: { id: true },
        })
        if (!credential) {
          throw new AccountDeletionError("A credential account is required for self-deletion", 403)
        }

        if (actor.role === "admin") {
          const adminCount = await tx.user.count({ where: { role: "admin", banned: false } })
          if (isLastActiveAdmin(adminCount)) {
            throw new AccountDeletionError("At least one administrator must remain", 409)
          }
        }

        await tx.session.deleteMany({ where: { userId } })
        await tx.user.delete({ where: { id: userId } })
      },
      { maxWait: 10_000, timeout: 15_000 }
    )

    audit("user.account.delete", { userId, role: session.user.role })
    return NextResponse.json(
      { success: true, message: "User deleted" },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    if (error instanceof AccountDeletionError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (errorCode(error) === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    console.error("Account deletion failed", error)
    return NextResponse.json(
      { error: "Unable to delete account. Please retry.", retryable: true },
      { status: 500 }
    )
  }
}
