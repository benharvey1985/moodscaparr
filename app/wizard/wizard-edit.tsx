"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { WizardSkeleton } from "@/components/ui/loading-skeleton"
import { WizardPage } from "@/components/wizard/wizard-page"
import type { WizardFormData } from "@/components/wizard/wizard-provider"

function WizardEditContent() {
  const searchParams = useSearchParams()
  const editId = searchParams.get("id")
  const [initialData, setInitialData] = useState<WizardFormData | undefined>()
  const [loading, setLoading] = useState(!!editId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!editId) {
      setLoading(false)
      return
    }

    fetch(`/api/mood-entries/${editId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load entry")
        return res.json()
      })
      .then((entry) => {
        setInitialData({
          category: entry.category,
          moodIndex: entry.moodIndex,
          intensity: entry.intensity,
          date: entry.date?.split("T")[0] ?? new Date().toISOString().split("T")[0],
          activities: entry.activities ?? [],
          weather: entry.weather ?? undefined,
          sleepHours: entry.sleepHours ?? undefined,
          sleepQuality: entry.sleepQuality ?? undefined,
          energyLevel: entry.energyLevel ?? undefined,
          stressLevel: entry.stressLevel ?? undefined,
          reflection1: entry.reflection1 ?? undefined,
          reflection2: entry.reflection2 ?? undefined,
          reflection3: entry.reflection3 ?? undefined,
          reflection4: entry.reflection4 ?? undefined,
        })
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [editId])

  if (loading) {
    return <WizardSkeleton />
  }

  return (
    <>
      <h1 className="text-2xl font-bold">
        {editId ? "Edit Entry" : "New Entry"}
      </h1>
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">Entry not found</p>
          <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          <Link
            href="/dashboard"
            className="mt-3 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80"
          >
            Back to Dashboard
          </Link>
        </div>
      )}
      {!error && (
        <WizardPage editId={editId ?? undefined} initialData={initialData} />
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
