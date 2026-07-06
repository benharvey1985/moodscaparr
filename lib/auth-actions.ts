import "server-only"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  })
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
  if ((session.user as { role?: string }).role !== "admin") {
    redirect("/auth/login")
  }
  return session
}
