"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { WizardSkeleton } from "@/components/ui/loading-skeleton"
import { WizardPage } from "@/components/wizard/wizard-page"
import type { WizardFormData } from "@/components/wizard/wizard-provider"
import { fetchMoodEntry } from "@/lib/api/mood-entries"
import { isValidDateOnly } from "@/lib/dates"

function WizardEditContent() {
  const searchParams = useSearchParams()
  const editId = searchParams.get("id") || undefined
  const requestedDate = searchParams.get("date")
  const initialLocalDate = !editId && isValidDateOnly(requestedDate)
    ? requestedDate
    : undefined

  return (
    <WizardEditor
      key={editId ?? initialLocalDate ?? "new"}
      editId={editId}
      initialLocalDate={initialLocalDate}
    />
  )
}

function WizardEditor({
  editId,
  initialLocalDate,
}: {
  editId?: string
  initialLocalDate?: string
}) {
  const [initialData, setInitialData] = useState<WizardFormData | undefined>()
  const [loading, setLoading] = useState(!!editId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!editId) return

    let active = true
    fetchMoodEntry(editId)
      .then((entry) => {
        if (!active) return
        setInitialData({
          category: entry.category,
          moodIndex: entry.moodIndex,
          intensity: entry.intensity,
          localDate: entry.localDate,
          activities: entry.activities,
          weather: entry.weather,
          sleepHours: entry.sleepHours,
          sleepQuality: entry.sleepQuality,
          energyLevel: entry.energyLevel,
          stressLevel: entry.stressLevel,
          reflection1: entry.reflection1,
          reflection2: entry.reflection2,
          reflection3: entry.reflection3,
          reflection4: entry.reflection4,
        })
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Failed to load entry")
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [editId])

  if (loading) return <WizardSkeleton />

  return (
    <>
      <h1 className="text-2xl font-bold">{editId ? "Edit Entry" : "New Entry"}</h1>
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">Entry not found</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
      {!error && (
        <WizardPage
          editId={editId}
          initialData={initialData}
          initialLocalDate={initialLocalDate}
        />
      )}
    </>
  )
}

export function WizardEdit() {
  return (
    <ErrorBoundary>
      <WizardEditContent />
    </ErrorBoundary>
  )
}
