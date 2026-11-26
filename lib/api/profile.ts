import { moodImportFileSchema, type MoodImportEntry } from "@/lib/mood-validation"

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

export interface ImportResult {
  imported: number
  skipped: number
  conflicts: number
}

export interface ImportPreview {
  version: "1.0" | "2.0"
  entries: MoodImportEntry[]
}

export class ProfileApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ProfileApiError"
    this.status = status
  }
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null)
  if (typeof body?.error === "string") return body.error
  return fallback
}

export async function fetchProfile(): Promise<ProfileData> {
  const response = await fetch("/api/user/profile", { credentials: "include" })
  if (!response.ok) {
    throw new ProfileApiError(await errorMessage(response, "Failed to fetch profile"), response.status)
  }
  return response.json()
}

export async function updateProfile(data: UpdateProfileInput): Promise<ProfileData> {
  const response = await fetch("/api/user/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    throw new ProfileApiError(await errorMessage(response, "Failed to update profile"), response.status)
  }
  // The profile endpoint returns the updated profile only; reload the combined shape.
  return fetchProfile()
}

export async function previewImportFile(file: File): Promise<ImportPreview> {
  let json: unknown
  try {
    json = JSON.parse(await file.text())
  } catch {
    throw new Error("Could not parse the JSON export file")
  }

  const parsed = moodImportFileSchema.safeParse(json)
  if (!parsed.success) {
    throw new Error("Invalid export file: expected version 1.0 or 2.0 with a valid entries array")
  }
  return { version: parsed.data.version, entries: parsed.data.data.entries }
}

export async function exportData(): Promise<Blob> {
  const response = await fetch("/api/user/export", { credentials: "include" })
  if (!response.ok) {
    throw new ProfileApiError(await errorMessage(response, "Failed to export data"), response.status)
  }
  return response.blob()
}

export async function importData(file: File): Promise<ImportResult> {
  const preview = await previewImportFile(file)
  const totals: ImportResult = { imported: 0, skipped: 0, conflicts: 0 }

  for (let offset = 0; offset < preview.entries.length; offset += 500) {
    const entries = preview.entries.slice(offset, offset + 500)
    const response = await fetch("/api/user/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ version: preview.version, data: { entries } }),
    })
    if (!response.ok) {
      throw new ProfileApiError(await errorMessage(response, "Failed to import data"), response.status)
    }

    const result = (await response.json()) as ImportResult
    totals.imported += result.imported
    totals.skipped += result.skipped
    totals.conflicts += result.conflicts
  }

  return totals
}
