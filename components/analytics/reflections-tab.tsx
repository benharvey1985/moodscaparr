"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Sparkles, Frown, Heart, Brain } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
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

const PROMPT_ICONS: Record<string, React.ReactNode> = {
  reflection1: <Sparkles className="size-4" />,
  reflection2: <Frown className="size-4" />,
  reflection3: <Heart className="size-4" />,
  reflection4: <Brain className="size-4" />,
}

type PromptKey = keyof typeof PROMPT_LABELS

interface ReflectionItem {
  id: string
  date: string
  response: string
}

const FILTERS: Array<{ key: PromptKey | "all"; label: string; icon: React.ReactNode }> = [
  { key: "all", label: "All", icon: <MessageSquare className="size-4" /> },
  { key: "reflection1", label: "Went well", icon: <Sparkles className="size-4" /> },
  { key: "reflection2", label: "Challenging", icon: <Frown className="size-4" /> },
  { key: "reflection3", label: "Grateful", icon: <Heart className="size-4" /> },
  { key: "reflection4", label: "On my mind", icon: <Brain className="size-4" /> },
]

export function ReflectionsTab({ entries }: ReflectionsTabProps) {
  const [filter, setFilter] = useState<PromptKey | "all">("all")

  const grouped = useMemo(() => {
    const groups: Record<string, ReflectionItem[]> = {
      reflection1: [],
      reflection2: [],
      reflection3: [],
      reflection4: [],
    }

    if (!entries || entries.length === 0) return groups

    for (const entry of entries.slice(0, 20)) {
      const fields: PromptKey[] = ["reflection1", "reflection2", "reflection3", "reflection4"]
      for (const field of fields) {
        const val = entry[field]
        if (val) {
          groups[field].push({
            id: `${entry.id}-${field}`,
            date: entry.date,
            response: val,
          })
        }
      }
    }

    return groups
  }, [entries])

  const hasAny = Object.values(grouped).some((g) => g.length > 0)

  if (!hasAny) {
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
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(({ key, label, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors",
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {(Object.entries(PROMPT_LABELS) as [PromptKey, string][]).map(([key, label]) => {
          if (filter !== "all" && filter !== key) return null
          const items = grouped[key]
          if (items.length === 0) return null

          return (
            <section key={key}>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  {PROMPT_ICONS[key]}
                </div>
                <h3 className="font-semibold">{label}</h3>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="py-3">
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {format(new Date(item.date), "MMM d, yyyy")}
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
    </div>
  )
}
