"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { submitFeedback } from "@/lib/api/feedback"
import { useToast } from "@/components/ui/toaster"

const tabs = ["Bug Report", "Feature Suggestion"] as const

const severityOptions = ["Low", "Medium", "High", "Critical"]
const categoryOptions = ["UI/UX", "Performance", "New Feature", "Other"]

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { addToast } = useToast()
  const [tab, setTab] = useState<0 | 1>(0)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("Medium")
  const [category, setCategory] = useState("UI/UX")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return

    setSubmitting(true)
    try {
      const data = tab === 0
        ? { type: "bug" as const, title, description, severity }
        : { type: "feature" as const, title, description, category }

      const res = await submitFeedback(data)

      const stored = localStorage.getItem("moodscaparr-feedback-history")
      const existing: Array<{ id: string; title: string; type: string; date: string; status: string; url?: string }> = stored ? JSON.parse(stored) : []
      existing.unshift({
        id: res.id,
        title,
        type: data.type,
        date: new Date().toISOString().split("T")[0],
        status: res.url ? "submitted" : "pending",
        url: res.url || undefined,
      })
      localStorage.setItem("moodscaparr-feedback-history", JSON.stringify(existing))

      if (res.url) {
        window.open(res.url, "_blank", "noopener,noreferrer")
      }
      addToast({ message: res.message, variant: "success" })
      setTitle("")
      setDescription("")
      setSeverity("Medium")
      setCategory("UI/UX")
      onOpenChange(false)
    } catch {
      addToast({ message: "Failed to submit feedback", variant: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve Moodscaparr by reporting a bug or suggesting a feature.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i as 0 | 1)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                tab === i ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-title">Title</Label>
            <Input
              id="feedback-title"
              placeholder="Brief title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          {tab === 0 ? (
            <div className="space-y-2">
              <Label htmlFor="feedback-severity">Severity</Label>
              <Select
                id="feedback-severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                {severityOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </Select>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="feedback-category">Category</Label>
              <Select
                id="feedback-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="feedback-description">Description</Label>
            <Textarea
              id="feedback-description"
              placeholder="Describe your issue or suggestion..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || !description.trim() || submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { FeedbackDialog }
