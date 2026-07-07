"use client"

import { useState } from "react"
import type { MoodEntry } from "@/types/mood"
import { EntryCard } from "@/components/entry-card"
import { EntryDetailDialog } from "@/components/history/entry-detail-dialog"
import { DeleteDialog } from "@/components/delete-dialog"
import { Skeleton } from "@/components/ui/loading-skeleton"
import { Heart, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface EntryListProps {
  entries: MoodEntry[] | undefined
  isLoading: boolean
  isError: boolean
  error?: Error | null
  onRetry?: () => void
  className?: string
}

export function EntryList({ entries, isLoading, isError, error, onRetry, className }: EntryListProps) {
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-l-4 bg-card p-4">
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
      <div className={cn("rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center", className)}>
        <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="size-5 text-destructive" />
        </div>
        <p className="text-sm font-medium text-destructive">Couldn&apos;t load entries</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {error?.message || "An unexpected error occurred"}
        </p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
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
        <h3 className="text-lg font-semibold">No entries found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Start tracking your mood to see entries here.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {entries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => setSelectedEntry(entry)}
            className="w-full text-left"
          >
            <EntryCard
              entry={entry}
              onEdit={(id) => {
                window.location.href = `/wizard?id=${id}`
              }}
              onDelete={(id) => setDeleteTarget(id)}
            />
          </button>
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
