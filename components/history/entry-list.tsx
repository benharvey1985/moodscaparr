"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Heart } from "lucide-react"
import type { MoodEntry } from "@/types/mood"
import { HistoryEntryCard } from "@/components/history/entry-card"
import { EntryDetailDialog } from "@/components/history/entry-detail-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EntryListProps {
  entries: MoodEntry[] | undefined
  isLoading: boolean
  isError: boolean
  error?: Error | null
  onRetry?: () => void
  isFiltered?: boolean
  onClearFilters?: () => void
  className?: string
}

export function EntryList({
  entries,
  isLoading,
  isError,
  error,
  onRetry,
  isFiltered = false,
  onClearFilters,
  className,
}: EntryListProps) {
  const router = useRouter()
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)} role="status" aria-live="polite">
        <span className="sr-only">Loading entries</span>
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 rounded-xl border border-l-4 bg-card p-4">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div
        role="alert"
        className={cn("rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center", className)}
      >
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-5 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">Couldn&apos;t load entries</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error?.message || "An unexpected error occurred"}
        </p>
        {onRetry && (
          <Button variant="outline" className="mt-3 min-h-11" onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className={cn("rounded-lg border border-dashed p-10 text-center", className)}>
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
          <Heart className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">
          {isFiltered ? "No entries match these filters" : "No entries yet"}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isFiltered
            ? "Try a different search or mood category."
            : "Start tracking your mood to see entries here."}
        </p>
        {isFiltered && onClearFilters ? (
          <Button variant="outline" className="mt-4 min-h-11" onClick={onClearFilters}>
            Clear Filters
          </Button>
        ) : (
          <Button className="mt-4 min-h-11" onClick={() => router.push("/wizard")}>
            Log Your First Mood
          </Button>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {entries.map((entry) => (
          <HistoryEntryCard
            key={entry.id}
            entry={entry}
            onView={() => setSelectedEntry(entry)}
            onEdit={() => router.push(`/wizard?id=${encodeURIComponent(entry.id)}`)}
            onDelete={() => setDeleteTarget(entry.id)}
          />
        ))}
      </div>

      <EntryDetailDialog
        entry={selectedEntry}
        open={!!selectedEntry}
        onOpenChange={(open) => {
          if (!open) setSelectedEntry(null)
        }}
      />

      <DeleteDialog
        entryId={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      />
    </>
  )
}
