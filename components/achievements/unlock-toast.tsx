"use client"

import confetti from "canvas-confetti"
import { useToast } from "@/components/ui/toaster"
import { getDefinition } from "@/types/achievements"

export function useUnlockToast() {
  const { addToast } = useToast()

  function showUnlock(badgeId: string) {
    const definition = getDefinition(badgeId)
    const title = definition?.title ?? badgeId
    addToast({ message: `🏆 New Achievement! ${title}` })

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      disableForReducedMotion: true,
    })
  }

  function showUnlocks(badgeIds: string[]) {
    badgeIds.forEach((id) => showUnlock(id))
  }

  return { showUnlock, showUnlocks }
}
