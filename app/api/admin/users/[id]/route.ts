import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { addDays } from "date-fns"
import { z } from "zod"
import { audit } from "@/lib/audit"

const updateUserSchema = z.object({
  role: z.enum(["user", "admin"]).optional(),
  banned: z.boolean().optional(),
  banReason: z.string().max(200).optional(),
  banExpires: z.string().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const parsed = updateUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (parsed.data.role) {
    data.role = parsed.data.role
  }
  if (typeof parsed.data.banned === "boolean") {
    data.banned = parsed.data.banned
    if (parsed.data.banned) {
      data.banReason = parsed.data.banReason ?? "suspended"
      data.banExpires = parsed.data.banExpires ? new Date(parsed.data.banExpires) : addDays(new Date(), 30)
    } else {
      data.banReason = null
      data.banExpires = null
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, banned: true, banReason: true, banExpires: true, createdAt: true },
  })
  audit("admin.user.update", { adminId: session.user.id, targetId: id, changes: data })
  return NextResponse.json({ user })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await prisma.user.delete({ where: { id } })
  audit("admin.user.delete", { adminId: session.user.id, targetId: id })
  return NextResponse.json({ deleted: true })
}
