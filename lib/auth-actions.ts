import "server-only"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function getServerSessionDetails(providedHeaders?: Headers) {
  const session = await auth.api.getSession({
    headers: providedHeaders ?? (await headers()),
    query: { disableCookieCache: true },
  })
  if (!session) return { session: null, banned: false }

  const record = await prisma.session.findUnique({
    where: { token: session.session.token },
    select: {
      expiresAt: true,
      user: { select: { id: true, role: true, banned: true } },
    },
  })

  if (!record) return { session: null, banned: false }

  const banned = record.user.banned
  const expired = record.expiresAt.getTime() <= Date.now()
  const mismatchedUser = record.user.id !== session.user.id
  if (banned || expired || mismatchedUser) {
    return { session: null, banned }
  }

  return {
    session: {
      ...session,
      user: { ...session.user, role: record.user.role, banned },
    },
    banned,
  }
}

export async function getServerSession(providedHeaders?: Headers) {
  const { session } = await getServerSessionDetails(providedHeaders)
  return session
}

export async function requireAuth() {
  const session = await getServerSession()
  if (!session) {
    redirect("/auth/login")
  }
  return session
}

export async function requireAdmin() {
  const session = await requireAuth()
  if (session.user.role !== "admin") {
    redirect("/auth/login")
  }
  return session
}
