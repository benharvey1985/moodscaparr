"use client"

import { useRef, useState } from "react"
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
import { useDeleteMoodEntry } from "@/hooks/use-mood-entry"

interface DeleteDialogProps {
  entryId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDialog({ entryId, open, onOpenChange }: DeleteDialogProps) {
  const deleteMutation = useDeleteMoodEntry()
  const pendingRef = useRef(false)
  const [failure, setFailure] = useState<{ entryId: string; message: string } | null>(null)
  const error = failure?.entryId === entryId ? failure.message : null

  function handleOpenChange(nextOpen: boolean) {
    if (deleteMutation.isPending) return
    setFailure(null)
    onOpenChange(nextOpen)
  }

  async function handleDelete() {
    if (!entryId || pendingRef.current || deleteMutation.isPending) return

    pendingRef.current = true
    setFailure(null)
    try {
      const result = await deleteMutation.mutateAsync(entryId)
      if (!result.success) {
        throw new Error("The server did not confirm deletion. Please try again.")
      }
      setFailure(null)
      onOpenChange(false)
    } catch (deleteError) {
      setFailure({
        entryId,
        message: deleteError instanceof Error
          ? deleteError.message
          : "Could not delete this entry. Please try again.",
      })
    } finally {
      pendingRef.current = false
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent aria-busy={deleteMutation.isPending}>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? This will permanently delete this entry.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p
            id="delete-entry-error"
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={!entryId || deleteMutation.isPending}
            aria-describedby={error ? "delete-entry-error" : undefined}
          >
            {deleteMutation.isPending
              ? "Deleting..."
              : error
                ? "Retry Delete"
                : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
