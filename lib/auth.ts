import { randomUUID } from "node:crypto"
import { betterAuth } from "better-auth"
import { APIError } from "better-auth/api"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { admin } from "better-auth/plugins/admin"
import { Prisma } from "../prisma/generated/prisma"
import { prisma } from "./prisma"
import { sendPasswordResetEmail } from "./email"
import { isInviteReservationActive, normalizeEmail } from "./invite-helpers"

const FIRST_ADMIN_CLAIM_KEY = "first_admin_claim"
const INVITE_ONLY_KEY = "invite_only"
const FIRST_ADMIN_CLAIM_WAIT_MS = 2_000
const FIRST_ADMIN_CLAIM_POLL_MS = 25

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
const githubClientId = process.env.GITHUB_CLIENT_ID?.trim()
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET?.trim()

export const socialProviderStatus = {
  google: Boolean(googleClientId && googleClientSecret),
  github: Boolean(githubClientId && githubClientSecret),
} as const

class FirstAdminClaimRetry extends Error {
  constructor(readonly pendingUserId?: string) {
    super(pendingUserId ? "Waiting for pending administrator signup" : "Retry first-admin claim")
    this.name = "FirstAdminClaimRetry"
  }
}

function errorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null
  return typeof error.code === "string" ? error.code : null
}

function isRetryableClaimError(error: unknown): boolean {
  return ["P2002", "P2034", "40001", "40P01"].includes(errorCode(error) ?? "")
}

async function waitForPendingUser(userId: string): Promise<void> {
  const deadline = Date.now() + FIRST_ADMIN_CLAIM_WAIT_MS
  while (Date.now() < deadline) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (user) return
    await new Promise<void>((resolve) => setTimeout(resolve, FIRST_ADMIN_CLAIM_POLL_MS))
  }
}

async function claimFirstAdmin(userId: string): Promise<boolean> {
  const waitedFor = new Set<string>()
  let lastError: unknown

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const claim = await tx.appSetting.findUnique({
            where: { key: FIRST_ADMIN_CLAIM_KEY },
          })
          const adminCount = await tx.user.count({ where: { role: "admin", banned: false } })
          if (adminCount > 0) return false

          if (!claim) {
            await tx.appSetting.create({
              data: { key: FIRST_ADMIN_CLAIM_KEY, value: `pending:${userId}` },
            })
            return true
          }

          if (claim.value.startsWith("pending:")) {
            const pendingUserId = claim.value.slice("pending:".length)
            if (pendingUserId && pendingUserId !== userId && !waitedFor.has(pendingUserId)) {
              const pendingUser = await tx.user.findUnique({
                where: { id: pendingUserId },
                select: { id: true },
              })
              if (!pendingUser) throw new FirstAdminClaimRetry(pendingUserId)
            }
          }

          // A failed creation leaves its pending claim behind. Once no admin and
          // no pending user exist, exactly one later signup can CAS-take it over.
          const claimed = await tx.appSetting.updateMany({
            where: { key: FIRST_ADMIN_CLAIM_KEY, value: claim.value },
            data: { value: `pending:${userId}` },
          })
          if (claimed.count === 1) return true
          throw new FirstAdminClaimRetry()
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 10_000,
          timeout: 15_000,
        }
      )
    } catch (error) {
      lastError = error
      if (error instanceof FirstAdminClaimRetry) {
        if (error.pendingUserId && !waitedFor.has(error.pendingUserId)) {
          waitedFor.add(error.pendingUserId)
          await waitForPendingUser(error.pendingUserId)
        }
        if (attempt < 9) continue
        break
      }
      if (isRetryableClaimError(error) && attempt < 9) continue
      throw error
    }
  }

  throw lastError instanceof Error ? lastError : new Error("First-admin claim remained contended")
}

function configuredOrigin(value: string | undefined): string | null {
  if (!value?.trim()) return null
  try {
    const url = new URL(value.trim())
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url.origin
  } catch {
    return null
  }
}

