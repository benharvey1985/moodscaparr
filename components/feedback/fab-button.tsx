"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { FeedbackDialog } from "./feedback-dialog"

function FABButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95"
      >
        <MessageCircle className="size-5" />
      </button>
      <FeedbackDialog open={open} onOpenChange={setOpen} />
    </>
  )
}

export { FABButton }
