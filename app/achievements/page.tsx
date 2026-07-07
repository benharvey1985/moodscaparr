"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Header } from "@/components/header"
import { AchievementList } from "@/components/achievements/achievement-list"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"

function AchievementsContent() {
  const router = useRouter()
  const [session, setSession] = useState<{
    user: { name?: string | null; email?: string | null; image?: string | null }
  } | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (!res?.data) {
        router.push("/auth/login")
        return
      }
      setSession(res.data as typeof session)
      setSessionLoading(false)
    })
  }, [router])

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header user={null} />
        <DashboardSkeleton />
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <h1 className="mb-8 text-2xl font-bold">Achievements</h1>
        <AchievementList />
      </main>
    </div>
  )
}

export default function AchievementsPage() {
  return (
    <ErrorBoundary>
      <AchievementsContent />
    </ErrorBoundary>
  )
}
