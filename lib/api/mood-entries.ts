import type { MoodEntry, CreateMoodEntryInput, UpdateMoodEntryInput } from "@/types/mood"

export class MoodApiError extends Error {
  status: number
  existingId?: string

  constructor(message: string, status: number, existingId?: string) {
    super(message)
    this.name = "MoodApiError"
    this.status = status
    this.existingId = existingId
  }
}

async function responseError(response: Response, fallback: string): Promise<MoodApiError> {
  const body = await response.json().catch(() => null)
  const message = typeof body?.error === "string"
    ? body.error
    : body?.error
      ? JSON.stringify(body.error)
      : fallback
  return new MoodApiError(message, response.status, body?.existingId)
}

export async function fetchMoodEntries(): Promise<MoodEntry[]> {
  const response = await fetch("/api/mood-entries", { credentials: "include" })
  if (!response.ok) throw await responseError(response, "Failed to fetch mood entries")
  return response.json()
}

export async function fetchMoodEntry(id: string): Promise<MoodEntry> {
  const response = await fetch(`/api/mood-entries/${encodeURIComponent(id)}`, {
    credentials: "include",
  })
  if (!response.ok) throw await responseError(response, "Failed to load entry")
  return response.json()
}

export interface CreateMoodEntryResponse extends MoodEntry {
  newlyUnlocked?: Array<{ badgeId: string; progress: number; isNewlyUnlocked?: boolean }>
}

export async function createMoodEntry(
  data: CreateMoodEntryInput
): Promise<CreateMoodEntryResponse> {
  const response = await fetch("/api/mood-entries", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw await responseError(response, "Failed to create entry")
  return response.json()
}

export async function updateMoodEntry(
  id: string,
  data: UpdateMoodEntryInput
): Promise<MoodEntry> {
  const response = await fetch(`/api/mood-entries/${encodeURIComponent(id)}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw await responseError(response, "Failed to update entry")
  return response.json()
}

export async function deleteMoodEntry(id: string): Promise<{ success: boolean }> {
  const response = await fetch(`/api/mood-entries/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!response.ok) throw await responseError(response, "Failed to delete entry")
  return response.json()
}