function getTrustedOrigins(): string[] {
  const origins = new Set<string>()
  const addOrigin = (value: string | undefined) => {
    const origin = configuredOrigin(value)
    if (origin) origins.add(origin)
  }

  addOrigin(process.env.BETTER_AUTH_URL)
  for (const origin of (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "").split(",")) {
    addOrigin(origin)
  }

  if (process.env.NODE_ENV !== "production") {
    addOrigin("http://localhost:3000")
    addOrigin("http://localhost:8080")
    addOrigin("http://localhost:3100")
    addOrigin("http://127.0.0.1:3000")
    addOrigin("http://127.0.0.1:8080")
    addOrigin("http://127.0.0.1:3100")
  }

  return [...origins]
}

const adapterFactory = prismaAdapter(prisma, {
  provider: "postgresql",
  transaction: true,
})

export const auth = betterAuth({
  database: adapterFactory,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url, token }) => {
      const credentialAccount = await prisma.account.findFirst({
        where: { userId: user.id, providerId: "credential" },
        select: { id: true },
      })
      if (!credentialAccount) {
        // Better Auth creates the verification token before this callback. Remove
        // it for SSO-only users so reset cannot silently create a credential.
        await prisma.verification.deleteMany({
          where: { identifier: `reset-password:${token}`, value: user.id },
        })
        return
      }

      await sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl: url,
      })
    },
  },
  socialProviders: {
    ...(googleClientId && googleClientSecret
      ? { google: { clientId: googleClientId, clientSecret: googleClientSecret } }
      : {}),
    ...(githubClientId && githubClientSecret
      ? { github: { clientId: githubClientId, clientSecret: githubClientSecret } }
      : {}),
  },
  session: {
    cookieCache: { enabled: false },
  },
  user: {
    deleteUser: {
      enabled: false,
    },
  },
  plugins: [admin({ defaultRole: "user" })],
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.email) {
            throw new APIError("BAD_REQUEST", { message: "An email address is required" })
          }

          const email = normalizeEmail(user.email)
          // Better Auth preserves this supplied id (the adapter uses forceAllowId).
          // Encoding it in the claim lets concurrent losers distinguish a commit
          // in progress from a failed creation whose claim can be taken over.
          const userId = randomUUID()
          const firstAdmin = await claimFirstAdmin(userId)

          if (!firstAdmin) {
            const setting = await prisma.appSetting.findUnique({
              where: { key: INVITE_ONLY_KEY },
            })

            if (setting?.value === "true") {
              const consumption = await prisma.inviteConsumption.findUnique({
                where: { email },
              })

              if (!consumption || !isInviteReservationActive(consumption.expiresAt)) {
                throw new APIError("BAD_REQUEST", {
                  code: "VALID_INVITE_REQUIRED",
                  message: "A valid, unexpired invitation reservation is required.",
                })
              }

              const invite = await prisma.inviteCode.findUnique({
                where: { code: consumption.code },
              })
              if (!invite?.active || invite.expiresAt.getTime() <= Date.now()) {
                throw new APIError("BAD_REQUEST", {
                  code: "INVALID_INVITE",
                  message: "This invitation is no longer valid.",
                })
              }
            }
          }

          return { data: { ...user, id: userId, email, role: firstAdmin ? "admin" : "user" } }
        },
        after: async (createdUser) => {
          const email = normalizeEmail(createdUser.email)
          // Better Auth may flush queued after-hooks even when its surrounding
          // transaction failed. Only consume after the user row is verifiably
          // committed, so failed signups retain their reservation for retry.
          const persistedUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true },
          })
          if (persistedUser?.id !== createdUser.id) return

          await prisma.inviteConsumption.deleteMany({ where: { email } })
        },
      },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "lax" as const,
      httpOnly: true,
    },
  },
  trustedOrigins: getTrustedOrigins(),
})
