import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { z } from "zod"
import { rateLimit } from "@/lib/rate-limit"

const feedbackLimiter = rateLimit({ interval: 60000, max: 5 })

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  severity: z.string().optional(),
  category: z.string().optional(),
})

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rl = feedbackLimiter.check(`feedback:${session.user.id}`)
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests", retryIn: rl.resetIn }, { status: 429 })
  }

  const body = await request.json()
  const parsed = feedbackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { type, title, description, severity, category } = parsed.data
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO

  const labels = type === "bug"
    ? `bug${severity ? `,severity:${severity.toLowerCase()}` : ""}`
    : `enhancement${category ? `,category:${category.toLowerCase().replace(/\s+/g, "-")}` : ""}`

  const sanitizedTitle = title.replace(/[\x00-\x1F]/g, "").slice(0, 200)
  const sanitizedDesc = description.replace(/[\x00-\x1F]/g, "").slice(0, 5000)

  const bodyText = [
    `## ${type === "bug" ? "Bug Report" : "Feature Suggestion"}`,
    "",
    ...(severity ? [`**Severity:** ${severity}`] : []),
    ...(category ? [`**Category:** ${category}`] : []),
    "",
    `**Description:**`,
    sanitizedDesc,
  ].join("\n")

  const id = crypto.randomUUID()

  if (repo) {
    const params = new URLSearchParams({
      title: `[${type === "bug" ? "Bug" : "Feature"}] ${sanitizedTitle}`,
      body: bodyText,
      labels,
    })
    const url = `https://github.com/${repo}/issues/new?${params.toString()}`
    console.log(`[Feedback] Issue URL: ${url}`)
    return NextResponse.json({ url, id, message: "Feedback submitted" })
  }

  console.log(`[Feedback] No GITHUB_REPO configured. Feedback data:`, { type, title: sanitizedTitle })
  return NextResponse.json({ url: null, id, message: "Feedback recorded (GitHub not configured)" })
}
