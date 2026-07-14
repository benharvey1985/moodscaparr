"use client"

import { useState } from "react"
import { useAnalytics } from "@/hooks/use-analytics"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Button } from "@/components/ui/button"
import { DateRangeFilter } from "@/components/analytics/date-range-filter"
import { OverviewTab } from "@/components/analytics/overview-tab"
import { TrendsTab } from "@/components/analytics/trends-tab"
import { ReflectionsTab } from "@/components/analytics/reflections-tab"
import { Loader2, RefreshCw } from "lucide-react"

type Tab = "overview" | "trends" | "reflections"

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "trends", label: "Trends" },
  { key: "reflections", label: "Reflections" },
]

function AnalyticsContent() {
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [activeRange, setActiveRange] = useState("30d")

  const { data, isLoading, isError, error, refetch } = useAnalytics(activeRange)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-1 size-3.5" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg border p-1">
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
        <DateRangeFilter value={activeRange} onChange={setActiveRange} />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-destructive/10">
            <Loader2 className="size-5 text-destructive" />
          </div>
          <p className="text-sm font-medium text-destructive">Couldn&apos;t load analytics</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {error?.message || "An unexpected error occurred"}
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {activeTab === "overview" && <OverviewTab stats={data?.stats} />}
          {activeTab === "trends" && <TrendsTab entries={data?.entries} />}
          {activeTab === "reflections" && <ReflectionsTab entries={data?.entries} />}
        </>
      )}
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <AnalyticsContent />
    </ErrorBoundary>
  )
}
