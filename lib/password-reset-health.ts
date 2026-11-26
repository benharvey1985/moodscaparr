import "server-only"
import type { PasswordResetHealth } from "./api/admin"
import { prisma } from "./prisma"

export const PASSWORD_RESET_HEALTH_KEY = "password_reset_health"

interface StoredPasswordResetHealth {
  status: "ok" | "error"
  lastAttemptAt: string | null
  lastSuccessAt: string | null
  lastFailureAt: string | null
  providerStatus: number | null
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function timestamp(value: unknown): string | null {
  return typeof value === "string" && !Number.isNaN(Date.parse(value)) ? value : null
}

function providerStatus(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 100 && value <= 599
    ? value
    : null
}

function parseStoredHealth(value: string | null | undefined): StoredPasswordResetHealth | null {
  if (!value) return null
  try {
    const parsed: unknown = JSON.parse(value)
    if (!isRecord(parsed) || (parsed.status !== "ok" && parsed.status !== "error")) return null
    return {
      status: parsed.status,
      lastAttemptAt: timestamp(parsed.lastAttemptAt),
      lastSuccessAt: timestamp(parsed.lastSuccessAt),
      lastFailureAt: timestamp(parsed.lastFailureAt),
      providerStatus: providerStatus(parsed.providerStatus),
    }
  } catch {
    return null
  }
}

function isConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim())
}

export async function recordPasswordResetDelivery(result: {
  ok: boolean
  providerStatus?: number
}): Promise<void> {
  const existing = await prisma.appSetting.findUnique({
    where: { key: PASSWORD_RESET_HEALTH_KEY },
  })
  const previous = parseStoredHealth(existing?.value)
  const now = new Date().toISOString()
  const next: StoredPasswordResetHealth = result.ok
    ? {
        status: "ok",
        lastAttemptAt: now,
        lastSuccessAt: now,
        lastFailureAt: previous?.lastFailureAt ?? null,
        providerStatus: null,
      }
    : {
        status: "error",
        lastAttemptAt: now,
        lastSuccessAt: previous?.lastSuccessAt ?? null,
        lastFailureAt: now,
        providerStatus: providerStatus(result.providerStatus),
      }

  await prisma.appSetting.upsert({
    where: { key: PASSWORD_RESET_HEALTH_KEY },
    update: { value: JSON.stringify(next) },
    create: { key: PASSWORD_RESET_HEALTH_KEY, value: JSON.stringify(next) },
  })
}

export async function readPasswordResetHealth(): Promise<PasswordResetHealth> {
  const configured = isConfigured()
  const setting = await prisma.appSetting.findUnique({
    where: { key: PASSWORD_RESET_HEALTH_KEY },
  })
  const stored = parseStoredHealth(setting?.value)

  if (!configured) {
    return {
      configured: false,
      status: "not_configured",
      lastAttemptAt: stored?.lastAttemptAt ?? null,
      lastSuccessAt: stored?.lastSuccessAt ?? null,
      lastFailureAt: stored?.lastFailureAt ?? null,
      message: "Set RESEND_API_KEY and EMAIL_FROM to enable password recovery.",
    }
  }

  if (!stored) {
    return {
      configured: true,
      status: "unknown",
      lastAttemptAt: null,
      lastSuccessAt: null,
      lastFailureAt: null,
      message: "No password reset email delivery has been attempted since this health record was introduced.",
    }
  }

  if (stored.status === "ok") {
    return {
      configured: true,
      status: "healthy",
      lastAttemptAt: stored.lastAttemptAt,
      lastSuccessAt: stored.lastSuccessAt,
      lastFailureAt: stored.lastFailureAt,
      message: "The last password reset email was accepted by the delivery provider.",
    }
  }

  return {
    configured: true,
    status: "degraded",
    lastAttemptAt: stored.lastAttemptAt,
    lastSuccessAt: stored.lastSuccessAt,
    lastFailureAt: stored.lastFailureAt,
    message: stored.providerStatus
      ? `The last delivery failed with provider HTTP ${stored.providerStatus}. Public reset responses remain generic.`
      : "The last password reset delivery failed. Public reset responses remain generic.",
  }
}
