import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { randomBytes } from "crypto"
import { z } from "zod"
import { audit } from "@/lib/audit"

const createInviteSchema = z.object({
  maxUses: z.number().int().min(1).max(1000).optional(),
  expiresAt: z.string().optional(),
})

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const codes = await prisma.inviteCode.findMany()

  return NextResponse.json(codes)
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createInviteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { maxUses, expiresAt } = parsed.data
  const code = randomBytes(4).toString("hex").toUpperCase()

  const invite = await prisma.inviteCode.create({
    data: {
      code,
      maxUses: maxUses ?? 1,
      expiresAt: new Date(expiresAt ?? Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdBy: session.user.id,
    },
  })

  audit("admin.invite-code.create", { adminId: session.user.id, code, maxUses, expiresAt })
  return NextResponse.json(invite)
}
