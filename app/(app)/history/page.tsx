"use client"

import { Suspense, useCallback, useEffect } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { SearchBar } from "@/components/history/search-bar"
import { FilterBar } from "@/components/history/filter-bar"
import { EntryList } from "@/components/history/entry-list"
import { CsvExport } from "@/components/history/csv-export"
import { useSearchEntries } from "@/hooks/use-history"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 50
const CATEGORIES = new Set(["POSITIVE", "NEUTRAL", "NEGATIVE"])

function parsePage(value: string | null): number {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function HistoryContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const query = searchParams.get("q")?.trim() ?? ""
  const categoryParam = searchParams.get("category")
  const category = categoryParam && CATEGORIES.has(categoryParam) ? categoryParam : null
  const requestedPage = parsePage(searchParams.get("page"))
  const hasActiveFilters = Boolean(query || category)

  const { data, isLoading, isFetching, isError, error, refetch } = useSearchEntries({
    q: query || undefined,
    category: category || undefined,
    page: requestedPage,
    limit: PAGE_SIZE,
  })

  const updateUrl = useCallback(
    (updates: Record<string, string | number | null>, replace = false) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") params.delete(key)
        else params.set(key, String(value))
      }
      const queryString = params.toString()
      const href = queryString ? `${pathname}?${queryString}` : pathname
      if (replace) router.replace(href, { scroll: false })
      else router.push(href, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    if (!data) return
    const lastPage = Math.max(1, data.totalPages)
    if (requestedPage > lastPage) updateUrl({ page: lastPage }, true)
  }, [data, requestedPage, updateUrl])

  const handleSearch = useCallback((value: string) => {
    updateUrl({ q: value || null, page: null })
  }, [updateUrl])

  const handleCategory = useCallback((value: string | null) => {
    updateUrl({ category: value, page: null })
  }, [updateUrl])

  const clearFilters = useCallback(() => {
    updateUrl({ q: null, category: null, page: null })
  }, [updateUrl])

  const totalPages = Math.max(1, data?.totalPages ?? 1)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Entry History</h1>
        <CsvExport />
      </div>

      <div className="space-y-3">
        <SearchBar value={query} onSearch={handleSearch} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterBar selected={category} onSelect={handleCategory} />
          {hasActiveFilters && (
            <Button variant="ghost" className="min-h-11" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <EntryList
        entries={data?.entries}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isFiltered={hasActiveFilters}
        onClearFilters={clearFilters}
      />

      {data && totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-center gap-3 pt-2" aria-label="History pagination">
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => updateUrl({ page: requestedPage - 1 })}
            disabled={requestedPage <= 1 || isFetching}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            Page {requestedPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            className="min-h-11"
            onClick={() => updateUrl({ page: requestedPage + 1 })}
            disabled={requestedPage >= totalPages || isFetching}
          >
            {isFetching && <Loader2 className="size-3.5 animate-spin" />}
            Next
          </Button>
        </nav>
      )}
    </div>
  )
}

function HistoryFallback() {
  return (
    <div className="flex min-h-64 items-center justify-center" role="status">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
      <span className="sr-only">Loading entry history</span>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<HistoryFallback />}>
        <HistoryContent />
      </Suspense>
    </ErrorBoundary>
  )
}
