"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Header } from "@/components/header"
import { SearchBar } from "@/components/history/search-bar"
import { FilterBar } from "@/components/history/filter-bar"
import { EntryList } from "@/components/history/entry-list"
import { CsvExport } from "@/components/history/csv-export"
import { useSearchEntries } from "@/hooks/use-history"
import { Button } from "@/components/ui/button"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { Loader2 } from "lucide-react"

function HistoryContent() {
  const router = useRouter()
  const [session, setSession] = useState<{
    user: { name?: string | null; email?: string | null; image?: string | null; role?: string }
  } | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const params = { q: query || undefined, category: category || undefined, page, limit: 50 }
  const { data, isLoading, isError, error, refetch } = useSearchEntries(params)

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (!res?.data) {
        router.push("/auth/login")
        return
      }
      setSession(res.data as typeof session)
      setSessionLoading(false)
    })
  }, [router])

  const handleSearch = useCallback((q: string) => {
    setQuery(q)
    setPage(1)
  }, [])

  const handleCategory = useCallback((cat: string | null) => {
    setCategory(cat)
    setPage(1)
  }, [])

  if (sessionLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header user={null} />
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        user={
          session
            ? {
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                role: session.user.role,
              }
            : null
        }
      />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 p-6 pb-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Entry History</h2>
          <CsvExport />
        </div>

        <div className="space-y-3">
          <SearchBar onSearch={handleSearch} />
          <FilterBar selected={category} onSelect={handleCategory} />
        </div>

        <EntryList
          entries={data?.entries}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRetry={() => refetch()}
        />

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center pt-4">
            {page < data.totalPages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  "Load More"
                )}
              </Button>
            )}
            {page > 1 && (
              <p className="text-xs text-muted-foreground">
                Page {page} of {data.totalPages}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default function HistoryPage() {
  return (
    <ErrorBoundary>
      <HistoryContent />
    </ErrorBoundary>
  )
}
