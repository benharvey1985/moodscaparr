"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAchievements, checkAchievements } from "@/lib/api/achievements"

export const achievementKeys = {
  all: ["achievements"] as const,
}

export function useAchievements() {
  return useQuery({
    queryKey: achievementKeys.all,
    queryFn: fetchAchievements,
  })
}

export function useCheckAchievements() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: checkAchievements,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.all })
    },
  })
}
