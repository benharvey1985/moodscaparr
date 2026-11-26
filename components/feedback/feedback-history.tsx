"use client"

import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ExternalLink } from "lucide-react"

interface HistoryItem {
  id: string
  title: string
  type: "bug" | "feature"
  date: string
  status: "pending" | "submitted"
  url?: string
}

interface FeedbackHistoryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STORAGE_PREFIX = "moodscaparr-feedback-history:"

function isGithubUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname === "github.com"
  } catch {
    return false
  }
}

function isHistoryItem(value: unknown): value is HistoryItem {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    (item.type === "bug" || item.type === "feature") &&
    typeof item.date === "string" &&
    (item.status === "pending" || item.status === "submitted") &&
    (item.url === undefined || typeof item.url === "string")
  )
}

function readHistory(userId: string): HistoryItem[] {
  try {
    const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${userId}`)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter(isHistoryItem) : []
  } catch {
    return []
  }
}

function FeedbackHistory({ open, onOpenChange }: FeedbackHistoryProps) {
  const { data: session } = authClient.useSession()
  const userId = session?.user.id
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    if (!open) return

    let active = true
    const timeoutId = window.setTimeout(() => {
      if (!active) return
      setItems(userId ? readHistory(userId) : [])
    }, 0)

    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [open, userId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Feedback History</DialogTitle>
          <DialogDescription>
            GitHub drafts prepared in this browser. Items stay pending until you confirm submission on GitHub.
          </DialogDescription>
        </DialogHeader>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No feedback prepared yet</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type === "bug" ? "Bug Report" : "Feature Suggestion"} &middot; {item.date}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === "submitted"
                      ? "bg-mood-positive-light text-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {item.status === "submitted" ? "Confirmed" : "Pending"}
                  </span>
                  {item.url && isGithubUrl(item.url) && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open GitHub draft for ${item.title}`}
                      className="inline-flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { FeedbackHistory }
