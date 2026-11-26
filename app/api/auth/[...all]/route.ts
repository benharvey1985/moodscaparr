import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"
import { assertPasswordResetConfigured } from "@/lib/email"
import { PASSWORD_RESET_REQUEST_MESSAGE } from "@/lib/password-reset-copy"

const handlers = toNextJsHandler(auth)

function blockBuiltInAdminMutation(request: Request): Response | null {
  const path = new URL(request.url).pathname.replace(/\/$/, "")
  if (request.method === "GET" || !path.startsWith("/api/auth/admin/")) return null

  return Response.json(
    {
      error: "Built-in admin mutations are disabled. Use the /api/admin routes.",
      retryable: false,
    },
    { status: 403, headers: { "Cache-Control": "no-store" } }
  )
}

export async function GET(request: Request) {
  return blockBuiltInAdminMutation(request) ?? handlers.GET(request)
}

export async function POST(request: Request) {
  const blocked = blockBuiltInAdminMutation(request)
  if (blocked) return blocked

  const path = new URL(request.url).pathname.replace(/\/$/, "")
  if (path === "/api/auth/delete-user") {
    return Response.json(
      {
        error: "Built-in account deletion is disabled. Use /api/user/delete-account with password confirmation.",
        code: "SELF_DELETE_DISABLED",
        retryable: false,
      },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    )
  }

  if (path === "/api/auth/request-password-reset") {
    try {
      assertPasswordResetConfigured()
    } catch (error) {
      return Response.json(
        {
          error: error instanceof Error ? error.message : "Password reset email is not configured",
          code: "PASSWORD_RESET_EMAIL_NOT_CONFIGURED",
          retryable: false,
        },
        { status: 503, headers: { "Cache-Control": "no-store" } }
      )
    }

    // Better Auth intentionally swallows callback delivery errors. The email
    // layer records safe provider health durably; override the public body so
    // every outcome acknowledges receipt without claiming delivery.
    const response = await handlers.POST(request)
    if (!response.ok) return response

    return Response.json(
      { status: true, message: PASSWORD_RESET_REQUEST_MESSAGE },
      { headers: { "Cache-Control": "no-store" } }
    )
  }

  return handlers.POST(request)
}
