"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAnalytics, type AnalyticsRange } from "@/lib/api/analytics"

export const analyticsKeys = {
  analytics: (range: AnalyticsRange) => ["analytics", range] as const,
}

export function useAnalytics(range: AnalyticsRange = "30d") {
  return useQuery({
    queryKey: analyticsKeys.analytics(range),
    queryFn: () => fetchAnalytics(range),
  })
}
