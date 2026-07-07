import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const body = await request.json()
  const { code, email } = body

  if (!code || !email) {
    return NextResponse.json({ valid: false, error: "Code and email are required" }, { status: 400 })
  }

  const invite = await prisma.inviteCode.findUnique({ where: { code } })

  if (!invite) {
    return NextResponse.json({ valid: false, error: "Invalid invite code" }, { status: 400 })
  }

  if (!invite.active) {
    return NextResponse.json({ valid: false, error: "Invite code has been revoked" }, { status: 400 })
  }

  if (invite.uses >= invite.maxUses) {
    return NextResponse.json({ valid: false, error: "Invite code has reached maximum uses" }, { status: 400 })
  }

  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ valid: false, error: "Invite code has expired" }, { status: 400 })
  }

  await prisma.$transaction([
    prisma.inviteCode.update({
      where: { id: invite.id },
      data: { uses: { increment: 1 } },
    }),
    prisma.inviteConsumption.create({
      data: { email, code },
    }),
  ])

  return NextResponse.json({ valid: true })
}
