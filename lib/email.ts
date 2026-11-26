import "server-only"
import { recordPasswordResetDelivery } from "./password-reset-health"

interface PasswordResetEmail {
  email: string
  name?: string | null
  resetUrl: string
}

class PasswordResetDeliveryError extends Error {
  constructor(readonly providerStatus: number) {
    super(`Password reset email delivery failed (Resend status ${providerStatus}). Please retry.`)
    this.name = "PasswordResetDeliveryError"
  }
}

function getConfiguration(): { apiKey: string; from: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.EMAIL_FROM?.trim()

  if (!apiKey || !from) {
    throw new Error(
      "Password reset email is not configured. Set RESEND_API_KEY and EMAIL_FROM before enabling password recovery."
    )
  }

  return { apiKey, from }
}

export function assertPasswordResetConfigured(): void {
  getConfiguration()
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: PasswordResetEmail): Promise<void> {
  try {
    const { apiKey, from } = getConfiguration()
    const parsedUrl = new URL(resetUrl)
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new Error("Password reset email URL must use HTTP or HTTPS")
    }

    const safeUrl = escapeHtml(resetUrl)
    const greeting = name?.trim() ? `Hi ${escapeHtml(name.trim())},` : "Hi,"

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Reset your Moodscaparr password",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17202a">
            <p>${greeting}</p>
            <p>We received a request to reset your Moodscaparr password.</p>
            <p><a href="${safeUrl}" style="display:inline-block;padding:10px 16px;background:#4f46e5;color:#ffffff;text-decoration:none;border-radius:6px">Reset password</a></p>
            <p>This link expires in one hour. If you did not request it, you can ignore this email.</p>
          </div>
        `.trim(),
        text: `${greeting}\n\nReset your Moodscaparr password using this link:\n${resetUrl}\n\nThe link expires in one hour. If you did not request it, you can ignore this email.`,
      }),
      signal: AbortSignal.timeout(10_000),
    })

    if (!response.ok) throw new PasswordResetDeliveryError(response.status)
  } catch (error) {
    await recordPasswordResetDelivery({
      ok: false,
      providerStatus: error instanceof PasswordResetDeliveryError ? error.providerStatus : undefined,
    })
    throw error
  }

  await recordPasswordResetDelivery({ ok: true })
}
