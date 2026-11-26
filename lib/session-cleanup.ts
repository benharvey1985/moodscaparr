import { getQueryClient } from "./query-client"

const LEGACY_USER_DATA_KEYS = new Set([
  "mood-draft",
  "moodscaparr-feedback-history",
  "moodscaparr-feedback-draft",
])

const SCOPED_USER_DATA_PREFIXES = [
  "mood-draft:",
  "moodscaparr-feedback-history:",
  "moodscaparr-feedback-draft:",
  "feedback:",
]

export function shouldClearUserDataKey(key: string, userId?: string): boolean {
  if (LEGACY_USER_DATA_KEYS.has(key)) return true
  if (userId) {
    return SCOPED_USER_DATA_PREFIXES.some((prefix) => key === `${prefix}${userId}`)
  }
  return SCOPED_USER_DATA_PREFIXES.some((prefix) => key.startsWith(prefix))
}

function clearStoredUserData(userId?: string): void {
  if (typeof window === "undefined") return

  for (const storageName of ["localStorage", "sessionStorage"] as const) {
    try {
      const storage = window[storageName]
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
      for (const key of keys) {
        if (key && shouldClearUserDataKey(key, userId)) storage.removeItem(key)
      }
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  }
}

export function clearUserScopedData(userId?: string): void {
  if (typeof window === "undefined") return

  const queryClient = getQueryClient()
  void queryClient.cancelQueries().catch(() => {
    // Cache clearing below still removes all user-scoped query state.
  })
  queryClient.clear()
  clearStoredUserData(userId)
}

export function clearLegacyUserData(): void {
  // Account changes clear every scoped key too, so a previous user's draft cannot
  // be hydrated by the next account even if its user id is no longer known.
  clearUserScopedData()
}
