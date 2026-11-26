import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-actions"
import { socialProviderStatus } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession()
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  return NextResponse.json(
    [
      { provider: "google", enabled: socialProviderStatus.google },
      { provider: "github", enabled: socialProviderStatus.github },
    ],
    { headers: { "Cache-Control": "no-store" } }
  )
}
