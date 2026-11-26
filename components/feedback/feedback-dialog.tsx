"use client"

import { useEffect, useId, useRef, useState, type FormEvent } from "react"
import { ExternalLink } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { submitFeedback } from "@/lib/api/feedback"
import { useToast } from "@/components/ui/toaster"

const tabs = ["Bug Report", "Feature Suggestion"] as const
const severityOptions = ["Low", "Medium", "High", "Critical"]
const categoryOptions = ["UI/UX", "Performance", "New Feature", "Other"]
const HISTORY_PREFIX = "moodscaparr-feedback-history:"
const DRAFT_PREFIX = "moodscaparr-feedback-draft:"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface FeedbackHistoryItem {
  id: string
  title: string
  type: "bug" | "feature"
  date: string
  status: "pending" | "submitted"
  url?: string
}

interface FeedbackDraft {
  tab: 0 | 1
  title: string
  description: string
  severity: string
  category: string
}

const emptyDraft: FeedbackDraft = {
  tab: 0,
  title: "",
  description: "",
  severity: "Medium",
  category: "UI/UX",
}

function isGithubUrl(value: unknown): value is string {
  if (typeof value !== "string") return false
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname === "github.com"
  } catch {
    return false
  }
}

function isHistoryItem(value: unknown): value is FeedbackHistoryItem {
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

function readHistory(userId: string): FeedbackHistoryItem[] {
  try {
    const stored = window.localStorage.getItem(`${HISTORY_PREFIX}${userId}`)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed.filter(isHistoryItem) : []
  } catch {
    return []
  }
}

function writeHistory(userId: string, items: FeedbackHistoryItem[]): boolean {
  try {
    window.localStorage.setItem(`${HISTORY_PREFIX}${userId}`, JSON.stringify(items))
    return true
  } catch {
    return false
  }
}

function readDraft(userId: string): FeedbackDraft | null {
  try {
    const stored = window.localStorage.getItem(`${DRAFT_PREFIX}${userId}`)
    if (!stored) return null
    const parsed: unknown = JSON.parse(stored)
    if (typeof parsed !== "object" || parsed === null) return null
    const draft = parsed as Record<string, unknown>
    if (
      (draft.tab !== 0 && draft.tab !== 1) ||
      typeof draft.title !== "string" ||
      typeof draft.description !== "string" ||
      typeof draft.severity !== "string" ||
      typeof draft.category !== "string"
    ) {
      return null
    }
    return {
      tab: draft.tab,
      title: draft.title,
      description: draft.description,
      severity: severityOptions.includes(draft.severity) ? draft.severity : "Medium",
      category: categoryOptions.includes(draft.category) ? draft.category : "UI/UX",
    }
  } catch {
    return null
  }
}

function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const { addToast } = useToast()
  const { data: session } = authClient.useSession()
  const userId = session?.user.id
  const id = useId()
  const formId = `${id}-form`
  const [tab, setTab] = useState<0 | 1>(0)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState("Medium")
  const [category, setCategory] = useState("UI/UX")
  const [submitting, setSubmitting] = useState(false)
  const [prepared, setPrepared] = useState<{ id: string; url: string } | null>(null)
  const [popupBlocked, setPopupBlocked] = useState(false)
  const [storageWarning, setStorageWarning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const draftHydrated = useRef(false)

  useEffect(() => {
    if (!open || !userId) {
      draftHydrated.current = false
      return
    }

    let active = true
    const timeoutId = window.setTimeout(() => {
      if (!active) return
      const draft = readDraft(userId) ?? emptyDraft
      setTab(draft.tab)
      setTitle(draft.title)
      setDescription(draft.description)
      setSeverity(draft.severity)
      setCategory(draft.category)
      setPrepared(null)
      setPopupBlocked(false)
      setStorageWarning(false)
      setError(null)
      draftHydrated.current = true
    }, 0)

    return () => {
      active = false
      window.clearTimeout(timeoutId)
    }
  }, [open, userId])

  useEffect(() => {
    if (!open || !userId || !draftHydrated.current) return

    const timeoutId = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          `${DRAFT_PREFIX}${userId}`,
          JSON.stringify({ tab, title, description, severity, category })
        )
      } catch {
        // The form remains usable when browser storage is unavailable.
      }
    }, 150)

    return () => window.clearTimeout(timeoutId)
  }, [open, userId, tab, title, description, severity, category])

  function handleOpenChange(nextOpen: boolean) {
    if (submitting) return
    onOpenChange(nextOpen)
    if (!nextOpen) {
      setPrepared(null)
      setPopupBlocked(false)
      setStorageWarning(false)
      setError(null)
    }
  }

  function clearStoredDraft() {
    draftHydrated.current = false
    if (!userId) return
    try {
      window.localStorage.removeItem(`${DRAFT_PREFIX}${userId}`)
    } catch {
      // History and the visible fallback link still work without local storage.
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return
    if (!userId) {
      setError("Your session is unavailable. Refresh and sign in again.")
      return
    }
    if (!title.trim() || !description.trim()) return

    setSubmitting(true)
    setError(null)
    try {
      const data = tab === 0
        ? { type: "bug" as const, title: title.trim(), description: description.trim(), severity }
        : { type: "feature" as const, title: title.trim(), description: description.trim(), category }

      const response = await submitFeedback(data)
      if (!isGithubUrl(response.url)) {
        setError("Feedback delivery is not configured. Contact the instance administrator and retry.")
        return
      }

      const item: FeedbackHistoryItem = {
        id: typeof response.id === "string" ? response.id : crypto.randomUUID(),
        title: data.title,
        type: data.type,
        date: new Date().toISOString().slice(0, 10),
        status: "pending",
        url: response.url,
      }
      const saved = writeHistory(userId, [item, ...readHistory(userId)])
      setStorageWarning(!saved)
      clearStoredDraft()
      setPrepared({ id: item.id, url: response.url })
      setPopupBlocked(false)

      let popup: Window | null = null
      try {
        popup = window.open(response.url, "_blank")
        if (popup) popup.opener = null
      } catch {
        popup = null
      }
      setPopupBlocked(!popup)
      addToast({ message: "GitHub draft ready. Submit it on GitHub to create an issue." })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not prepare the GitHub draft. Please retry.")
    } finally {
      setSubmitting(false)
    }
  }

  function handleConfirm() {
    if (!prepared || !userId) return
    const existing = readHistory(userId)
    const target = existing.find((item) => item.id === prepared.id)
    if (!target) {
      setError("This pending draft is not in local history. Keep this tab open and use the GitHub link.")
      return
    }

    const updated = existing.map((item) =>
      item.id === prepared.id ? { ...item, status: "submitted" as const } : item
    )
    if (!writeHistory(userId, updated)) {
      setError("Could not save your confirmation in this browser. The GitHub draft is still available.")
      return
    }

    addToast({ message: "Feedback marked as confirmed.", variant: "success" })
    handleOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={!submitting}>
        <DialogHeader>
          <DialogTitle>{prepared ? "GitHub draft ready" : "Send Feedback"}</DialogTitle>
          <DialogDescription>
            {prepared
              ? "No issue has been created yet. Review the draft on GitHub and submit it there."
              : "Prepare a bug report or feature suggestion as a GitHub draft. You choose whether to submit it on GitHub."}
          </DialogDescription>
        </DialogHeader>

        {prepared ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <p className="text-sm font-medium">Your feedback is saved as pending until you confirm it.</p>
            <a
              href={prepared.url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ className: "w-full" })}
            >
              Continue to GitHub
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
            {popupBlocked && (
              <p role="alert" className="text-sm text-destructive">
                Your browser blocked the new tab. Use the <a href={prepared.url} target="_blank" rel="noopener noreferrer" className="underline">GitHub draft fallback link</a>.
              </p>
            )}
            {storageWarning && (
              <p role="status" className="text-xs text-muted-foreground">
                Browser storage is unavailable, so this draft will not appear in Feedback History. Keep this tab open.
              </p>
            )}
          </div>
        ) : (
          <form id={formId} noValidate onSubmit={handleSubmit} className="space-y-4" aria-busy={submitting}>
            <div className="flex gap-1 rounded-lg bg-muted p-1" role="group" aria-label="Feedback type">
              {tabs.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={tab === index}
                  onClick={() => setTab(index as 0 | 1)}
                  className={`min-h-11 flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                    tab === index ? "bg-background text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-title`}>Title</Label>
              <Input
                id={`${id}-title`}
                placeholder="Brief title..."
                maxLength={200}
                required
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
            {tab === 0 ? (
              <div className="space-y-2">
                <Label htmlFor={`${id}-severity`}>Severity</Label>
                <Select
                  id={`${id}-severity`}
                  className="h-11 lg:h-8"
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value)}
                >
                  {severityOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor={`${id}-category`}>Category</Label>
                <Select
                  id={`${id}-category`}
                  className="h-11 lg:h-8"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor={`${id}-description`}>Description</Label>
              <Textarea
                id={`${id}-description`}
                placeholder="Describe your issue or suggestion..."
                maxLength={5000}
                required
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </form>
        )}

        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap justify-end gap-2">
          {prepared ? (
            <>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Not now
              </Button>
              <Button type="button" onClick={handleConfirm}>
                I submitted it on GitHub
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" disabled={submitting} onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                form={formId}
                disabled={!userId || !title.trim() || !description.trim() || submitting}
              >
                {submitting ? "Preparing..." : "Continue to GitHub"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { FeedbackDialog }
