"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchProfile, updateProfile, exportData, importData } from "@/lib/api/profile"
import type { UpdateProfileInput } from "@/lib/api/profile"

export const profileKeys = {
  profile: ["profile"] as const,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile })
    },
  })
}

export function useExportData() {
  return useMutation({
    mutationFn: exportData,
  })
}

export function useImportData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => importData(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mood-entries"] })
    },
  })
}
