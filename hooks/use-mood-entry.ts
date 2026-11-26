"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchMoodEntries,
  createMoodEntry,
  updateMoodEntry,
  deleteMoodEntry,
} from "@/lib/api/mood-entries"
import { parseDateOnly } from "@/lib/dates"
import type { MoodEntry, UpdateMoodEntryInput } from "@/types/mood"

export const moodKeys = {
  all: ["mood-entries"] as const,
  byDate: (date: string) => ["mood-entries", "date", date] as const,
  byRange: (from: string, to: string) => ["mood-entries", "range", from, to] as const,
  latest: () => ["mood-entries", "latest"] as const,
}

const dateDependentQueries = [
  ["history"],
  ["stats"],
  ["streak"],
  ["analytics"],
  ["calendar"],
  ["achievements"],
] as const

function invalidateDateDependentQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: moodKeys.all }),
    ...dateDependentQueries.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
  ])
}

export function useMoodEntries() {
  return useQuery({ queryKey: moodKeys.all, queryFn: fetchMoodEntries })
}

export function useCreateMoodEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMoodEntry,
    onMutate: async (newEntry) => {
      await queryClient.cancelQueries({ queryKey: moodKeys.all })
      const previous = queryClient.getQueryData<MoodEntry[]>(moodKeys.all)
      const timestamp = new Date().toISOString()

      queryClient.setQueryData<MoodEntry[]>(moodKeys.all, (old) => {
        const optimisticEntry: MoodEntry = {
          id: `temp-${crypto.randomUUID()}`,
          userId: "",
          ...newEntry,
          date: parseDateOnly(newEntry.localDate).toISOString(),
          activities: newEntry.activities ?? [],
          weather: newEntry.weather ?? null,
          sleepHours: newEntry.sleepHours ?? null,
          sleepQuality: newEntry.sleepQuality ?? null,
          energyLevel: newEntry.energyLevel ?? null,
          stressLevel: newEntry.stressLevel ?? null,
          reflection1: newEntry.reflection1 ?? null,
          reflection2: newEntry.reflection2 ?? null,
          reflection3: newEntry.reflection3 ?? null,
          reflection4: newEntry.reflection4 ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        return old ? [optimisticEntry, ...old] : [optimisticEntry]
      })
      return { previous }
    },
    onError: (_error, _newEntry, context) => {
      if (context?.previous) queryClient.setQueryData(moodKeys.all, context.previous)
    },
    onSettled: () => invalidateDateDependentQueries(queryClient),
  })
}

export function useUpdateMoodEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMoodEntryInput }) => updateMoodEntry(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: moodKeys.all })
      const previous = queryClient.getQueryData<MoodEntry[]>(moodKeys.all)
      queryClient.setQueryData<MoodEntry[]>(moodKeys.all, (old) =>
        old?.map((entry) => entry.id === id
          ? { ...entry, ...data, date: parseDateOnly(data.localDate).toISOString() }
          : entry
        )
      )
      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(moodKeys.all, context.previous)
    },
    onSettled: () => invalidateDateDependentQueries(queryClient),
  })
}

export function useDeleteMoodEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMoodEntry,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: moodKeys.all })
      const previous = queryClient.getQueryData<MoodEntry[]>(moodKeys.all)
      queryClient.setQueryData<MoodEntry[]>(moodKeys.all, (old) => old?.filter((entry) => entry.id !== id))
      return { previous }
    },
    onError: (_error, _id, context) => {
      if (context?.previous) queryClient.setQueryData(moodKeys.all, context.previous)
    },
    onSettled: () => invalidateDateDependentQueries(queryClient),
  })
}
