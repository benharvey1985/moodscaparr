"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Header } from "@/components/header"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { UserTable } from "@/components/admin/user-table"
import { SSOConfig } from "@/components/admin/sso-config"
import { InviteCodes } from "@/components/admin/invite-codes"
import { ErrorBoundary } from "@/components/ui/error-boundary"

type Tab = "dashboard" | "users" | "sso" | "invites"

function AdminContent() {
  const router = useRouter()
  const [session, setSession] = useState<{
    user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>("dashboard")

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (!res?.data) {
        router.push("/auth/login")
        return
      }
      const data = res.data as typeof session
      if (data?.user?.role !== "admin") {
        router.push("/dashboard")
        return
      }
      setSession(data)
      setLoading(false)
    })
  }, [router])

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "Users" },
    { id: "sso", label: "SSO" },
    { id: "invites", label: "Invite Codes" },
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header user={null} />
        <main className="mx-auto w-full max-w-5xl flex-1 p-6">
          <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={
          session
            ? {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                role: session.user.role,
              }
            : null
        }
      />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 p-6 pb-12">
        <h1 className="text-2xl font-semibold">Admin</h1>

        <div className="flex gap-1 border-b">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 pb-2 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-b-2 border-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && <AdminDashboard />}
        {tab === "users" && <UserTable />}
        {tab === "sso" && <SSOConfig />}
        {tab === "invites" && <InviteCodes />}
      </main>
    </div>
  )
}

export default function AdminPage() {
  return (
    <ErrorBoundary>
      <AdminContent />
    </ErrorBoundary>
  )
}
