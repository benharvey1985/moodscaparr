"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Header } from "@/components/header"
import { CalendarHeatmap } from "@/components/calendar/calendar-heatmap"
import { MonthStats } from "@/components/calendar/month-stats"
import { ColorLegend } from "@/components/calendar/color-legend"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { Button } from "@/components/ui/button"
import { fetchCalendarEntries } from "@/lib/api/calendar"
import { EntryDetailDialog } from "@/components/history/entry-detail-dialog"
import { MOODS, type MoodCategory } from "@/types/mood"
import type { MoodEntry } from "@/types/mood"
import { format } from "date-fns"
import { Heart, Loader2 } from "lucide-react"

function CalendarContent() {
  const router = useRouter()
  const [session, setSession] = useState<{
    user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  } | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  const [currentMonth, setCurrentMonth] = useState<string>("")
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [hasEntries, setHasEntries] = useState<boolean | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)

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

  const loadMonth = useCallback(async (month: string) => {
    setLoading(true)
    try {
      const res = await fetchCalendarEntries(month)
      setEntries(res.entries)
      if (res.firstEntryDate && !currentMonth) {
        const firstMonth = format(new Date(res.firstEntryDate), "yyyy-MM")
        setCurrentMonth(firstMonth)
        // don't reload, just continue with this month
      }
      if (hasEntries === null) {
        setHasEntries(res.firstEntryDate !== null)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [currentMonth, hasEntries])

  useEffect(() => {
    if (!currentMonth) {
      // Determine initial month from first entry
      fetchCalendarEntries(format(new Date(), "yyyy-MM")).then((res) => {
        if (res.firstEntryDate) {
          const firstMonth = format(new Date(res.firstEntryDate), "yyyy-MM")
          setCurrentMonth(firstMonth)
          setHasEntries(true)
          setLoading(true)
          fetchCalendarEntries(firstMonth).then((r2) => {
            setEntries(r2.entries)
            setLoading(false)
          })
        } else {
          setCurrentMonth(format(new Date(), "yyyy-MM"))
          setHasEntries(false)
          setLoading(false)
        }
      })
      return
    }
    loadMonth(currentMonth)
  }, [currentMonth])

  function handleMonthChange(month: string) {
    setCurrentMonth(month)
  }

  function handleDayClick(entry: MoodEntry | null) {
    setSelectedEntry(entry)
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header user={null} />
        <DashboardSkeleton />
      </div>
    )
  }

  if (hasEntries === false) {
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
        <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6 pb-12">
          <h2 className="text-2xl font-semibold">Calendar</h2>
          <div className="rounded-lg border border-dashed p-10 text-center">
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <Heart className="size-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Start tracking to see your calendar!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Log your first mood entry to see your mood calendar heatmap.
            </p>
            <Button
              className="mt-4"
              onClick={() => router.push("/wizard")}
            >
              Log Your First Mood
            </Button>
          </div>
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
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-6 p-6 pb-12">
        <h2 className="text-2xl font-semibold">Calendar</h2>

        <MonthStats entries={entries} />
        <ColorLegend />

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <CalendarHeatmap
            entries={entries}
            month={currentMonth}
            onMonthChange={handleMonthChange}
            onDayClick={handleDayClick}
          />
        )}

        <EntryDetailDialog
          entry={selectedEntry}
          open={!!selectedEntry}
          onOpenChange={(open) => {
            if (!open) setSelectedEntry(null)
          }}
        />
      </main>
    </div>
  )
}

export default function CalendarPage() {
  return (
    <ErrorBoundary>
      <CalendarContent />
    </ErrorBoundary>
  )
}
