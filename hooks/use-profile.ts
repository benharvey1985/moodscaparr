"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchProfile, updateProfile, exportData, importData } from "@/lib/api/profile"
import type { UpdateProfileInput } from "@/lib/api/profile"

export const profileKeys = {
  profile: ["profile"] as const,
}

const dateDependentQueries = [
  ["mood-entries"],
  ["history"],
  ["stats"],
  ["streak"],
  ["analytics"],
  ["calendar"],
  ["achievements"],
] as const

function invalidateDateDependentQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all(
    dateDependentQueries.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    )
  )
}

export function useProfile() {
  return useQuery({
    queryKey: profileKeys.profile,
    queryFn: fetchProfile,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => updateProfile(data),
    onSuccess: async (data, variables) => {
      queryClient.setQueryData(profileKeys.profile, data)
      if (variables.timezone !== undefined) {
        await invalidateDateDependentQueries(queryClient)
      }
    },
  })
}

export function useExportData() {
  return useMutation({ mutationFn: exportData })
}

export function useImportData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => importData(file),
    onSuccess: async () => {
      await invalidateDateDependentQueries(queryClient)
    },
  })
}
