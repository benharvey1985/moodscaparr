"use client"

import { useEffect } from "react"
import confetti from "canvas-confetti"
import { useToast } from "@/components/ui/toaster"
import { getDefinition } from "@/types/achievements"

interface UnlockToastProps {
  badgeIds: string[]
}

export function useUnlockToast() {
  const { addToast } = useToast()

  function showUnlock(badgeId: string) {
    const def = getDefinition(badgeId)
    const title = def?.title ?? badgeId
    addToast({ message: `🏆 New Achievement! ${title}` })

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }

  function showUnlocks(badgeIds: string[]) {
    badgeIds.forEach((id) => showUnlock(id))
  }

  return { showUnlock, showUnlocks }
}
