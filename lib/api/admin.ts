export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalEntries: number
  avgStreak: number
  registrationTrend: Array<{ month: string; count: number }>
  moodDistribution: { POSITIVE: number; NEUTRAL: number; NEGATIVE: number }
}

export interface AdminUser {
  id: string
  name: string | null
  email: string
  role: string
  banned: boolean
  entryCount: number
  lastEntryDate: string | null
  createdAt: string
}

export interface AdminUserList {
  users: AdminUser[]
  total: number
  page: number
  limit: number
}

export interface SsoProviderConfig {
  provider: string
  enabled: boolean
}

export interface InviteCodeData {
  id: string
  code: string
  maxUses: number
  uses: number
  expiresAt: string
  createdBy: string
  active: boolean
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch("/api/admin/stats", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch admin stats")
  return res.json()
}

export async function fetchAdminUsers(params: {
  q?: string
  role?: string
  page?: number
  limit?: number
}): Promise<AdminUserList> {
  const sp = new URLSearchParams()
  if (params.q) sp.set("q", params.q)
  if (params.role) sp.set("role", params.role)
  if (params.page) sp.set("page", String(params.page))
  if (params.limit) sp.set("limit", String(params.limit))
  const res = await fetch(`/api/admin/users?${sp.toString()}`, { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch users")
  return res.json()
}

export async function updateUser(
  id: string,
  data: { role?: string; banned?: boolean }
): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update user")
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to delete user")
}

export async function fetchSSOConfig(): Promise<SsoProviderConfig[]> {
  const res = await fetch("/api/admin/sso", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch SSO config")
  return res.json()
}

export async function toggleSSO(provider: string, enabled: boolean): Promise<void> {
  const res = await fetch("/api/admin/sso", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ provider, enabled }),
  })
  if (!res.ok) throw new Error("Failed to update SSO config")
}

export async function fetchInviteCodes(): Promise<InviteCodeData[]> {
  const res = await fetch("/api/admin/invite-codes", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch invite codes")
  return res.json()
}

export async function generateInviteCode(data: {
  maxUses: number
  expiresAt: string
}): Promise<InviteCodeData> {
  const res = await fetch("/api/admin/invite-codes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to generate invite code")
  return res.json()
}

export async function revokeInviteCode(id: string): Promise<void> {
  const res = await fetch(`/api/admin/invite-codes/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to revoke invite code")
}

export interface AppSettingData {
  key: string
  value: string | null
}

export async function fetchSetting(key: string): Promise<AppSettingData> {
  const res = await fetch(`/api/admin/settings/${key}`, { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch setting")
  return res.json()
}

export async function updateSetting(key: string, value: string): Promise<AppSettingData> {
  const res = await fetch(`/api/admin/settings/${key}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ value }),
  })
  if (!res.ok) throw new Error("Failed to update setting")
  return res.json()
}
