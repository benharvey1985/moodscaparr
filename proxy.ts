import { getServerSessionDetails } from "@/lib/auth-actions"
import { NextRequest, NextResponse } from "next/server"

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
}

export default async function proxy(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api/")
  const isAdmin =
    request.nextUrl.pathname.startsWith("/admin") ||
    request.nextUrl.pathname.startsWith("/api/admin/")

  try {
    const { session, banned } = await getServerSessionDetails(request.headers)

    if (banned) {
      if (isApi) {
        return withSecurityHeaders(
          NextResponse.json(
            { error: "Account suspended", retryable: false },
            { status: 403, headers: { "Cache-Control": "no-store" } }
          )
        )
      }
      return withSecurityHeaders(
        new NextResponse("Account suspended. Contact an administrator for access.", {
          status: 403,
          headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
        })
      )
    }

    if (!session) {
      if (isApi) {
        return withSecurityHeaders(
          NextResponse.json(
            { error: "Authentication required", retryable: false },
            { status: 401, headers: { "Cache-Control": "no-store" } }
          )
        )
      }
      return withSecurityHeaders(NextResponse.redirect(new URL("/auth/login", request.url)))
    }

    if (isAdmin && session.user.role !== "admin") {
      if (isApi) {
        return withSecurityHeaders(
          NextResponse.json(
            { error: "Forbidden", retryable: false },
            { status: 403, headers: { "Cache-Control": "no-store" } }
          )
        )
      }
      return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)))
    }

    return withSecurityHeaders(NextResponse.next())
  } catch {
    if (isApi) {
      return withSecurityHeaders(
        NextResponse.json(
          { error: "Authentication service unavailable. Please retry.", retryable: true },
          { status: 503, headers: { "Cache-Control": "no-store" } }
        )
      )
    }
    return withSecurityHeaders(
      new NextResponse("Authentication service unavailable. Please retry.", {
        status: 503,
        headers: { "Cache-Control": "no-store", "Content-Type": "text/plain; charset=utf-8" },
      })
    )
  }
}

export const config = {
  matcher: [
    "/((?!api/auth|auth|api/health|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
}
