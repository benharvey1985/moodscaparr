import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { audit } from "@/lib/audit"

const ssoSchema = z.object({
  provider: z.enum(["google", "github"]),
  enabled: z.boolean(),
})

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const providers = await prisma.ssoProvider.findMany()
  const result = ["google", "github"].map((p) => {
    const found = providers.find((sp) => sp.provider === p)
    return { provider: p, enabled: found?.enabled ?? false }
  })

  return NextResponse.json(result)
}

export async function PUT(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session || (session.user as { role?: string }).role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const parsed = ssoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { provider, enabled } = parsed.data

  await prisma.ssoProvider.upsert({
    where: { provider },
    update: { enabled: !!enabled },
    create: { provider, enabled: !!enabled },
  })

  audit("admin.sso.toggle", { adminId: session.user.id, provider, enabled: !!enabled })
  return NextResponse.json({ provider, enabled: !!enabled })
}
