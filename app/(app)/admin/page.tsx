"use client"

import { useState } from "react"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { UserTable } from "@/components/admin/user-table"
import { SSOConfig } from "@/components/admin/sso-config"
import { InviteCodes } from "@/components/admin/invite-codes"
import { ErrorBoundary } from "@/components/ui/error-boundary"

type Tab = "dashboard" | "users" | "sso" | "invites"

function AdminContent() {
  const [tab, setTab] = useState<Tab>("dashboard")

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "users", label: "Users" },
    { id: "sso", label: "SSO" },
    { id: "invites", label: "Invite Codes" },
  ]

  return (
    <div>
      <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
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
      </div>
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
