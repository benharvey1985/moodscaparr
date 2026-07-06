export interface ProfileData {
  user: {
    id: string
    name: string | null
    email: string
    role: string
    image: string | null
    createdAt: string
  }
  profile: {
    id: string
    name: string | null
    country: string | null
    timezone: string
    streakGoal: number
    onboardingComplete: boolean
  } | null
}

export interface UpdateProfileInput {
  name?: string
  country?: string
  timezone?: string
  streakGoal?: number
}

export async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch("/api/user/profile", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch profile")
  return res.json()
}

export async function updateProfile(data: UpdateProfileInput): Promise<ProfileData> {
  const res = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update profile")
  return res.json()
}

export async function exportData(): Promise<Blob> {
  const res = await fetch("/api/user/export", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to export data")
  return res.blob()
}

export async function importData(file: File): Promise<{ imported: number; skipped: number }> {
  const text = await file.text()
  const json = JSON.parse(text)
  const res = await fetch("/api/user/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(json),
  })
  if (!res.ok) throw new Error("Failed to import data")
  return res.json()
}
