import { NextResponse } from "next/server"
import { z } from "zod"
import { InviteServiceBusyError, normalizeEmail, releaseInvite } from "@/lib/invites"
import { rateLimit } from "@/lib/rate-limit"

const releaseInviteLimiter = rateLimit({ interval: 60_000, max: 10 })
const schema = z.object({
  code: z.string().trim().min(1, "Code is required").max(200),
  email: z.string().trim().email("Enter a valid email").max(320),
})

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
    return json({ released: false, error: "Invalid JSON body" }, 400)
  }

  const parsed = schema.safeParse(payload)
  if (!parsed.success) {
    return json(
      { released: false, error: parsed.error.issues[0]?.message ?? "Code and email are required" },
      400
    )
  }

  const email = normalizeEmail(parsed.data.email)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"

  try {
    const limit = await releaseInviteLimiter.check(`release-invite:${ip}:${email}`)
    if (!limit.allowed) {
      return json(
        { released: false, error: "Too many release attempts. Please retry later.", retryable: true },
        429,
        limit.resetIn
      )
    }

    await releaseInvite(email, parsed.data.code)
    return json({ released: true })
  } catch (error) {
    if (error instanceof InviteServiceBusyError) {
      return json({ released: false, error: error.message, retryable: true }, 503)
    }
    console.error("Invite release failed", error)
    return json(
      { released: false, error: "Unable to release invitation. Please retry.", retryable: true },
      503
    )
  }
}
