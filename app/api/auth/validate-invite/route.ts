import { NextResponse } from "next/server"
import { z } from "zod"
import { InviteServiceBusyError, normalizeEmail, reserveInvite } from "@/lib/invites"
import { rateLimit } from "@/lib/rate-limit"

const validateInviteLimiter = rateLimit({ interval: 60_000, max: 10 })
const schema = z.object({
  code: z.string().trim().min(1, "Code is required").max(200),
  email: z.string().trim().email("Enter a valid email").max(320),
})

function requestIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  )
}

function json(body: unknown, status = 200, retryAfter?: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(retryAfter === undefined
        ? {}
        : { "Retry-After": String(Math.max(1, Math.ceil(retryAfter / 1000))) }),
    },
  })
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return json({ valid: false, error: "Invalid JSON body" }, 400)
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return json(
      { valid: false, error: parsed.error.issues[0]?.message ?? "Code and email are required" },
      400
    )
  }

  const email = normalizeEmail(parsed.data.email)
  const ip = requestIp(request)

  try {
    const limits = await Promise.all([
      validateInviteLimiter.check(`validate-invite:email:${email}`),
      validateInviteLimiter.check(`validate-invite:ip:${ip}`),
    ])
    const limited = limits.find((result) => !result.allowed)
    if (limited) {
      return json(
        { valid: false, error: "Too many validation attempts. Please retry later.", retryable: true },
        429,
        limited.resetIn
      )
    }

    const result = await reserveInvite(email, parsed.data.code)
    if (!result.ok) return json({ valid: false, error: result.error }, result.status)
    return json({ valid: true })
  } catch (error) {
    if (error instanceof InviteServiceBusyError) {
      return json({ valid: false, error: error.message, retryable: true }, 503)
    }
    console.error("Invite validation failed", error)
    return json(
      { valid: false, error: "Unable to validate invitation. Please retry.", retryable: true },
      503
    )
  }
}
