"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAnalytics } from "@/lib/api/analytics"

export const analyticsKeys = {
  analytics: (range: string) => ["analytics", range] as const,
}

export function useAnalytics(range = "30d") {
  return useQuery({
    queryKey: analyticsKeys.analytics(range),
    queryFn: () => fetchAnalytics(range),
  })
}
