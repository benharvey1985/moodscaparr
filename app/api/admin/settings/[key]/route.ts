import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { audit } from "@/lib/audit"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params
  const setting = await prisma.appSetting.findUnique({ where: { key } })
  return NextResponse.json({ key, value: setting?.value ?? null })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { key } = await params
  const body = await request.json()
  const value = String(body.value)

  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })

  audit("admin.settings.update", { adminId: session.user.id, key, value })
  return NextResponse.json({ key, value })
}
