"use client"

import { useState } from "react"
import { MOODS, type MoodCategory } from "@/types/mood"
import { useCreateMoodEntry } from "@/hooks/use-mood-entry"
import { cn } from "@/lib/utils"

const categories: { key: MoodCategory; label: string; emoji: string; cls: string }[] = [
  { key: "POSITIVE", label: "Positive", emoji: "😊", cls: "bg-mood-positive-light hover:bg-mood-positive-medium/30" },
  { key: "NEUTRAL", label: "Neutral", emoji: "🧘", cls: "bg-mood-neutral-light hover:bg-mood-neutral-medium/30" },
  { key: "NEGATIVE", label: "Negative", emoji: "😢", cls: "bg-mood-negative-light hover:bg-mood-negative-medium/30" },
]

function getMoodBg(category: MoodCategory, active: boolean): string {
  if (category === "POSITIVE") {
    return active ? "bg-mood-positive-medium text-white" : "bg-mood-positive-light hover:bg-mood-positive-medium/30"
  }
  if (category === "NEUTRAL") {
    return active ? "bg-mood-neutral-medium text-white" : "bg-mood-neutral-light hover:bg-mood-neutral-medium/30"
  }
  return active ? "bg-mood-negative-medium text-white" : "bg-mood-negative-light hover:bg-mood-negative-medium/30"
}

export function QuickLog() {
  const [selectedCategory, setSelectedCategory] = useState<MoodCategory | null>(null)
  const createMutation = useCreateMoodEntry()

  const today = new Date().toISOString().split("T")[0]

  async function handleMoodClick(category: MoodCategory, moodIndex: number) {
    try {
      await createMutation.mutateAsync({
        category,
        moodIndex,
        intensity: 5,
        date: today,
      })
      setSelectedCategory(null)
    } catch {}
  }

  if (selectedCategory) {
    const moods = MOODS[selectedCategory]

    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          &larr; Back to categories
        </button>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {moods.map((mood, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleMoodClick(selectedCategory, idx)}
              disabled={createMutation.isPending}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-1 rounded-[--radius-standard] p-3 transition-all hover:scale-105",
                getMoodBg(selectedCategory, false)
              )}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </button>
          ))}
        </div>
        {createMutation.isPending && (
          <p className="text-xs text-muted-foreground">Saving...</p>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((cat) => (
        <button
          key={cat.key}
          type="button"
          onClick={() => setSelectedCategory(cat.key)}
          className={cn(
            "flex cursor-pointer items-center justify-center gap-1.5 rounded-[--radius-moderate] p-3 text-sm font-medium transition-all hover:scale-[1.02]",
            cat.cls
          )}
        >
          <span className="text-lg">{cat.emoji}</span>
          <span>{cat.label}</span>
        </button>
      ))}
    </div>
  )
}
