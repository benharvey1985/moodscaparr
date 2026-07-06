"use client"

import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DeleteDialog } from "@/components/delete-dialog"
import { MOODS, type MoodCategory } from "@/types/mood"
import type { MoodEntry } from "@/types/mood"
import { Pencil, Trash2 } from "lucide-react"
import { useState } from "react"

interface EntryDetailDialogProps {
  entry: MoodEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const categoryColors: Record<string, string> = {
  POSITIVE: "bg-[var(--color-mood-positive-medium)]",
  NEUTRAL: "bg-[var(--color-mood-neutral-medium)]",
  NEGATIVE: "bg-[var(--color-mood-negative-medium)]",
}

export function EntryDetailDialog({ entry, open, onOpenChange }: EntryDetailDialogProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!entry) return null

  const moods = MOODS[entry.category as MoodCategory]
  const mood = moods?.[entry.moodIndex]
  const colorStrip = categoryColors[entry.category] ?? "bg-border"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <div className={`-mx-4 -mt-4 h-1.5 ${colorStrip}`} />
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{mood?.emoji ?? "?"}</span>
              <div>
                <DialogTitle className="text-lg">{mood?.label ?? "Unknown"}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(entry.date), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
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
                  {entry.activities.map((a) => (
                    <Badge key={a} variant="secondary">{a}</Badge>
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
                  <p className="font-medium">{entry.sleepHours}h {entry.sleepQuality ? `(${entry.sleepQuality})` : ""}</p>
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

            {(entry.reflection1 || entry.reflection2 || entry.reflection3 || entry.reflection4) && (
              <>
                <Separator />
                <div className="max-h-48 space-y-3 overflow-y-auto">
                  {entry.reflection1 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">How are you feeling today?</p>
                      <p className="text-sm">{entry.reflection1}</p>
                    </div>
                  )}
                  {entry.reflection2 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">What went well?</p>
                      <p className="text-sm">{entry.reflection2}</p>
                    </div>
                  )}
                  {entry.reflection3 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">What&apos;s on your mind?</p>
                      <p className="text-sm">{entry.reflection3}</p>
                    </div>
                  )}
                  {entry.reflection4 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Anything else?</p>
                      <p className="text-sm">{entry.reflection4}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="-mx-4 -mb-4 flex items-center justify-between rounded-b-xl border-t bg-muted/50 p-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
            <Button
              size="sm"
              onClick={() => {
                onOpenChange(false)
                router.push(`/wizard?id=${entry.id}`)
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
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) onOpenChange(false)
        }}
      />
    </>
  )
}
