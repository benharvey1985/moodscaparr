"use client"

import { MOODS, type MoodCategory } from "@/types/mood"
import { cn } from "@/lib/utils"

interface MoodSelectorProps {
  selectedCategory: MoodCategory | null
  selectedMoodIndex: number | null
  onMoodSelect: (category: MoodCategory, index: number) => void
  intensity: number
  onIntensityChange: (value: number) => void
  date: string
  onDateChange: (date: string) => void
}

function getCategoryBg(category: MoodCategory, active: boolean): string {
  if (category === "POSITIVE") {
    return active ? "bg-mood-positive-medium text-white" : "bg-mood-positive-light text-foreground"
  }
  if (category === "NEUTRAL") {
    return active ? "bg-mood-neutral-medium text-white" : "bg-mood-neutral-light text-foreground"
  }
  return active ? "bg-mood-negative-medium text-white" : "bg-mood-negative-light text-foreground"
}

function getMoodBg(category: MoodCategory, active: boolean): string {
  if (category === "POSITIVE") {
    return active ? "bg-mood-positive-medium text-white" : "bg-mood-positive-light hover:bg-mood-positive-medium/20"
  }
  if (category === "NEUTRAL") {
    return active ? "bg-mood-neutral-medium text-white" : "bg-mood-neutral-light hover:bg-mood-neutral-medium/20"
  }
  return active ? "bg-mood-negative-medium text-white" : "bg-mood-negative-light hover:bg-mood-negative-medium/20"
}

export function MoodSelector({
  selectedCategory,
  selectedMoodIndex,
  onMoodSelect,
  intensity,
  onIntensityChange,
  date,
  onDateChange,
}: MoodSelectorProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.entries(MOODS) as [MoodCategory, typeof MOODS[MoodCategory]][]).map(
          ([category, moods]) => {
            const isSelected = selectedCategory === category

            return (
              <div key={category} className="space-y-2">
                <h3
                  className={cn(
                    "rounded-xl px-3 py-1.5 text-center text-sm font-semibold",
                    getCategoryBg(category, isSelected)
                  )}
                >
                  {category.charAt(0) + category.slice(1).toLowerCase()}
                </h3>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {moods.map((mood, idx) => {
                    const isActive =
                      selectedCategory === category && selectedMoodIndex === idx

                    return (
                      <button
                        key={`${category}-${idx}`}
                        type="button"
                        onClick={() => onMoodSelect(category, idx)}
                        className={cn(
                          "flex cursor-pointer flex-col items-center gap-1 rounded-xl p-2 transition-all hover:scale-105",
                          getMoodBg(category, isActive)
                        )}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-[0.875rem] leading-tight">
                          {mood.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          }
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Intensity</label>
            <span className="text-sm text-muted-foreground">{intensity}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => onIntensityChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-mood-positive-medium"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 - Mild</span>
            <span>10 - Intense</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
          />
        </div>
      </div>
    </div>
  )
}
