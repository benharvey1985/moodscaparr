import type { MoodEntry } from "@/types/mood"

export interface SearchParams {
  q?: string
  category?: string
  page?: number
  limit?: number
}

export interface SearchResult {
  entries: MoodEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function searchEntries(params: SearchParams): Promise<SearchResult> {
  const sp = new URLSearchParams()
  if (params.q) sp.set("q", params.q)
  if (params.category) sp.set("category", params.category)
  if (params.page) sp.set("page", String(params.page))
  if (params.limit) sp.set("limit", String(params.limit))

  const res = await fetch(`/api/mood-entries/search?${sp.toString()}`, {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to search entries")
  return res.json()
}

export async function fetchAllEntries(): Promise<MoodEntry[]> {
  const res = await fetch("/api/mood-entries?limit=1000", {
    credentials: "include",
  })
  if (!res.ok) throw new Error("Failed to fetch entries")
  return res.json()
}
