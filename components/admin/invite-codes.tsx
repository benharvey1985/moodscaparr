"use client"

import { useState } from "react"
import { useInviteCodes, useAdminMutations, useSetting, useUpdateSetting } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/toaster"
import { Copy, Trash2, Plus, ShieldCheck, ShieldOff } from "lucide-react"
import type { InviteCodeData } from "@/lib/api/admin"

function mutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message && error.message !== "fetch failed") {
    return error.message
  }
  return `${fallback} Check your connection and retry.`
}

export function InviteCodes() {
  const {
    data: codes,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useInviteCodes()
  const { generateInviteCode, revokeInviteCode } = useAdminMutations()
  const { addToast } = useToast()
  const {
    data: inviteOnlySetting,
    isLoading: settingLoading,
    isError: settingError,
    refetch: refetchSetting,
    isFetching: settingFetching,
  } = useSetting("invite_only")
  const updateSettingMut = useUpdateSetting()
  const inviteOnly = inviteOnlySetting?.value === "true"
  const [maxUses, setMaxUses] = useState(1)
  const [expiresIn, setExpiresIn] = useState(7)
  const [revokeTarget, setRevokeTarget] = useState<InviteCodeData | null>(null)
  const [copyingCode, setCopyingCode] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const mutationPending =
    generateInviteCode.isPending || revokeInviteCode.isPending || updateSettingMut.isPending

  async function handleGenerate() {
    if (generateInviteCode.isPending) return
    setActionError(null)
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresIn)
      const code = await generateInviteCode.mutateAsync({
        maxUses,
        expiresAt: expiresAt.toISOString(),
      })
      addToast({ message: `Generated code: ${code.code}`, variant: "success" })
    } catch (error) {
      const message = mutationErrorMessage(error, "Failed to generate code.")
      setActionError(message)
      addToast({ message, variant: "error" })
    }
  }

  async function handleRevoke() {
    if (!revokeTarget || revokeInviteCode.isPending) return
    setActionError(null)
    try {
      await revokeInviteCode.mutateAsync(revokeTarget.id)
      addToast({ message: "Code revoked", variant: "success" })
      setRevokeTarget(null)
    } catch (error) {
      const message = mutationErrorMessage(error, "Failed to revoke code.")
      setActionError(message)
      addToast({ message, variant: "error" })
    }
  }

  async function handleCopy(code: string) {
    if (copyingCode) return
    setCopyingCode(code)
    try {
      await navigator.clipboard.writeText(code)
      addToast({ message: "Copied to clipboard", variant: "success" })
    } catch {
      addToast({ message: "Failed to copy code. Select and copy it manually.", variant: "error" })
    } finally {
      setCopyingCode(null)
    }
  }

  async function handleToggleInviteOnly() {
    if (settingLoading || updateSettingMut.isPending) return
    setActionError(null)
    try {
      await updateSettingMut.mutateAsync({
        key: "invite_only",
        value: inviteOnly ? "false" : "true",
      })
      addToast({
        message: inviteOnly ? "Invite-only mode disabled" : "Invite-only mode enabled",
        variant: "success",
      })
    } catch (error) {
      const message = mutationErrorMessage(error, "Failed to update invite-only mode.")
      setActionError(message)
      addToast({ message, variant: "error" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Invite Codes</h2>
        <p className="text-sm text-muted-foreground">
          Generate and manage invite codes for user registration.
        </p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted" aria-hidden="true">
              {inviteOnly ? <ShieldCheck className="size-5" /> : <ShieldOff className="size-5" />}
            </div>
            <div>
              <p className="font-medium">Invite-Only Mode</p>
              <p id="invite-only-description" className="text-xs text-muted-foreground">
                {settingLoading
                  ? "Loading..."
                  : inviteOnly
                    ? "New users must enter an invite code to register"
                    : "Anyone can register freely"}
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Invite-only mode"
            aria-describedby="invite-only-description"
            aria-checked={inviteOnly}
            disabled={settingLoading || Boolean(settingError) || updateSettingMut.isPending}
            onClick={() => void handleToggleInviteOnly()}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span
              aria-hidden="true"
              className={`relative inline-flex h-6 w-10 items-center rounded-full border-2 border-transparent transition-colors ${
                inviteOnly ? "bg-primary" : "bg-input"
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                  inviteOnly ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </span>
          </button>
        </CardContent>
        {settingError && (
          <CardContent className="pt-0">
            <p role="alert" className="text-sm text-destructive">
              Unable to load invite-only mode.
            </p>
            <Button variant="outline" size="sm" disabled={settingFetching} onClick={() => void refetchSetting()}>
              {settingFetching ? "Retrying..." : "Retry"}
            </Button>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-6 p-5">
          <div className="flex flex-col gap-3">
            <label htmlFor="invite-max-uses" className="text-sm font-medium">Max Uses</label>
            <Input
              id="invite-max-uses"
              type="number"
              min={1}
              max={1000}
              value={maxUses}
              onChange={(event) => setMaxUses(Math.max(1, parseInt(event.target.value, 10) || 1))}
              className="min-h-11 w-28"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label htmlFor="invite-expires-days" className="text-sm font-medium">Expires In (days)</label>
            <Input
              id="invite-expires-days"
              type="number"
              min={1}
              value={expiresIn}
              onChange={(event) => setExpiresIn(Math.max(1, parseInt(event.target.value, 10) || 1))}
              className="min-h-11 w-28"
            />
          </div>
          <Button type="button" className="min-h-11" disabled={mutationPending} onClick={() => void handleGenerate()}>
            <Plus className="mr-2 size-4" aria-hidden="true" />
            {generateInviteCode.isPending ? "Generating..." : "Generate"}
          </Button>
        </CardContent>
      </Card>

      {actionError && (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="space-y-3 py-4">
              <p role="alert" className="text-sm text-destructive">
                Unable to load invite codes. Check your connection and retry.
              </p>
              <Button variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>
                {isFetching ? "Retrying..." : "Retry"}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Max Uses</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-28">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        Loading...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && codes?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                        No invite codes yet
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading &&
                    codes?.map((code) => (
                      <TableRow key={code.id}>
                        <TableCell className="font-mono text-xs">{code.code}</TableCell>
                        <TableCell className="tabular-nums">{code.uses}</TableCell>
                        <TableCell className="tabular-nums">{code.maxUses}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(code.expiresAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            if (!code.active) return <Badge variant="secondary">Revoked</Badge>
                            if (code.uses >= code.maxUses) return <Badge variant="outline" className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">Exhausted</Badge>
                            if (new Date(code.expiresAt) < new Date()) return <Badge variant="destructive">Expired</Badge>
                            return <Badge variant="default">Active</Badge>
                          })()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="size-11"
                              aria-label={`Copy invite code ${code.code}`}
                              aria-busy={copyingCode === code.code}
                              disabled={copyingCode !== null}
                              onClick={() => void handleCopy(code.code)}
                            >
                              <Copy className="size-4" aria-hidden="true" />
                            </Button>
                            {code.active && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="size-11"
                                aria-label={`Revoke invite code ${code.code}`}
                                disabled={mutationPending}
                                onClick={() => {
                                  setActionError(null)
                                  setRevokeTarget(code)
                                }}
                              >
                                <Trash2 className="size-4" aria-hidden="true" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={revokeTarget !== null}
        onOpenChange={(nextOpen) => {
          if (!revokeInviteCode.isPending && !nextOpen) setRevokeTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Invite Code</AlertDialogTitle>
            <AlertDialogDescription>
              Revoke <span className="font-mono">{revokeTarget?.code}</span>? New registrations will no
              longer be able to use it. Existing users are not affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokeInviteCode.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={revokeInviteCode.isPending}
              onClick={() => void handleRevoke()}
            >
              {revokeInviteCode.isPending ? "Revoking..." : "Revoke"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
