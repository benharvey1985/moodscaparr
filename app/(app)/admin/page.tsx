"use client"

import { Suspense, useRef, type KeyboardEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { UserTable } from "@/components/admin/user-table"
import { SSOConfig } from "@/components/admin/sso-config"
import { InviteCodes } from "@/components/admin/invite-codes"
import { ErrorBoundary } from "@/components/ui/error-boundary"

type Tab = "dashboard" | "users" | "sso" | "invites"

const TABS: { id: Tab; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "users", label: "Users" },
  { id: "sso", label: "SSO" },
  { id: "invites", label: "Invite Codes" },
]

function AdminContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const requestedTab = searchParams.get("tab")
  const tab: Tab = TABS.some((item) => item.id === requestedTab)
    ? (requestedTab as Tab)
    : "dashboard"

  function selectTab(nextTab: Tab) {
    const params = new URLSearchParams(searchParams.toString())
    if (nextTab === "dashboard") params.delete("tab")
    else params.set("tab", nextTab)
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | null = null
    if (event.key === "ArrowRight") nextIndex = (index + 1) % TABS.length
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + TABS.length) % TABS.length
    if (event.key === "Home") nextIndex = 0
    if (event.key === "End") nextIndex = TABS.length - 1
    if (nextIndex === null) return

    event.preventDefault()
    selectTab(TABS[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Admin</h1>

      <div className="overflow-x-auto pb-1" role="tablist" aria-label="Administration sections">
        <div className="flex w-max min-w-full gap-1 border-b">
          {TABS.map((item, index) => (
            <button
              key={item.id}
              ref={(node) => {
                tabRefs.current[index] = node
              }}
              id={`admin-tab-${item.id}`}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              aria-controls={`admin-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              onClick={() => selectTab(item.id)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                tab === item.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div
        id={`admin-panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`admin-tab-${tab}`}
        tabIndex={0}
        className="outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
      >
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
      <Suspense fallback={<p role="status" className="p-6 text-sm text-muted-foreground">Loading admin...</p>}>
        <AdminContent />
      </Suspense>
    </ErrorBoundary>
  )
}
