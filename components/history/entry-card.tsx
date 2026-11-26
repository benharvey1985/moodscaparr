"use client"

import { Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatLocalDate } from "@/lib/dates"
import { MOODS, type MoodCategory, type MoodEntry } from "@/types/mood"

const borderColors: Record<MoodCategory, string> = {
  POSITIVE: "border-l-mood-positive-medium",
  NEUTRAL: "border-l-mood-neutral-medium",
  NEGATIVE: "border-l-mood-negative-medium",
}

interface HistoryEntryCardProps {
  entry: MoodEntry
  onView: () => void
  onEdit: () => void
  onDelete: () => void
}

export function HistoryEntryCard({ entry, onView, onEdit, onDelete }: HistoryEntryCardProps) {
  const mood = MOODS[entry.category]?.[entry.moodIndex]
  const dateLabel = entry.localDate
    ? formatLocalDate(entry.localDate, { month: "short", day: "numeric", year: "numeric" })
    : "Date unavailable"

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-l-4 bg-glass p-4 backdrop-blur-md sm:flex-row sm:items-center",
        borderColors[entry.category]
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="shrink-0 text-2xl" aria-hidden="true">{mood?.emoji ?? "?"}</span>
        <div className="min-w-0">
          <p className="text-sm font-medium">{mood?.label ?? "Unknown mood"}</p>
          <p className="text-xs text-muted-foreground">
            {dateLabel}
            {entry.activities.length > 0 && ` · ${entry.activities.slice(0, 2).join(", ")}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
        <Button variant="outline" className="min-h-11" onClick={onView}>
          <Eye className="size-4" />
          View Details
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`Edit ${mood?.label ?? "mood"} entry from ${dateLabel}`}
          onClick={onEdit}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-11 text-destructive"
          aria-label={`Delete ${mood?.label ?? "mood"} entry from ${dateLabel}`}
          onClick={onDelete}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  )
}
