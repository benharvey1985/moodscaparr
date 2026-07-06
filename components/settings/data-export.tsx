"use client"

import { useState } from "react"
import { useExportData } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download } from "lucide-react"

export function DataExport() {
  const [loading, setLoading] = useState(false)
  const exportMutation = useExportData()

  async function handleExport() {
    setLoading(true)
    try {
      const blob = await exportMutation.mutateAsync()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `moodscaparr-export-${new Date().toISOString().split("T")[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Data</CardTitle>
        <CardDescription>
          Download all your mood entries, profile, and achievements as JSON.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleExport} disabled={loading}>
          <Download className="mr-2 size-4" />
          {loading ? "Exporting..." : "Export My Data"}
        </Button>
      </CardContent>
    </Card>
  )
}
