import { auth } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"

export default async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (request.nextUrl.pathname.startsWith("/admin") && (session.user as { role?: string }).role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  )
  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/wizard/:path*", "/admin/:path*"],
}
