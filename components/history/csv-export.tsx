"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAllEntries } from "@/hooks/use-history"
import { MOODS, type MoodCategory } from "@/types/mood"
import { Download, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/toaster"

export function CsvExport() {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()

  async function handleExport() {
    setLoading(true)
    try {
      const { fetchAllEntries } = await import("@/lib/api/history")
      const entries = await fetchAllEntries()

      const headers = [
        "Date", "Category", "Mood", "Intensity",
        "Activities", "Weather", "Sleep Hours", "Sleep Quality",
        "Energy", "Stress", "Reflection 1", "Reflection 2",
        "Reflection 3", "Reflection 4",
      ]

      function sanitizeCsv(value: string): string {
        const sanitized = value.replace(/"/g, '""')
        if (/^[=+\-@]/.test(sanitized)) {
          return `"'${sanitized}"`
        }
        return `"${sanitized}"`
      }

      const rows = entries.map((e) => {
        const moods = MOODS[e.category as MoodCategory]
        const mood = moods?.[e.moodIndex]
        return [
          format(new Date(e.date), "yyyy-MM-dd"),
          e.category,
          mood?.label ?? "",
          String(e.intensity),
          e.activities.join("|"),
          e.weather ?? "",
          e.sleepHours != null ? String(e.sleepHours) : "",
          e.sleepQuality ?? "",
          e.energyLevel != null ? String(e.energyLevel) : "",
          e.stressLevel != null ? String(e.stressLevel) : "",
          e.reflection1 ?? "",
          e.reflection2 ?? "",
          e.reflection3 ?? "",
          e.reflection4 ?? "",
        ]
          .map((v) => sanitizeCsv(v))
          .join(",")
      })

      const csv = [headers.join(","), ...rows].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `moodscaparr-entries-${format(new Date(), "yyyy-MM-dd")}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      addToast({ message: "Failed to export CSV. Please try again.", variant: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Download className="size-3.5" />}
      {loading ? "Exporting..." : "CSV Export"}
    </Button>
  )
}
