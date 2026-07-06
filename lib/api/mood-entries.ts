import type { MoodEntry, CreateMoodEntryInput, UpdateMoodEntryInput } from "@/types/mood"

export async function fetchMoodEntries(): Promise<MoodEntry[]> {
  const res = await fetch("/api/mood-entries", { credentials: "include" })
  if (!res.ok) throw new Error("Failed to fetch mood entries")
  return res.json()
}

export interface CreateMoodEntryResponse extends MoodEntry {
  newlyUnlocked?: Array<{ badgeId: string; progress: number }>
}

export async function createMoodEntry(
  data: CreateMoodEntryInput
): Promise<CreateMoodEntryResponse> {
  const res = await fetch("/api/mood-entries", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ? JSON.stringify(err.error) : "Failed to create entry")
  }
  return res.json()
}

export async function updateMoodEntry(
  id: string,
  data: UpdateMoodEntryInput
): Promise<MoodEntry> {
  const res = await fetch(`/api/mood-entries/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ? JSON.stringify(err.error) : "Failed to update entry")
  }
  return res.json()
}

export async function deleteMoodEntry(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/mood-entries/${id}`, {
    method: "DELETE",
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to delete entry")
  return res.json()
}
