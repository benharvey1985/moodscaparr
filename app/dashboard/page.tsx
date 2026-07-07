"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { useMoodEntries } from "@/hooks/use-mood-entry"
import { useStats } from "@/hooks/use-streak"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { Header } from "@/components/header"
import { QuickLog } from "@/components/quick-log"
import { EntryCard } from "@/components/entry-card"
import { DeleteDialog } from "@/components/delete-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MOODS, type MoodCategory } from "@/types/mood"
import { Plus, RefreshCw, Loader2, Heart } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"

function DashboardContent() {
  const router = useRouter()
  const [session, setSession] = useState<{
    user: { name?: string | null; email?: string | null; image?: string | null }
  } | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [showTour, setShowTour] = useState(false)

  const { data: entries, isLoading, isError, error, refetch } = useMoodEntries()
  const { data: stats, isLoading: statsLoading } = useStats()

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

  useEffect(() => {
    if (session) {
      fetch("/api/user/onboarding-complete")
        .then((res) => res.json())
        .then((data) => {
          if (!data.onboardingComplete) setShowTour(true)
        })
        .catch(() => {})
    }
  }, [session])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }, [])

  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), [])
  const todayEntry = entries?.find((e) => e.date?.startsWith(todayStr))
  const todayMood = todayEntry
    ? MOODS[todayEntry.category as MoodCategory]?.[todayEntry.moodIndex]
    : null

  const recentEntries = entries?.slice(0, 5) ?? []
  const kpiEntries = entries ?? []

  if (sessionLoading || (isLoading && !entries)) {
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
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 p-6 pb-12">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {greeting}, {session?.user?.name || "there"}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              {todayEntry ? (
                <>
                  <span className="text-xl">{todayMood?.emoji}</span>
                  <p className="text-sm text-muted-foreground">
                    {todayMood?.label} &middot; You&apos;ve logged today!
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No entry yet today
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
              <span className="text-xl">📊</span>
              <span className="text-xs text-muted-foreground">Total Entries</span>
              <span className="text-lg font-semibold tabular-nums">
                {statsLoading ? (
                  <Loader2 className="mx-auto size-4 animate-spin" />
                ) : (
                  stats?.totalEntries ?? kpiEntries.length
                )}
              </span>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
              <span className="text-xl">⭐</span>
              <span className="text-xs text-muted-foreground">Avg Mood Score</span>
              <span className="text-lg font-semibold tabular-nums">
                {statsLoading ? (
                  <Loader2 className="mx-auto size-4 animate-spin" />
                ) : (
                  stats ? `${stats.avgMoodScore}/10` : "—"
                )}
              </span>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
              <span className="text-xl">🔥</span>
              <span className="text-xs text-muted-foreground">Current Streak</span>
              <span className="text-lg font-semibold tabular-nums">
                {statsLoading ? (
                  <Loader2 className="mx-auto size-4 animate-spin" />
                ) : (
                  `${stats?.currentStreak ?? 0} days`
                )}
              </span>
            </CardContent>
          </Card>
          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
              <span className="text-xl">📅</span>
              <span className="text-xs text-muted-foreground">Entries This Week</span>
              <span className="text-lg font-semibold tabular-nums">
                {statsLoading ? (
                  <Loader2 className="mx-auto size-4 animate-spin" />
                ) : (
                  stats?.entriesThisWeek ?? 0
                )}
              </span>
            </CardContent>
          </Card>
        </div>

        {!statsLoading && stats && (
          <Card>
            <CardContent className="space-y-2 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Streak Goal</span>
                <span className="text-muted-foreground">
                  {stats.currentStreak}/{stats.streakGoal} days
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mood-positive-medium to-mood-positive-dark transition-all duration-500"
                  style={{
                    width: `${Math.min((stats.currentStreak / stats.streakGoal) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.currentStreak >= stats.streakGoal
                  ? "Goal reached! 🎉"
                  : `${stats.streakGoal - stats.currentStreak} more day(s) to reach your goal!`}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick Log</CardTitle>
          </CardHeader>
          <CardContent>
            <QuickLog />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Recent Entries</h3>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1 size-3.5" />
              Refresh
            </Button>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <Loader2 className="size-5 text-destructive" />
              </div>
              <p className="text-sm font-medium text-destructive">Couldn&apos;t load entries</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {error?.message || "An unexpected error occurred"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetch()}
              >
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !isError && recentEntries.length === 0 && (
            <div className="rounded-lg border border-dashed p-10 text-center">
              <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
                <Heart className="size-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Log your first mood!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Start tracking your mood journey today.
              </p>
              <Link
                href="/wizard"
                className="mt-4 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
              >
                <Plus className="size-4" />
                Log Your First Mood
              </Link>
            </div>
          )}

          {!isLoading && !isError && recentEntries.length > 0 && (
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onEdit={(id) => router.push(`/wizard?id=${id}`)}
                  onDelete={(id) => setDeleteTarget(id)}
                />
              ))}
            </div>
          )}
        </div>

        <DeleteDialog
          entryId={deleteTarget}
          open={!!deleteTarget}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null)
          }}
        />
        <OnboardingTour
          isOpen={showTour}
          onComplete={() => setShowTour(false)}
          onSkip={() => setShowTour(false)}
        />
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  )
}
