"use client"

import { cn } from "@/lib/utils"
import type { MoodCategory } from "@/types/mood"

interface FilterBarProps {
  selected: string | null
  onSelect: (category: string | null) => void
  className?: string
}

const filters = [
  { value: null, label: "All" },
  { value: "POSITIVE", label: "😊 Positive", color: "text-[var(--color-mood-positive-medium)]" },
  { value: "NEUTRAL", label: "🧘 Neutral", color: "text-[var(--color-mood-neutral-medium)]" },
  { value: "NEGATIVE", label: "😢 Negative", color: "text-[var(--color-mood-negative-medium)]" },
]

export function FilterBar({ selected, onSelect, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filters.map((f) => {
        const isActive = selected === f.value
        return (
          <button
            key={f.value ?? "all"}
            onClick={() => onSelect(f.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-all",
              isActive
                ? "border-current bg-muted shadow-sm"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
              isActive && f.color
            )}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}
