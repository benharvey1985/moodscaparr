import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()
  const category = searchParams.get("category")
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)))
  const offset = (page - 1) * limit

  const where: Record<string, unknown> = { userId: session.user.id }

  if (category && ["POSITIVE", "NEUTRAL", "NEGATIVE"].includes(category)) {
    where.category = category
  }

  if (q) {
    where.OR = [
      { reflection1: { contains: q, mode: "insensitive" } },
      { reflection2: { contains: q, mode: "insensitive" } },
      { reflection3: { contains: q, mode: "insensitive" } },
      { reflection4: { contains: q, mode: "insensitive" } },
      { weather: { contains: q, mode: "insensitive" } },
    ]
  }

  const [entries, total] = await Promise.all([
    prisma.moodEntry.findMany({
      where,
      orderBy: { date: "desc" },
      skip: offset,
      take: limit,
    }),
    prisma.moodEntry.count({ where }),
  ])

  const serialized = entries.map((e) => ({
    ...e,
    date: e.date.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }))

  return NextResponse.json({
    entries: serialized,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  })
}
