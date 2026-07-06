"use client"

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

  async function handleDelete() {
    if (!entryId) return
    try {
      await deleteMutation.mutateAsync(entryId)
      onOpenChange(false)
    } catch {
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Entry</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure? This will permanently delete this entry.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
