"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const variants = {
  default: "bg-background border",
  success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200",
  error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200",
} as const

interface ToastProps {
  id: string
  message: string
  variant?: keyof typeof variants
  onDismiss: (id: string) => void
}

function Toast({ id, message, variant = "default", onDismiss }: ToastProps) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg animate-in slide-in-from-top-2 motion-reduce:animate-none",
        variants[variant]
      )}
    >
      <span className="flex-1">{message}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={`Dismiss notification: ${message}`}
        onClick={() => onDismiss(id)}
        className="-mr-2 shrink-0 opacity-70 hover:opacity-100 max-lg:size-11"
      >
        <X className="size-3.5" aria-hidden="true" />
      </Button>
    </div>
  )
}

export { Toast, type ToastProps }
