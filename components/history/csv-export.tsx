"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/toaster"
import { countCsvEntries } from "@/components/history/csv"

export function CsvExport() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")
  const { addToast } = useToast()

  async function handleExport() {
    setLoading(true)
    setStatus("")

    try {
      const response = await fetch("/api/mood-entries/export", {
        credentials: "include",
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Failed to export CSV")
      }

      const blob = await response.blob()
      const countValue = response.headers.get("X-Entry-Count")
      const countHeader = countValue === null ? Number.NaN : Number(countValue)
      const count = Number.isInteger(countHeader) && countHeader >= 0
        ? countHeader
        : countCsvEntries(await blob.text())

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "moodscaparr-entries.csv"
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)

      const message = `Exported ${count} ${count === 1 ? "entry" : "entries"} to CSV`
      setStatus(message)
      addToast({ message, variant: "success" })
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to export CSV"
      setStatus(message)
      addToast({ message, variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="min-h-11"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
        {loading ? "Exporting..." : "CSV Export"}
      </Button>
      <span className="sr-only" role="status" aria-live="polite">{status}</span>
    </>
  )
}
