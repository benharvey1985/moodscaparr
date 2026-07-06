import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  country: z.string().max(100).optional(),
  timezone: z.string().max(64).optional(),
  streakGoal: z.number().int().min(1).max(365).optional(),
})

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await prisma.userProfile.findUnique({
    where: { id: session.user.id },
  })

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
  })

  return NextResponse.json({ user, profile })
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const profile = await prisma.userProfile.upsert({
    where: { id: session.user.id },
    update: parsed.data,
    create: { id: session.user.id, ...parsed.data },
  })

  if (parsed.data.name) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
    })
  }

  return NextResponse.json({ profile })
}
