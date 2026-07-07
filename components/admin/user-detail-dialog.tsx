"use client"

import { useState } from "react"
import { useAdminMutations } from "@/hooks/use-admin"
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
  const { updateUser, deleteUser } = useAdminMutations()
  const [suspendConfirmOpen, setSuspendConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  async function handleToggleRole() {
    if (!user) return
    try {
      await updateUser.mutateAsync({
        id: user.id,
        data: { role: user.role === "admin" ? "user" : "admin" },
      })
      addToast({
        message: `User ${user.role === "admin" ? "demoted" : "promoted"}`,
        variant: "success",
      })
    } catch {
      addToast({ message: "Failed to update user", variant: "error" })
    }
  }

  async function handleToggleBan() {
    if (!user) return
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
    } catch {
      addToast({ message: "Failed to update user", variant: "error" })
      setSuspendConfirmOpen(false)
    }
  }

  async function handleDelete() {
    if (!user) return
    try {
      await deleteUser.mutateAsync(user.id)
      addToast({ message: "User deleted", variant: "success" })
      setDeleteConfirmOpen(false)
      onOpenChange(false)
    } catch {
      addToast({ message: "Failed to delete user", variant: "error" })
      setDeleteConfirmOpen(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
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

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleToggleRole}>
                  {user.role === "admin" ? "Demote to User" : "Promote to Admin"}
                </Button>
                <Button
                  variant={user.banned ? "outline" : "secondary"}
                  size="sm"
                  onClick={() => setSuspendConfirmOpen(true)}
                >
                  {user.banned ? "Unsuspend" : "Suspend"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirmOpen(true)}
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

      <AlertDialog open={suspendConfirmOpen} onOpenChange={setSuspendConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {user?.banned ? "Unsuspend User" : "Suspend User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {user?.banned
                ? "Are you sure you want to unsuspend this user? They will regain access to their account."
                : "Are you sure you want to suspend this user? They will be unable to access their account."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleToggleBan}
              disabled={updateUser.isPending}
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

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this user? This action
              cannot be undone. All of their data will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
