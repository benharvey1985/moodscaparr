"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { MessageCircle } from "lucide-react"
import { FeedbackDialog } from "./feedback-dialog"

function FABButton() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const hidden = pathname === "/auth" || pathname.startsWith("/auth/")

  if (hidden) return null

  return (
    <>
      <button
        type="button"
        aria-label="Open feedback"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[calc(5rem_+_env(safe-area-inset-bottom))] z-40 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none lg:right-6 lg:bottom-6"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
      </button>
      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

export { FABButton }
