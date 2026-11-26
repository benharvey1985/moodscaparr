"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FilterBarProps {
  selected: string | null
  onSelect: (category: string | null) => void
  className?: string
}

const filters = [
  { value: null, label: "All" },
  { value: "POSITIVE", label: "😊 Positive", color: "text-mood-positive-medium" },
  { value: "NEUTRAL", label: "🧘 Neutral", color: "text-mood-neutral-medium" },
  { value: "NEGATIVE", label: "😢 Negative", color: "text-mood-negative-medium" },
]

export function FilterBar({ selected, onSelect, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} aria-label="Filter entries by mood category">
      {filters.map((filter) => {
        const isActive = selected === filter.value
        return (
          <Button
            key={filter.value ?? "all"}
            type="button"
            variant="outline"
            className={cn(
              "min-h-11",
              isActive && "border-current bg-muted shadow-sm",
              isActive && filter.color
            )}
            aria-pressed={isActive}
            onClick={() => onSelect(filter.value)}
          >
            {filter.label}
          </Button>
        )
      })}
    </div>
  )
}
