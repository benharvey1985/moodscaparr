import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const setting = await prisma.appSetting.findUnique({
      where: { key: "invite_only" },
    })
    return NextResponse.json(
      { inviteOnly: setting?.value === "true" },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch {
    return NextResponse.json(
      { error: "Unable to load registration settings. Please retry.", retryable: true },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
