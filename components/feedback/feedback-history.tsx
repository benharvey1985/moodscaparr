"use client"

import { useState, useEffect } from "react"
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

const STORAGE_KEY = "moodscaparr-feedback-history"

function FeedbackHistory({ open, onOpenChange }: FeedbackHistoryProps) {
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    if (open) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setItems(JSON.parse(stored))
        } catch {
          setItems([])
        }
      }
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Feedback History</DialogTitle>
          <DialogDescription>Your previously submitted feedback.</DialogDescription>
        </DialogHeader>
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No feedback submitted yet</p>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type === "bug" ? "Bug Report" : "Feature Suggestion"} &middot; {item.date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    item.status === "submitted" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}>
                    {item.status}
                  </span>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export { FeedbackHistory }
