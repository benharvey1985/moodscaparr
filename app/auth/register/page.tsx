"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { authClient } from "@/lib/auth-client"
import { clearLegacyUserData } from "@/lib/session-cleanup"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirmPassword: z.string(),
    inviteCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type Schema = z.infer<typeof schema>

async function responseError(response: Response, fallback: string): Promise<string> {
  const body = await response.json().catch(() => null)
  return typeof body?.error === "string" ? body.error : fallback
}

function RegisterForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const {
    data: inviteStatus,
    isLoading: checkingStatus,
    isError: statusError,
    error: statusQueryError,
    isFetching: statusFetching,
    refetch: refetchStatus,
  } = useQuery({
    queryKey: ["auth", "invite-status"],
    queryFn: async () => {
      const response = await fetch("/api/auth/invite-status", { cache: "no-store" })
      if (!response.ok) {
        throw new Error(await responseError(response, "Unable to load registration settings"))
      }
      const data = (await response.json()) as { inviteOnly?: unknown }
      if (typeof data.inviteOnly !== "boolean") throw new Error("Invalid registration status")
      return { inviteOnly: data.inviteOnly }
    },
    staleTime: 60_000,
    retry: 1,
  })
  const inviteOnly = inviteStatus?.inviteOnly === true

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", inviteCode: "" },
  })

  async function releaseFailedReservation(email: string, code: string): Promise<string> {
    try {
      const response = await fetch("/api/auth/release-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })
      if (!response.ok) return " The invitation reservation could not be released; retry registration or contact support."
      return ""
    } catch {
      return " The invitation reservation could not be released; check your connection and retry."
    }
  }

  async function onSubmit(data: Schema) {
    setLoading(true)
    setError(null)
    let reservationMade = false

    try {
      if (inviteOnly) {
        const inviteCode = data.inviteCode?.trim() ?? ""
        if (!inviteCode) {
          setFormError("inviteCode", { message: "Invite code is required" })
          return
        }

        const response = await fetch("/api/auth/validate-invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: inviteCode, email: data.email }),
        })
        if (!response.ok) {
          setFormError("root", {
            message: await responseError(response, "Invalid invite code"),
          })
          return
        }
        reservationMade = true
      }

      const { error: authError } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
        callbackURL: "/dashboard",
      })

      if (authError) {
        const releaseWarning = reservationMade
          ? await releaseFailedReservation(data.email, data.inviteCode ?? "")
          : ""
        setFormError("root", {
          message: `${authError.message || "Registration failed"}.${releaseWarning}`,
        })
        return
      }

      clearLegacyUserData()
      router.push("/dashboard")
      router.refresh()
    } catch {
      const releaseWarning =
        reservationMade && data.inviteCode
          ? await releaseFailedReservation(data.email, data.inviteCode)
          : ""
      setError(`Could not reach the registration service. Check your connection and retry.${releaseWarning}`)
    } finally {
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground" role="status">
        Loading registration options...
      </p>
    )
  }

  if (statusError) {
    return (
      <div className="space-y-3 text-center">
        <p role="alert" className="text-sm text-destructive">
          {statusQueryError instanceof Error
            ? `${statusQueryError.message}. Check your connection and retry.`
            : "Unable to load registration settings. Check your connection and retry."}
        </p>
        <Button type="button" variant="outline" disabled={statusFetching} onClick={() => void refetchStatus()}>
          {statusFetching ? "Retrying..." : "Retry"}
        </Button>
        <p className="text-sm">
          <Link href="/auth/login" className="text-muted-foreground hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {inviteOnly && (
        <div className="space-y-2">
          <Label htmlFor="inviteCode">Invite Code</Label>
          <Input
            id="inviteCode"
            autoComplete="off"
            placeholder="Enter your invite code"
            aria-invalid={Boolean(errors.inviteCode)}
            aria-describedby={errors.inviteCode ? "invite-code-error" : undefined}
            {...register("inviteCode")}
          />
          {errors.inviteCode && (
            <p id="invite-code-error" className="text-sm text-destructive">
              {errors.inviteCode.message}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="password-error" className="text-sm text-destructive">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p id="confirm-password-error" className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {(errors.root || error) && (
        <p role="alert" className="text-sm text-destructive">
          {error || errors.root?.message}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
        {loading ? "Creating account..." : "Create Account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/auth/login" className="hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <ErrorBoundary>
      <RegisterForm />
    </ErrorBoundary>
  )
}
