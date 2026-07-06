export interface FeedbackInput {
  type: "bug" | "feature"
  title: string
  description: string
  severity?: string
  category?: string
}

export interface FeedbackResponse {
  url: string | null
  id: string
  message: string
}

export async function submitFeedback(data: FeedbackInput): Promise<FeedbackResponse> {
  const res = await fetch("/api/feedback", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to submit feedback")
  }
  return res.json()
}
