"use client"

import { useState, useEffect } from "react"
import { authClient } from "@/lib/auth-client"
import { MessageCircle } from "lucide-react"
import { FeedbackDialog } from "./feedback-dialog"

function FABButton() {
  const [open, setOpen] = useState(false)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    authClient.getSession().then((res) => {
      if (res?.data) setAuthenticated(true)
    })
  }, [])

  if (!authenticated) return null

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
