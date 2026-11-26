"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { GitBranch, Globe } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { clearLegacyUserData } from "@/lib/session-cleanup"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
})

type Schema = z.infer<typeof schema>
type SocialProvider = "google" | "github"

function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(null)
  const {
    data: providers,
    isLoading: checkingProviders,
    isError: providerStatusError,
    isFetching: fetchingProviders,
    refetch: refetchProviders,
  } = useQuery({
    queryKey: ["auth", "sso-status"],
    queryFn: async () => {
      const response = await fetch("/api/auth/sso-status", { cache: "no-store" })
      if (!response.ok) throw new Error("Unable to load social sign-in status")
      const data = (await response.json()) as Partial<Record<SocialProvider, boolean>>
      return { google: data.google === true, github: data.github === true }
    },
    staleTime: 60_000,
    retry: 1,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", rememberMe: true },
  })

  async function onSubmit(data: Schema) {
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe ?? true,
      })

      if (authError) {
        setError(
          authError.status === 403
            ? "This account cannot sign in. Contact an administrator."
            : "Invalid email or password"
        )
        return
      }

      clearLegacyUserData()
      router.push("/dashboard")
      router.refresh()
    } catch {
      setError("Could not reach the sign-in service. Check your connection and retry.")
    } finally {
      setLoading(false)
    }
  }

  async function handleSocialSignIn(provider: SocialProvider) {
    setSocialLoading(provider)
    setError(null)
    clearLegacyUserData()
    try {
      const { error: authError } = await authClient.signIn.social({
        provider,
        callbackURL: "/dashboard",
      })
      if (authError) {
        setError("Could not start social sign-in. Check your connection and retry.")
      }
    } catch {
      setError("Could not reach the sign-in service. Check your connection and retry.")
    } finally {
      setSocialLoading(null)
    }
  }

  const authPending = loading || socialLoading !== null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
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
          autoComplete="current-password"
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

      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input type="checkbox" className="size-4" {...register("rememberMe")} />
        Keep me signed in
      </label>

      {error && (
        <p id="login-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={authPending} aria-busy={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="space-y-2" aria-label="Social sign-in options">
        {checkingProviders ? (
          <p className="text-center text-xs text-muted-foreground" role="status">
            Loading social sign-in options...
          </p>
        ) : providerStatusError ? (
          <div className="space-y-1 text-center">
            <p role="alert" className="text-xs text-destructive">
              Could not load social sign-in options.
            </p>
            <Button
              type="button"
              variant="link"
              size="sm"
              disabled={fetchingProviders}
              onClick={() => void refetchProviders()}
            >
              {fetchingProviders ? "Retrying..." : "Retry"}
            </Button>
          </div>
        ) : providers?.google || providers?.github ? (
          <>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or continue with
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {providers?.google && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={authPending}
                  aria-busy={socialLoading === "google"}
                  onClick={() => void handleSocialSignIn("google")}
                >
                  <Globe aria-hidden="true" />
                  {socialLoading === "google" ? "Connecting..." : "Google"}
                </Button>
              )}
              {providers?.github && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={authPending}
                  aria-busy={socialLoading === "github"}
                  onClick={() => void handleSocialSignIn("github")}
                >
                  <GitBranch aria-hidden="true" />
                  {socialLoading === "github" ? "Connecting..." : "GitHub"}
                </Button>
              )}
            </div>
          </>
        ) : null}
      </div>

      <div className="flex justify-between text-sm">
        <Link href="/auth/register" className="text-muted-foreground hover:underline">
          Create account
        </Link>
        <Link href="/auth/reset-password" className="text-muted-foreground hover:underline">
          Forgot password?
        </Link>
      </div>
    </form>
  )
}

export default function LoginPage() {
  return (
    <ErrorBoundary>
      <LoginForm />
    </ErrorBoundary>
  )
}
