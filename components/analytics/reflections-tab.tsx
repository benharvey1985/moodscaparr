"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { format } from "date-fns"
import type { MoodEntry } from "@/types/mood"

interface ReflectionsTabProps {
  entries: MoodEntry[] | undefined
}

const PROMPT_LABELS = {
  reflection1: "What went well?",
  reflection2: "What was challenging?",
  reflection3: "What are you grateful for?",
  reflection4: "What's on your mind?",
} as const

interface ReflectionItem {
  id: string
  date: string
  prompt: string
  response: string
}

export function ReflectionsTab({ entries }: ReflectionsTabProps) {
  const reflections = useMemo(() => {
    if (!entries || entries.length === 0) return []

    const items: ReflectionItem[] = []
    for (const entry of entries.slice(0, 20)) {
      const fields: Array<keyof typeof PROMPT_LABELS> = ["reflection1", "reflection2", "reflection3", "reflection4"]
      for (const field of fields) {
        const val = entry[field]
        if (val) {
          items.push({
            id: `${entry.id}-${field}`,
            date: entry.date,
            prompt: PROMPT_LABELS[field],
            response: val,
          })
        }
      }
    }
    return items
  }, [entries])

  if (reflections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <MessageSquare className="mb-3 size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No reflections recorded yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add reflections when logging your mood to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Showing {reflections.length} reflection{reflections.length !== 1 ? "s" : ""}
      </p>
      {reflections.map((item) => (
        <Card key={item.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {item.prompt}
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {format(new Date(item.date), "MMM d, yyyy")}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{item.response}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
