"use client"

import { useMemo, useState, type ReactNode } from "react"
import { Brain, Frown, Heart, MessageSquare, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatLocalDate } from "@/lib/dates"
import type { MoodEntry } from "@/types/mood"
import {
  REFLECTION_PROMPTS,
  type ReflectionPromptKey,
} from "@/components/history/reflection-prompts"

interface ReflectionsTabProps {
  entries: MoodEntry[] | undefined
}

interface ReflectionItem {
  id: string
  date: string
  response: string
}

const PAGE_SIZE = 20

const PROMPT_ICONS: Record<ReflectionPromptKey, ReactNode> = {
  reflection1: <Sparkles className="size-4" />,
  reflection2: <Frown className="size-4" />,
  reflection3: <Heart className="size-4" />,
  reflection4: <Brain className="size-4" />,
}

const FILTERS: Array<{ key: ReflectionPromptKey | "all"; label: string; icon: ReactNode }> = [
  { key: "all", label: "All", icon: <MessageSquare className="size-4" /> },
  { key: "reflection1", label: "Went well", icon: <Sparkles className="size-4" /> },
  { key: "reflection2", label: "Challenging", icon: <Frown className="size-4" /> },
  { key: "reflection3", label: "Grateful", icon: <Heart className="size-4" /> },
  { key: "reflection4", label: "On my mind", icon: <Brain className="size-4" /> },
]

function groupReflections(entries: MoodEntry[]): Record<ReflectionPromptKey, ReflectionItem[]> {
  const groups: Record<ReflectionPromptKey, ReflectionItem[]> = {
    reflection1: [],
    reflection2: [],
    reflection3: [],
    reflection4: [],
  }

  for (const entry of entries) {
    for (const { key } of REFLECTION_PROMPTS) {
      const response = entry[key]
      if (!response) continue
      groups[key].push({
        id: `${entry.id}-${key}`,
        date: entry.localDate,
        response,
      })
    }
  }

  return groups
}

export function ReflectionsTab({ entries }: ReflectionsTabProps) {
  const [filter, setFilter] = useState<ReflectionPromptKey | "all">("all")
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const allEntries = useMemo(() => entries ?? [], [entries])
  const hasAny = allEntries.some((entry) => REFLECTION_PROMPTS.some(({ key }) => entry[key]))
  const grouped = useMemo(
    () => groupReflections(allEntries.slice(0, visibleCount)),
    [allEntries, visibleCount]
  )
  const visibleHasAny = REFLECTION_PROMPTS.some(({ key }) => grouped[key].length > 0)
  const hasMore = visibleCount < allEntries.length

  if (!hasAny) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
        <MessageSquare className="mb-3 size-10 text-muted-foreground" />
        <h2 className="text-lg font-semibold">No reflections recorded yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Add reflections when logging your mood to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter reflections by prompt">
        {FILTERS.map(({ key, label, icon }) => (
          <Button
            key={key}
            type="button"
            variant={filter === key ? "default" : "outline"}
            className="min-h-11"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing reflections from {Math.min(visibleCount, allEntries.length)} of {allEntries.length} entries, 20 entries at a time.
      </p>

      {!visibleHasAny && (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No reflections in the loaded entries for this filter.
        </div>
      )}

      <div className="space-y-8">
        {REFLECTION_PROMPTS.map(({ key, label }) => {
          if (filter !== "all" && filter !== key) return null
          const items = grouped[key]
          if (items.length === 0) return null

          return (
            <section key={key}>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  {PROMPT_ICONS[key]}
                </div>
                <h2 className="font-semibold">{label}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="py-3">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {formatLocalDate(item.date, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                      <p className="text-sm leading-relaxed">{item.response}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </div>

      {hasMore && (
        <Button variant="outline" className="min-h-11" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
          Load More Entries
        </Button>
      )}
    </div>
  )
}
