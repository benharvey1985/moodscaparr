"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { MOODS, type MoodCategory } from "@/types/mood"
import { useCreateMoodEntry } from "@/hooks/use-mood-entry"
import { useProfile } from "@/hooks/use-profile"
import { MoodApiError } from "@/lib/api/mood-entries"
import { createMoodEntrySchema } from "@/lib/mood-validation"
import { isValidTimeZone, todayInTimeZone } from "@/lib/dates"
import { useToast } from "@/components/ui/toaster"
import { useUnlockToast } from "@/components/achievements/unlock-toast"
import { cn } from "@/lib/utils"

const categories: { key: MoodCategory; label: string; emoji: string; cls: string }[] = [
  { key: "POSITIVE", label: "Positive", emoji: "😊", cls: "bg-mood-positive-light hover:bg-mood-positive-medium/30" },
  { key: "NEUTRAL", label: "Neutral", emoji: "🧘", cls: "bg-mood-neutral-light hover:bg-mood-neutral-medium/30" },
  { key: "NEGATIVE", label: "Negative", emoji: "😢", cls: "bg-mood-negative-light hover:bg-mood-negative-medium/30" },
]

interface FailedSelection {
  category: MoodCategory
  moodIndex: number
}

export function QuickLog() {
  const [selectedCategory, setSelectedCategory] = useState<MoodCategory | null>(null)
  const [failure, setFailure] = useState<{ message: string; existingId?: string; selection?: FailedSelection } | null>(null)
  const pendingRef = useRef(false)
  const createMutation = useCreateMoodEntry()
  const profile = useProfile()
  const { addToast } = useToast()
  const { showUnlocks } = useUnlockToast()

  const timezone = profile.data?.profile?.timezone ?? "UTC"
  const validTimezone = isValidTimeZone(timezone)
  const today = validTimezone ? todayInTimeZone(timezone) : null
  const isPending = createMutation.isPending

  async function handleMoodClick(selection?: FailedSelection) {
    const chosen = selection ?? (
      selectedCategory
        ? { category: selectedCategory, moodIndex: -1 }
        : null
    )
    if (!chosen || chosen.moodIndex < 0 || !today || pendingRef.current || isPending) return

    const parsed = createMoodEntrySchema.safeParse({
      ...chosen,
      intensity: 5,
      localDate: today,
      activities: [],
    })
    if (!parsed.success) {
      setFailure({ message: "Choose a valid mood before saving.", selection: chosen })
      return
    }

    pendingRef.current = true
    setFailure(null)
    try {
      const result = await createMutation.mutateAsync(parsed.data)
      setSelectedCategory(null)
      if (result.newlyUnlocked?.length) {
        showUnlocks(result.newlyUnlocked.map((unlock) => unlock.badgeId))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save your mood"
      const existingId = error instanceof MoodApiError ? error.existingId : undefined
      setFailure({ message, existingId, selection: chosen })
      addToast({ message, variant: "error" })
    } finally {
      pendingRef.current = false
    }
  }

  function retry() {
    if (failure?.selection) void handleMoodClick(failure.selection)
  }

  if (profile.isError) {
    return (
      <div className="space-y-2 text-center" role="alert">
        <p className="text-sm text-destructive">Couldn&apos;t load your timezone.</p>
        <button type="button" onClick={() => profile.refetch()} className="text-sm underline">
          Retry
        </button>
      </div>
    )
  }

  if (profile.isLoading || !today) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">
          {profile.isLoading ? "Loading your local date..." : "Your saved timezone is invalid. Update it in profile settings."}
        </p>
        {!profile.isLoading && <Link href="/settings" className="text-sm underline">Open profile settings</Link>}
      </div>
    )
  }

  if (selectedCategory) {
    const moods = MOODS[selectedCategory]
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => { setSelectedCategory(null); setFailure(null) }}
          disabled={isPending}
          className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          &larr; Back to categories
        </button>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {moods.map((mood, moodIndex) => (
            <button
              key={`${selectedCategory}-${moodIndex}`}
              type="button"
              onClick={() => void handleMoodClick({ category: selectedCategory, moodIndex })}
              disabled={isPending}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-xl bg-mood-neutral-light p-3 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          {isPending ? "Saving..." : `Logging for ${today}`}
        </p>
        {failure && (
          <div role="alert" className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">{failure.message}</p>
            <div className="flex gap-3 text-sm">
              {failure.selection && (
                <button type="button" onClick={retry} disabled={isPending} className="underline">Retry</button>
              )}
              {failure.existingId && (
                <Link href={`/wizard?id=${encodeURIComponent(failure.existingId)}`} className="underline">
                  Edit existing entry
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {categories.map((category) => (
        <button
          key={category.key}
          type="button"
          onClick={() => { setSelectedCategory(category.key); setFailure(null) }}
          disabled={isPending}
          className={cn(
            "flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl p-3 text-sm font-medium transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50",
            category.cls
          )}
        >
          <span className="text-lg">{category.emoji}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  )
}
