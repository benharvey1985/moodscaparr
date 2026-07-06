"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <span className="text-xl">⚠️</span>
      </div>
      <h2 className="text-lg font-semibold">Admin panel error</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <div className="flex gap-2">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Go Home
        </Button>
      </div>
    </div>
  )
}
