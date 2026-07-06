"use client"

import { cn } from "@/lib/utils"

interface ColorLegendProps {
  className?: string
}

export function ColorLegend({ className }: ColorLegendProps) {
  return (
    <div className={cn("flex items-center gap-4 text-xs", className)}>
      <div className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm bg-[var(--color-mood-positive-medium)]" />
        <span className="text-muted-foreground">Positive</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm bg-[var(--color-mood-neutral-medium)]" />
        <span className="text-muted-foreground">Neutral</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="size-3 rounded-sm bg-[var(--color-mood-negative-medium)]" />
        <span className="text-muted-foreground">Negative</span>
      </div>
    </div>
  )
}
