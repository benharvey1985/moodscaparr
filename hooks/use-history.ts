"use client"

import { useQuery } from "@tanstack/react-query"
import { searchEntries } from "@/lib/api/history"
import type { SearchParams } from "@/lib/api/history"

export const historyKeys = {
  search: (params: SearchParams) => ["history", "search", params] as const,
}

export function useSearchEntries(params: SearchParams) {
  return useQuery({
    queryKey: historyKeys.search(params),
    queryFn: () => searchEntries(params),
  })
}
