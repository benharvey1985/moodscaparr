"use client"

import { MOODS, type MoodCategory, type MoodEntry } from "@/types/mood"
import { formatLocalDate } from "@/lib/dates"
import { Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const borderColors: Record<string, string> = {
  POSITIVE: "border-l-mood-positive-medium",
  NEUTRAL: "border-l-mood-neutral-medium",
  NEGATIVE: "border-l-mood-negative-medium",
}

interface EntryCardProps {
  entry: MoodEntry
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const moods = MOODS[entry.category as MoodCategory]
  const mood = moods?.[entry.moodIndex]
  const moodLabel = mood?.label ?? "Unknown mood"
  const borderColor = borderColors[entry.category] ?? "border-l-border"
  const displayDate = formatLocalDate(entry.localDate, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[--radius-pill] border border-l-4 bg-glass p-4 backdrop-blur-md",
        borderColor
      )}
    >
      <div className="flex shrink-0 items-center justify-center">
        <span className="text-2xl" aria-hidden="true">{mood?.emoji ?? "?"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{moodLabel}</p>
        <p className="text-xs text-muted-foreground">
          <time dateTime={entry.localDate}>{displayDate}</time>
          {entry.activities.length > 0 &&
            ` · ${entry.activities.slice(0, 2).join(", ")}`}
        </p>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0 gap-1">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="max-lg:size-11"
              aria-label={`Edit ${moodLabel} entry from ${displayDate}`}
              onClick={() => onEdit(entry.id)}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
            </Button>
          )}
          {onDelete && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="max-lg:size-11"
              aria-label={`Delete ${moodLabel} entry from ${displayDate}`}
              onClick={() => onDelete(entry.id)}
            >
              <Trash2 className="size-3.5 text-destructive" aria-hidden="true" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
