"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  fetchAdminStats,
  fetchAdminUsers,
  updateUser,
  deleteUser,
  fetchSSOConfig,
  toggleSSO,
  fetchInviteCodes,
  generateInviteCode,
  revokeInviteCode,
  fetchSetting,
  updateSetting,
} from "@/lib/api/admin"
import type {
  AdminUserList,
  SsoProviderConfig,
  InviteCodeData,
} from "@/lib/api/admin"

export const adminKeys = {
  stats: ["admin", "stats"] as const,
  users: (params: string) => ["admin", "users", params] as const,
  sso: ["admin", "sso"] as const,
  inviteCodes: ["admin", "invite-codes"] as const,
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: fetchAdminStats,
  })
}

export function useAdminUsers(params: {
  q?: string
  role?: string
  page?: number
  limit?: number
}) {
  const paramStr = JSON.stringify(params)
  return useQuery({
    queryKey: adminKeys.users(paramStr),
    queryFn: () => fetchAdminUsers(params),
  })
}

export function useAdminMutations() {
  const queryClient = useQueryClient()

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { role?: string; banned?: boolean } }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] })
    },
  })

  const toggleSSOMutation = useMutation({
    mutationFn: ({ provider, enabled }: { provider: string; enabled: boolean }) =>
      toggleSSO(provider, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.sso })
    },
  })

  const generateInviteMutation = useMutation({
    mutationFn: (data: { maxUses: number; expiresAt: string }) => generateInviteCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.inviteCodes })
    },
  })

  const revokeInviteMutation = useMutation({
    mutationFn: revokeInviteCode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.inviteCodes })
    },
  })

  return {
    updateUser: updateUserMutation,
    deleteUser: deleteUserMutation,
    toggleSSO: toggleSSOMutation,
    generateInviteCode: generateInviteMutation,
    revokeInviteCode: revokeInviteMutation,
  }
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: ["admin", "settings", key],
    queryFn: () => fetchSetting(key),
  })
}

export function useUpdateSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => updateSetting(key, value),
    onSuccess: (_data, { key }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings", key] })
    },
  })
}

export function useSSOConfig() {
  return useQuery({
    queryKey: adminKeys.sso,
    queryFn: fetchSSOConfig,
  })
}

export function useInviteCodes() {
  return useQuery({
    queryKey: adminKeys.inviteCodes,
    queryFn: fetchInviteCodes,
  })
}
