"use client"

import * as React from "react"
import { X } from "lucide-react"
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
        "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg animate-in slide-in-from-top-2",
        variants[variant]
      )}
    >
      <span className="flex-1">{message}</span>
      <button onClick={() => onDismiss(id)} className="shrink-0 opacity-60 hover:opacity-100">
        <X className="size-3.5" />
      </button>
    </div>
  )
}

export { Toast, type ToastProps }
