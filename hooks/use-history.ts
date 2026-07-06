"use client"

import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { searchEntries, fetchAllEntries } from "@/lib/api/history"
import type { SearchParams } from "@/lib/api/history"

export const historyKeys = {
  search: (params: SearchParams) => ["history", "search", params] as const,
  all: ["history", "all"] as const,
}

export function useSearchEntries(params: SearchParams) {
  return useQuery({
    queryKey: historyKeys.search(params),
    queryFn: () => searchEntries(params),
    placeholderData: keepPreviousData,
  })
}

export function useAllEntries() {
  return useQuery({
    queryKey: historyKeys.all,
    queryFn: fetchAllEntries,
  })
}
