"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { PASSWORD_RESET_REQUEST_MESSAGE } from "@/lib/password-reset-copy"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email"),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type EmailSchema = z.infer<typeof emailSchema>
type PasswordSchema = z.infer<typeof passwordSchema>

class ResetRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ResetRequestError"
  }
}

function PasswordInput({
  id,
  autoComplete = "new-password",
  error,
  describedBy,
  ...props
}: React.ComponentProps<"input"> & {
  id: string
  error?: boolean
  describedBy?: string
}) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        aria-invalid={error}
        aria-describedby={describedBy}
        className="pr-11"
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-1 -translate-y-1/2"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  )
}

function RequestResetForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  })

  async function onSubmit(data: EmailSchema) {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }),
      })
      const body = (await response.json().catch(() => null)) as {
        error?: unknown
        status?: unknown
      } | null

      if (!response.ok) {
        throw new ResetRequestError(
          typeof body?.error === "string"
            ? body.error
            : `Password reset request failed (HTTP ${response.status}).`
        )
      }
      if (body?.status !== true) {
        throw new ResetRequestError("Password reset request was not confirmed. Please retry.")
      }

      setSubmitted(true)
    } catch (cause) {
      setError(
        cause instanceof ResetRequestError
          ? cause.message
          : "Could not reach the password reset service. Check your connection and retry."
      )
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="space-y-4 text-center" role="status">
        <p className="text-muted-foreground">
          Your request has been received. {PASSWORD_RESET_REQUEST_MESSAGE}
        </p>
        <Link href="/auth/login" className="text-sm text-muted-foreground hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Enter your email to request password recovery.
      </p>

      <div className="space-y-2">
        <Label htmlFor="reset-email">Email</Label>
        <Input
          id="reset-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "reset-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="reset-email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
        {loading ? "Sending..." : "Send Reset Link"}
      </Button>

      <p className="text-center text-sm">
        <Link href="/auth/login" className="text-muted-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  )
}

function CompleteResetForm({ token }: { token: string }) {
  const [complete, setComplete] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  })

  async function onSubmit(data: PasswordSchema) {
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      })
      if (authError) throw new Error(authError.message || "Unable to reset password")
      setComplete(true)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? `${cause.message}. If the link expired, request a new one. For network errors, retry.`
          : "Unable to reset password. Check your connection and retry."
      )
    } finally {
      setLoading(false)
    }
  }

  if (complete) {
    return (
      <div className="space-y-4 text-center" role="status">
        <p className="text-muted-foreground">
          Your password has been reset. Existing sessions have been signed out.
        </p>
        <Link href="/auth/login" className="text-sm text-muted-foreground hover:underline">
          Sign in with your new password
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">Choose a new password for your account.</p>

      <div className="space-y-2">
        <Label htmlFor="new-password">New Password</Label>
        <PasswordInput
          id="new-password"
          error={Boolean(errors.password)}
          describedBy={errors.password ? "new-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="new-password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
        <PasswordInput
          id="confirm-new-password"
          error={Boolean(errors.confirmPassword)}
          describedBy={errors.confirmPassword ? "confirm-new-password-error" : undefined}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p id="confirm-new-password-error" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
        {loading ? "Resetting..." : "Reset Password"}
      </Button>

      <p className="text-center text-sm">
        <Link href="/auth/reset-password" className="text-muted-foreground hover:underline">
          Request a new link
        </Link>
      </p>
    </form>
  )
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = use(searchParams)
  const token = Array.isArray(params.token) ? params.token[0] : params.token
  const resetError = Array.isArray(params.error) ? params.error[0] : params.error

  return (
    <ErrorBoundary>
      {token ? (
        <CompleteResetForm token={token} />
      ) : resetError === "INVALID_TOKEN" ? (
        <div className="space-y-4">
          <p role="alert" className="text-sm text-destructive">
            This password reset link is invalid or expired. Request a new link to continue.
          </p>
          <Link href="/auth/reset-password" className="text-sm text-muted-foreground hover:underline">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <RequestResetForm />
      )}
    </ErrorBoundary>
  )
}
