"use client"

import { Button } from "@/components/ui/button"
import type { AnalyticsRange } from "@/lib/api/analytics"

const RANGES: Array<{ value: AnalyticsRange; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
]

interface DateRangeFilterProps {
  value: AnalyticsRange
  onChange: (value: AnalyticsRange) => void
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label="Analytics date range">
      {RANGES.map((range) => (
        <Button
          key={range.value}
          type="button"
          variant={value === range.value ? "default" : "outline"}
          className="min-h-11"
          aria-pressed={value === range.value}
          onClick={() => onChange(range.value)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  )
}
