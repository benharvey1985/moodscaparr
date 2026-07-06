"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ProfileForm } from "@/components/settings/profile-form"
import { AchievementSummary } from "@/components/settings/achievement-summary"
import { DataExport } from "@/components/settings/data-export"
import { DataImport } from "@/components/settings/data-import"
import { Header } from "@/components/header"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "@/components/ui/error-boundary"

function SettingsContent() {
  const router = useRouter()
  const [session, setSession] = useState<{
    user: { name?: string | null; email?: string | null; image?: string | null }
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (!res?.data) {
        router.push("/auth/login")
        return
      }
      setSession(res.data as typeof session)
      setLoading(false)
    })
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header user={null} />
        <main className="mx-auto w-full max-w-2xl flex-1 p-6">
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
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
              }
            : null
        }
      />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-8 p-6 pb-12">
        <div>
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your profile, achievements, and data
          </p>
        </div>

        <ProfileForm />

        <AchievementSummary />

        <DataExport />

        <DataImport />

        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your data is stored securely and is only accessible to you. You can export or
              delete your data at any time.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <SettingsContent />
    </ErrorBoundary>
  )
}
