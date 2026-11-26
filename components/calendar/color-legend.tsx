"use client"

import { cn } from "@/lib/utils"

interface ColorLegendProps {
  className?: string
}

const categories = [
  { label: "Positive", className: "bg-mood-positive-medium" },
  { label: "Neutral", className: "bg-mood-neutral-medium" },
  { label: "Negative", className: "bg-mood-negative-medium" },
]

export function ColorLegend({ className }: ColorLegendProps) {
  return (
    <div className={cn("space-y-2 rounded-lg border p-3 text-xs", className)} aria-label="Calendar color legend">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {categories.map((category) => (
          <div key={category.label} className="flex items-center gap-1.5">
            <span className={cn("size-3 rounded-sm", category.className)} aria-hidden="true" />
            <span>{category.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-muted/50" aria-hidden="true" />
          <span>No entry</span>
        </div>
      </div>
      <p className="text-muted-foreground">
        Color shows mood category. Intensity shade: light 1–3, medium 4–7, dark 8–10.
      </p>
    </div>
  )
}
