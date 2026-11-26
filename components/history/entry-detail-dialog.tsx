"use client"

import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DeleteDialog } from "@/components/delete-dialog"
import { MOODS, type MoodEntry } from "@/types/mood"
import { formatLocalDate } from "@/lib/dates"
import { REFLECTION_PROMPTS } from "@/components/history/reflection-prompts"

interface EntryDetailDialogProps {
  entry: MoodEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const categoryColors = {
  POSITIVE: "bg-mood-positive-medium",
  NEUTRAL: "bg-mood-neutral-medium",
  NEGATIVE: "bg-mood-negative-medium",
} as const

const categoryLabels = {
  POSITIVE: "Positive",
  NEUTRAL: "Neutral",
  NEGATIVE: "Negative",
} as const

export function EntryDetailDialog({ entry, open, onOpenChange }: EntryDetailDialogProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!entry) return null

  const mood = MOODS[entry.category]?.[entry.moodIndex]
  const colorStrip = categoryColors[entry.category]
  const dateLabel = entry.localDate
    ? formatLocalDate(entry.localDate, { weekday: "long", month: "long", day: "numeric", year: "numeric" })
    : "Date unavailable"
  const hasReflections = REFLECTION_PROMPTS.some(({ key }) => entry[key])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="flex max-h-[calc(100dvh-2rem)] max-w-md flex-col overflow-hidden sm:max-w-lg">
          <div className={`-mx-4 -mt-4 h-1.5 shrink-0 ${colorStrip}`} />
          <DialogHeader className="shrink-0 pr-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">{mood?.emoji ?? "?"}</span>
              <div>
                <DialogTitle className="text-lg">{mood?.label ?? "Unknown mood"}</DialogTitle>
                <DialogDescription>{dateLabel}</DialogDescription>
              </div>
            </div>
            <Badge variant="secondary" className="w-fit">{categoryLabels[entry.category]}</Badge>
          </DialogHeader>

          <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Intensity</p>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${colorStrip}`}
                    style={{ width: `${(entry.intensity / 10) * 100}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {entry.intensity}/10
                </span>
              </div>
            </div>

            {entry.activities.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-muted-foreground">Activities</p>
                <div className="flex flex-wrap gap-1.5">
                  {entry.activities.map((activity) => (
                    <Badge key={activity} variant="secondary">{activity}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              {entry.weather && (
                <div>
                  <p className="text-xs text-muted-foreground">Weather</p>
                  <p className="font-medium">{entry.weather}</p>
                </div>
              )}
              {entry.sleepHours != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Sleep</p>
                  <p className="font-medium">
                    {entry.sleepHours}h {entry.sleepQuality ? `(${entry.sleepQuality})` : ""}
                  </p>
                </div>
              )}
              {entry.energyLevel != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Energy</p>
                  <p className="font-medium">{entry.energyLevel}/10</p>
                </div>
              )}
              {entry.stressLevel != null && (
                <div>
                  <p className="text-xs text-muted-foreground">Stress</p>
                  <p className="font-medium">{entry.stressLevel}/10</p>
                </div>
              )}
            </div>

            {hasReflections && (
              <>
                <Separator />
                <div className="space-y-3">
                  {REFLECTION_PROMPTS.map(({ key, label }) => {
                    const response = entry[key]
                    if (!response) return null
                    return (
                      <div key={key}>
                        <p className="text-xs font-medium text-muted-foreground">{label}</p>
                        <p className="mt-1 text-sm leading-relaxed">{response}</p>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className="-mx-4 -mb-4 flex shrink-0 items-center justify-between gap-2 rounded-b-xl border-t bg-muted/50 p-4">
            <Button
              variant="destructive"
              className="min-h-11"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
            <Button
              className="min-h-11"
              onClick={() => {
                onOpenChange(false)
                router.push(`/wizard?id=${encodeURIComponent(entry.id)}`)
              }}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        entryId={entry.id}
        open={deleteOpen}
        onOpenChange={(isOpen) => {
          setDeleteOpen(isOpen)
          if (!isOpen) onOpenChange(false)
        }}
      />
    </>
  )
}
