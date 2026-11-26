"use client"

import { Suspense, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2, Printer, RefreshCw } from "lucide-react"
import { useAnalytics } from "@/hooks/use-analytics"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Button } from "@/components/ui/button"
import type { AnalyticsRange } from "@/lib/api/analytics"
import { DateRangeFilter } from "@/components/analytics/date-range-filter"
import {
  AnalyticsTabs,
  type AnalyticsTab,
} from "@/components/analytics/analytics-tabs"
import { OverviewTab } from "@/components/analytics/overview-tab"
import { TrendsTab } from "@/components/analytics/trends-tab"
import { ReflectionsTab } from "@/components/analytics/reflections-tab"

const TABS = new Set<AnalyticsTab>(["overview", "trends", "reflections"])
const RANGES = new Set<AnalyticsRange>(["7d", "30d", "90d", "all"])

function parseTab(value: string | null): AnalyticsTab {
  return value && TABS.has(value as AnalyticsTab) ? value as AnalyticsTab : "overview"
}

function parseRange(value: string | null): AnalyticsRange {
  return value && RANGES.has(value as AnalyticsRange) ? value as AnalyticsRange : "30d"
}

function AnalyticsContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeTab = parseTab(searchParams.get("tab"))
  const activeRange = parseRange(searchParams.get("range"))

  const { data, isLoading, isFetching, isError, error, refetch } = useAnalytics(activeRange)

  const updateParam = useCallback((key: "tab" | "range", value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "overview" && key === "tab") params.delete(key)
    else if (value === "30d" && key === "range") params.delete(key)
    else params.set(key, value)
    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
  }, [pathname, router, searchParams])

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="min-h-11" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print / Save PDF
          </Button>
          <Button variant="ghost" className="min-h-11" disabled={isFetching} onClick={() => refetch()}>
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <AnalyticsTabs value={activeTab} onChange={(tab) => updateParam("tab", tab)} />
        <DateRangeFilter value={activeRange} onChange={(range) => updateParam("range", range)} />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-12" role="status" aria-live="polite">
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading analytics...</span>
        </div>
      )}

      {isError && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <p className="text-sm font-medium text-destructive">Couldn&apos;t load analytics</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {error?.message || "An unexpected error occurred"}
          </p>
          <Button variant="outline" className="mt-3 min-h-11" disabled={isFetching} onClick={() => refetch()}>
            {isFetching && <Loader2 className="size-4 animate-spin" />}
            Try Again
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <div
          role="tabpanel"
          id={`analytics-panel-${activeTab}`}
          aria-labelledby={`analytics-tab-${activeTab}`}
          tabIndex={0}
          className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {activeTab === "overview" && <OverviewTab stats={data?.stats} />}
          {activeTab === "trends" && <TrendsTab entries={data?.entries} />}
          {activeTab === "reflections" && <ReflectionsTab key={activeRange} entries={data?.entries} />}
        </div>
      )}
    </div>
  )
}

function AnalyticsFallback() {
  return (
    <div className="flex min-h-64 items-center justify-center" role="status">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading analytics</span>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<AnalyticsFallback />}>
        <AnalyticsContent />
      </Suspense>
    </ErrorBoundary>
  )
}
