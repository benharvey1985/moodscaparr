import { NextResponse } from "next/server"
import { getServerSession } from "@/lib/auth-actions"
import { prisma } from "@/lib/prisma"
import { addDays } from "date-fns"
import { z } from "zod"
import { audit } from "@/lib/audit"
import { ADMIN_MUTATION_LOCK_ID } from "@/lib/admin-mutation-lock"
import { isLastActiveAdmin } from "@/lib/admin-guards"
const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  banned: true,
  banReason: true,
  banExpires: true,
  createdAt: true,
} as const

const updateUserSchema = z
  .object({
    role: z.enum(["user", "admin"]).optional(),
    banned: z.boolean().optional(),
    banReason: z.string().max(200).optional(),
    banExpires: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid ban expiration")
      .optional(),
  })
  .refine((data) => data.role !== undefined || data.banned !== undefined, {
    message: "At least one user change is required",
  })

class AdminMutationError extends Error {
  constructor(
    message: string,
    readonly status: 403 | 404 | 409
  ) {
    super(message)
    this.name = "AdminMutationError"
  }
}

function errorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) return null
  return typeof error.code === "string" ? error.code : null
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = updateUserSchema.safeParse(payload)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const data: {
    role?: "user" | "admin"
    banned?: boolean
    banReason?: string | null
    banExpires?: Date | null
  } = {}
  if (parsed.data.role) data.role = parsed.data.role
  if (typeof parsed.data.banned === "boolean") {
    data.banned = parsed.data.banned
    if (parsed.data.banned) {
      data.banReason = parsed.data.banReason ?? "suspended"
      data.banExpires = parsed.data.banExpires
        ? new Date(parsed.data.banExpires)
        : addDays(new Date(), 30)
    } else {
      data.banReason = null
      data.banExpires = null
    }
  }

  try {
    const user = await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${ADMIN_MUTATION_LOCK_ID}::bigint)`

        const actor = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { role: true, banned: true },
        })
        if (!actor || actor.role !== "admin" || actor.banned) {
          throw new AdminMutationError("Administrator access is no longer valid", 403)
        }

        const target = await tx.user.findUnique({
          where: { id },
          select: { id: true, role: true, banned: true },
        })
        if (!target) throw new AdminMutationError("User not found", 404)

        if (id === session.user.id && data.role === "user") {
          throw new AdminMutationError("You cannot demote your own account", 403)
        }

        if (target.role === "admin" && !target.banned && data.role === "user") {
          const adminCount = await tx.user.count({ where: { role: "admin", banned: false } })
          if (isLastActiveAdmin(adminCount)) {
            throw new AdminMutationError("At least one administrator must remain", 409)
          }
        }

        if (target.role === "admin" && !target.banned && data.banned === true) {
          const adminCount = await tx.user.count({ where: { role: "admin", banned: false } })
          if (isLastActiveAdmin(adminCount)) {
            throw new AdminMutationError("At least one administrator must remain", 409)
          }
        }

        if (data.banned === true) {
          await tx.session.deleteMany({ where: { userId: id } })
        }

        return tx.user.update({ where: { id }, data, select: userSelect })
      },
      { maxWait: 10_000, timeout: 15_000 }
    )

    audit("admin.user.update", { adminId: session.user.id, targetId: id, changes: data })
    return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof AdminMutationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (errorCode(error) === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    console.error("Admin user update failed", error)
    return NextResponse.json(
      { error: "Unable to update user. Please retry.", retryable: true },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession()
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { id } = await params
  if (id === session.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 403 })
  }

  try {
    await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${ADMIN_MUTATION_LOCK_ID}::bigint)`

        const actor = await tx.user.findUnique({
          where: { id: session.user.id },
          select: { role: true, banned: true },
        })
        if (!actor || actor.role !== "admin" || actor.banned) {
          throw new AdminMutationError("Administrator access is no longer valid", 403)
        }

        const target = await tx.user.findUnique({
          where: { id },
          select: { id: true, role: true, banned: true },
        })
        if (!target) throw new AdminMutationError("User not found", 404)

        if (target.role === "admin" && !target.banned) {
          const adminCount = await tx.user.count({ where: { role: "admin", banned: false } })
          if (isLastActiveAdmin(adminCount)) {
            throw new AdminMutationError("At least one administrator must remain", 409)
          }
        }

        await tx.session.deleteMany({ where: { userId: id } })
        await tx.user.delete({ where: { id } })
      },
      { maxWait: 10_000, timeout: 15_000 }
    )

    audit("admin.user.delete", { adminId: session.user.id, targetId: id })
    return NextResponse.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof AdminMutationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    if (errorCode(error) === "P2025") {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    console.error("Admin user delete failed", error)
    return NextResponse.json(
      { error: "Unable to delete user. Please retry.", retryable: true },
      { status: 500 }
    )
  }
}
