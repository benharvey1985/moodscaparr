"use client"

import { useAdminMutations } from "@/hooks/use-admin"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
    } catch {
      addToast({ message: "Failed to update user", variant: "error" })
    }
  }

  async function handleDelete() {
    if (!user) return
    try {
      await deleteUser.mutateAsync(user.id)
      addToast({ message: "User deleted", variant: "success" })
      onOpenChange(false)
    } catch {
      addToast({ message: "Failed to delete user", variant: "error" })
    }
  }

  return (
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
                onClick={handleToggleBan}
              >
                {user.banned ? "Unsuspend" : "Suspend"}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">Loading...</p>
        )}
      </DialogContent>
    </Dialog>
  )
}
