"use client"

import { useRef, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"

export const ANALYTICS_TABS = [
  { key: "overview", label: "Overview" },
  { key: "trends", label: "Trends" },
  { key: "reflections", label: "Reflections" },
] as const

export type AnalyticsTab = (typeof ANALYTICS_TABS)[number]["key"]

interface AnalyticsTabsProps {
  value: AnalyticsTab
  onChange: (tab: AnalyticsTab) => void
}

export function AnalyticsTabs({ value, onChange }: AnalyticsTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex = index
    if (event.key === "ArrowRight") nextIndex = (index + 1) % ANALYTICS_TABS.length
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + ANALYTICS_TABS.length) % ANALYTICS_TABS.length
    else if (event.key === "Home") nextIndex = 0
    else if (event.key === "End") nextIndex = ANALYTICS_TABS.length - 1
    else return

    event.preventDefault()
    onChange(ANALYTICS_TABS[nextIndex].key)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="flex gap-1 rounded-lg border p-1" role="tablist" aria-label="Analytics views">
      {ANALYTICS_TABS.map((tab, index) => (
        <Button
          key={tab.key}
          ref={(element) => { tabRefs.current[index] = element }}
          type="button"
          role="tab"
          id={`analytics-tab-${tab.key}`}
          aria-controls={`analytics-panel-${tab.key}`}
          aria-selected={value === tab.key}
          tabIndex={value === tab.key ? 0 : -1}
          variant={value === tab.key ? "default" : "ghost"}
          className="min-h-11"
          onClick={() => onChange(tab.key)}
          onKeyDown={(event) => handleKeyDown(event, index)}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}
