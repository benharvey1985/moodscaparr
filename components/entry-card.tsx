"use client"

import { MOODS, type MoodCategory } from "@/types/mood"
import type { MoodEntry } from "@/types/mood"
import { format } from "date-fns"
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
  const borderColor = borderColors[entry.category] ?? "border-l-border"

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-[--radius-moderate] border border-l-4 bg-card p-4",
        borderColor
      )}
    >
      <div className="flex shrink-0 items-center justify-center">
        <span className="text-2xl">{mood?.emoji ?? "?"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{mood?.label ?? "Unknown"}</p>
        <p className="text-xs text-muted-foreground">
          {format(new Date(entry.date), "MMM d, yyyy")}
          {entry.activities.length > 0 &&
            ` · ${entry.activities.slice(0, 2).join(", ")}`}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onEdit?.(entry.id)}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onDelete?.(entry.id)}
        >
          <Trash2 className="size-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
