import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: session.user.id },
    select: { onboardingComplete: true },
  })

  return NextResponse.json({ onboardingComplete: profile?.onboardingComplete ?? false })
}

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await prisma.userProfile.update({
    where: { id: session.user.id },
    data: { onboardingComplete: true },
  })

  return NextResponse.json({ success: true })
}
