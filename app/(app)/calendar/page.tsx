"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { AlertCircle, Heart, Loader2 } from "lucide-react"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { CalendarHeatmap } from "@/components/calendar/calendar-heatmap"
import { MonthNavigation, monthLabel } from "@/components/calendar/month-navigation"
import { MonthStats } from "@/components/calendar/month-stats"
import { ColorLegend } from "@/components/calendar/color-legend"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { fetchCalendarEntries } from "@/lib/api/calendar"
import { EntryDetailDialog } from "@/components/history/entry-detail-dialog"
import { useProfile } from "@/hooks/use-profile"
import { formatLocalDate, todayInTimeZone } from "@/lib/dates"
import type { MoodEntry } from "@/types/mood"

function CalendarContent() {
  const router = useRouter()
  const { data: profile, isPending: profilePending, isError: profileError, refetch: refetchProfile } = useProfile()
  const timezone = profile?.profile?.timezone ?? "UTC"
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const currentMonth = selectedMonth ?? (profile ? todayInTimeZone(timezone).slice(0, 7) : "")
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)
  const [logDate, setLogDate] = useState<string | null>(null)

  const {
    data,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["calendar", currentMonth],
    queryFn: ({ signal }) => fetchCalendarEntries(currentMonth, signal),
    enabled: Boolean(currentMonth),
  })

  function handleMonthChange(month: string) {
    setSelectedEntry(null)
    setLogDate(null)
    setSelectedMonth(month)
  }

  function handleDayClick(entry: MoodEntry | null, date: string) {
    if (entry) setSelectedEntry(entry)
    else setLogDate(date)
  }

  if (profilePending) {
    return (
      <div className="flex min-h-64 items-center justify-center" role="status">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <span className="sr-only">Loading calendar profile</span>
      </div>
    )
  }

  if (profileError) {
    return (
      <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 size-6 text-destructive" />
        <p className="font-medium text-destructive">Couldn&apos;t load calendar settings</p>
        <p className="mt-1 text-sm text-muted-foreground">Your profile timezone is needed to choose the correct month.</p>
        <Button className="mt-4 min-h-11" onClick={() => refetchProfile()}>Try Again</Button>
      </div>
    )
  }

  const loadedCurrentMonth = Boolean(data && data.month === currentMonth && !isFetching && !isError)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-4 sm:p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted-foreground">
          Opens on the current month in your profile timezone. Select an empty day to log for that date.
        </p>
      </div>

      {(isPending || isFetching) && !isError && (
        <div className="space-y-4" role="status" aria-live="polite">
          <MonthNavigation month={currentMonth} onMonthChange={handleMonthChange} />
          <div className="flex items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            Loading {monthLabel(currentMonth)}...
          </div>
        </div>
      )}

      {isError && (
        <div role="alert" className="space-y-4">
          <MonthNavigation month={currentMonth} onMonthChange={handleMonthChange} />
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 size-6 text-destructive" />
            <p className="font-medium text-destructive">Couldn&apos;t load {monthLabel(currentMonth)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {error?.message || "An unexpected error occurred"}
            </p>
            <Button
              variant="outline"
              className="mt-4 min-h-11"
              disabled={isFetching}
              onClick={() => refetch()}
            >
              {isFetching && <Loader2 className="size-4 animate-spin" />}
              Try Again
            </Button>
          </div>
        </div>
      )}

      {loadedCurrentMonth && data && data.firstEntryDate === null && (
        <div className="rounded-lg border border-dashed p-10 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
            <Heart className="size-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold">Start tracking to see your calendar!</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Log your first mood entry to see your mood calendar heatmap.
          </p>
          <Button className="mt-4 min-h-11" onClick={() => router.push("/wizard")}>
            Log Your First Mood
          </Button>
        </div>
      )}

      {loadedCurrentMonth && data && (
        <>
          <MonthStats entries={data.entries} />
          <ColorLegend />
          <CalendarHeatmap
            entries={data.entries}
            month={currentMonth}
            timezone={timezone}
            onMonthChange={handleMonthChange}
            onDayClick={handleDayClick}
          />
        </>
      )}

      <EntryDetailDialog
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null)
        }}
      />

      <Dialog open={!!logDate} onOpenChange={(open) => {
        if (!open) setLogDate(null)
      }}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log this day?</DialogTitle>
            <DialogDescription>
              {logDate
                ? formatLocalDate(logDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="min-h-11" onClick={() => setLogDate(null)}>Cancel</Button>
            <Button
              className="min-h-11"
              onClick={() => {
                if (!logDate) return
                router.push(`/wizard?date=${encodeURIComponent(logDate)}`)
              }}
            >
              Log for This Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
