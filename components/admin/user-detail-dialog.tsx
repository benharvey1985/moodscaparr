"use client"

import { useState } from "react"
import { useAdminMutations } from "@/hooks/use-admin"
import { authClient } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/toaster"
import type { AdminUser } from "@/lib/api/admin"

function mutationErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message && error.message !== "fetch failed") {
    return error.message
  }
  return `${fallback} Check your connection and retry.`
}

export function UserDetailDialog({
  user,
  open,
  onOpenChange,
}: {
  user: AdminUser | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addToast } = useToast()
  const { data: session } = authClient.useSession()
  const { updateUser, deleteUser } = useAdminMutations()
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [pendingRole, setPendingRole] = useState<"admin" | "user" | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const mutationPending = updateUser.isPending || deleteUser.isPending
  const isSelf = user?.id === session?.user.id

  function changeOpen(nextOpen: boolean) {
    if (!mutationPending) onOpenChange(nextOpen)
  }

  async function handleRoleChange() {
    if (!user || !pendingRole || mutationPending) return
    setActionError(null)
    try {
      await updateUser.mutateAsync({ id: user.id, data: { role: pendingRole } })
      addToast({
        message: `User ${pendingRole === "admin" ? "promoted" : "demoted"}`,
        variant: "success",
      })
      setPendingRole(null)
    } catch (error) {
      setActionError(mutationErrorMessage(error, "Failed to update role."))
      addToast({ message: "Failed to update role", variant: "error" })
    }
  }

  async function handleToggleBan() {
    if (!user || mutationPending) return
    setActionError(null)
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { banned: !user.banned },
      })
      addToast({
        message: user.banned ? "User unsuspended" : "User suspended",
        variant: "success",
      })
      setSuspendConfirmOpen(false)
    } catch (error) {
      setActionError(mutationErrorMessage(error, "Failed to update account status."))
      addToast({ message: "Failed to update account status", variant: "error" })
    }
  }

  async function handleDelete() {
    if (!user || mutationPending) return
    setActionError(null)
    try {
      await deleteUser.mutateAsync(user.id)
      addToast({ message: "User deleted", variant: "success" })
      setDeleteConfirmOpen(false)
      onOpenChange(false)
    } catch (error) {
      setActionError(mutationErrorMessage(error, "Failed to delete user."))
      addToast({ message: "Failed to delete user", variant: "error" })
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={changeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{user?.name || "User"}</DialogTitle>
            <DialogDescription>Manage user account and permissions</DialogDescription>
          </DialogHeader>

          {user ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={user.banned ? "destructive" : "outline"}>
                    {user.banned ? "Banned" : "Active"}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entries</p>
                  <p className="tabular-nums">{user.entryCount}</p>
                </div>
                {user.lastEntryDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Last Entry</p>
                    <p>{new Date(user.lastEntryDate).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Joined</p>
                  <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {actionError && (
                <p role="alert" className="text-sm text-destructive">
                  {actionError}
                </p>
              )}
              {isSelf && (
                <p className="text-xs text-muted-foreground">
                  You cannot demote or delete your own account.
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={mutationPending || (isSelf && user.role === "admin")}
                  onClick={() => {
                    setActionError(null)
                    setPendingRole(user.role === "admin" ? "user" : "admin")
                  }}
                >
                  {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                </Button>
                <Button
                  variant={user.banned ? "outline" : "secondary"}
                  size="sm"
                  disabled={mutationPending}
                  onClick={() => {
                    setActionError(null)
                    setSuspendConfirmOpen(true)
                  }}
                >
                  {user.banned ? "Unsuspend" : "Suspend"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={mutationPending || isSelf}
                  onClick={() => {
                    setActionError(null)
                    setDeleteConfirmOpen(true)
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <p className="py-4 text-sm text-muted-foreground">Loading...</p>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingRole !== null}
        onOpenChange={(nextOpen) => {
          if (!mutationPending && !nextOpen) setPendingRole(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingRole === "admin" ? "Promote to Administrator" : "Demote to User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRole === "admin"
                ? `Grant ${user?.name || user?.email || "this user"} full administrator access?`
                : `Remove administrator access from ${user?.name || user?.email || "this user"}?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateUser.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingRole === "user" ? "destructive" : "default"}
              disabled={updateUser.isPending}
              onClick={() => void handleRoleChange()}
            >
              {updateUser.isPending ? "Saving..." : pendingRole === "admin" ? "Promote" : "Demote"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={suspendConfirmOpen}
        onOpenChange={(nextOpen) => {
          if (!mutationPending) setSuspendConfirmOpen(nextOpen)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user?.banned ? "Unsuspend User" : "Suspend User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user?.banned
                ? "Are you sure you want to unsuspend this user? They will regain access to their account."
                : "Are you sure you want to suspend this user? Their sessions will be revoked immediately."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateUser.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={user?.banned ? "default" : "destructive"}
              disabled={updateUser.isPending}
              onClick={() => void handleToggleBan()}
            >
              {updateUser.isPending
                ? "Saving..."
                : user?.banned
                  ? "Unsuspend"
                  : "Suspend"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={deleteConfirmOpen}
        onOpenChange={(nextOpen) => {
          if (!mutationPending) setDeleteConfirmOpen(nextOpen)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this user? This action
              cannot be undone. All of their data will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {actionError && (
            <p role="alert" className="text-sm text-destructive">
              {actionError}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteUser.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteUser.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteUser.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
