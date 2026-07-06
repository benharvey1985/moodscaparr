"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchStreak, fetchStats } from "@/lib/api/streak"

export const streakKeys = {
  streak: ["streak"] as const,
  stats: ["stats"] as const,
}

export function useStreak() {
  return useQuery({
    queryKey: streakKeys.streak,
    queryFn: fetchStreak,
  })
}

export function useStats() {
  return useQuery({
    queryKey: streakKeys.stats,
    queryFn: fetchStats,
  })
}
