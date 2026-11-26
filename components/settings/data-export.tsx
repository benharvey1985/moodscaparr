"use client"

import { useRef } from "react"
import { useExportData } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Download } from "lucide-react"
import { useToast } from "@/components/ui/toaster"

export function DataExport() {
  const exportingRef = useRef(false)
  const exportMutation = useExportData()
  const { addToast } = useToast()

  async function handleExport() {
    if (exportingRef.current || exportMutation.isPending) return
    exportingRef.current = true
    try {
      const blob = await exportMutation.mutateAsync()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement("a")
      anchor.href = url
      anchor.download = `moodscaparr-export-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      addToast({ message: "Export downloaded", variant: "success" })
    } catch (exportError) {
      addToast({
        message: exportError instanceof Error ? exportError.message : "Export failed",
        variant: "error",
      })
    } finally {
      exportingRef.current = false
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
      <CardContent className="space-y-3">
        <Button type="button" onClick={handleExport} disabled={exportMutation.isPending}>
          <Download className="mr-2 size-4" />
          {exportMutation.isPending ? "Exporting..." : "Export My Data"}
        </Button>
        {exportMutation.isError && (
          <p role="alert" className="text-sm text-destructive">{exportMutation.error.message}</p>
        )}
      </CardContent>
    </Card>
  )
}
