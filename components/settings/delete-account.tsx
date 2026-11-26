"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { clearUserScopedData } from "@/lib/session-cleanup"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/toaster"
import { Trash2 } from "lucide-react"

type SignInMethod = "credential" | "sso" | "unknown" | null

function responseError(data: unknown, fallback: string): string {
  if (typeof data === "object" && data !== null) {
    const body = data as Record<string, unknown>
    if (typeof body.error === "string") return body.error
    if (typeof body.message === "string") return body.message
    if (typeof body.error === "object" && body.error !== null) {
      const nested = body.error as Record<string, unknown>
      if (typeof nested.message === "string") return nested.message
    }
  }
  return fallback
}

export function DeleteAccount() {
  const router = useRouter()
  const { addToast } = useToast()
  const { data: session } = authClient.useSession()
  const [open, setOpen] = useState(false)
  const [checking, setChecking] = useState(false)
  const [signInMethod, setSignInMethod] = useState<SignInMethod>(null)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function prepareDeletion() {
    if (checking) return
    setChecking(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/list-accounts", { credentials: "include" })
      const data: unknown = await response.json().catch(() => null)
      if (!response.ok) throw new Error(responseError(data, "Could not verify your sign-in method"))
      if (!Array.isArray(data)) throw new Error("Could not verify your sign-in method")

      const hasCredentialAccount = data.some((account) =>
        typeof account === "object" &&
        account !== null &&
        "providerId" in account &&
        account.providerId === "credential"
      )
      setSignInMethod(hasCredentialAccount ? "credential" : data.length > 0 ? "sso" : "unknown")
      setPassword("")
      setOpen(true)
    } catch (cause) {
      setSignInMethod("unknown")
      setError(cause instanceof Error ? cause.message : "Could not verify your sign-in method")
      setOpen(true)
    } finally {
      setChecking(false)
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (loading) return
    setOpen(nextOpen)
    if (!nextOpen) {
      setPassword("")
      setError(null)
      setSignInMethod(null)
    }
  }

  async function handleDelete() {
    if (signInMethod !== "credential" || !password || loading) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/delete-account", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      const data: unknown = await response.json().catch(() => null)
      if (!response.ok) throw new Error(responseError(data, "Failed to delete account"))

      const result = data as { success?: unknown; message?: unknown } | null
      if (result?.success !== true || result.message !== "User deleted") {
        throw new Error(
          result?.message === "Verification email sent"
            ? "Deletion is awaiting email verification. Account deletion was not confirmed."
            : "Account deletion was not confirmed. No success was assumed."
        )
      }

      if (session?.user.id) clearUserScopedData(session.user.id)
      addToast({ message: "Account permanently deleted", variant: "success" })
      setOpen(false)
      router.replace("/auth/login")
      router.refresh()
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not confirm account deletion. Check your connection and retry."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        disabled={checking || !session?.user}
        aria-busy={checking}
        onClick={() => void prepareDeletion()}
      >
        <Trash2 className="mr-2 size-4" aria-hidden="true" />
        {checking ? "Checking sign-in..." : "Delete Account"}
      </Button>

      <AlertDialog open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent aria-busy={loading || checking}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes your account, mood entries, achievements, and profile settings.
              There is no undo and no recovery after deletion.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {signInMethod === "credential" && (
            <div className="space-y-2 px-4">
              <Label htmlFor="delete-password">Enter your password to confirm</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "delete-account-error" : "delete-password-help"}
                onChange={(event) => setPassword(event.target.value)}
              />
              <p id="delete-password-help" className="text-xs text-muted-foreground">
                Password confirmation is required for email and password accounts.
              </p>
              {error && <p id="delete-account-error" role="alert" className="text-sm text-destructive">{error}</p>}
              {loading && <p role="status" className="sr-only">Deleting account...</p>}
            </div>
          )}

          {signInMethod === "sso" && (
            <div className="space-y-3 px-4 text-sm">
              <p>
                This account signs in with Google or GitHub and has no password. Self-service deletion
                with password confirmation is not available for SSO-only accounts.
              </p>
              <p className="text-muted-foreground">
                Export your data, then ask another administrator to permanently delete the account.
                If you are the only administrator, another instance owner must arrange deletion.
              </p>
              <a href="/api/user/export" download className={buttonVariants({ variant: "outline" })}>
                Export my data
              </a>
            </div>
          )}

          {signInMethod === "unknown" && (
            <div className="space-y-3 px-4 text-sm">
              <p role="alert" className="text-destructive">
                {error ?? "Your sign-in method could not be verified. No deletion was attempted."}
              </p>
              <p className="text-muted-foreground">Retry the check or export your data before contacting an administrator.</p>
              <a href="/api/user/export" download className={buttonVariants({ variant: "outline" })}>
                Export my data
              </a>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading || checking}>Cancel</AlertDialogCancel>
            {signInMethod === "credential" && (
              <AlertDialogAction
                type="button"
                variant="destructive"
                disabled={!password || loading || checking}
                onClick={() => void handleDelete()}
              >
                {loading ? "Deleting..." : "Delete My Account"}
              </AlertDialogAction>
            )}
            {signInMethod === "unknown" && (
              <AlertDialogAction
                type="button"
                variant="outline"
                disabled={checking}
                onClick={() => void prepareDeletion()}
              >
                {checking ? "Checking..." : "Retry"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
