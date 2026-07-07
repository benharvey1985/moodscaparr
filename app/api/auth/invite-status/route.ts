import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const setting = await prisma.appSetting.findUnique({
    where: { key: "invite_only" },
  })
  return NextResponse.json({ inviteOnly: setting?.value === "true" })
}
