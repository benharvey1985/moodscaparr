"use client"

import { useState, useRef } from "react"
import { useImportData } from "@/hooks/use-profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"
import { useToast } from "@/components/ui/toaster"

interface ImportPreview {
  entries: Array<{ date: string; category: string }>
}

export function DataImport() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [parsing, setParsing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const importMutation = useImportData()
  const { addToast } = useToast()

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setParsing(true)
    setFile(f)
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        if (!json.version || !json.data?.entries) {
          addToast({ message: "Invalid export file format", variant: "error" })
          setFile(null)
          return
        }
        setPreview({ entries: json.data.entries })
      } catch {
        addToast({ message: "Could not parse file", variant: "error" })
        setFile(null)
      } finally {
        setParsing(false)
      }
    }
    reader.readAsText(f)
  }

  async function handleImport() {
    if (!file) return
    try {
      const result = await importMutation.mutateAsync(file)
      addToast({
        message: `Imported ${result.imported} entries (${result.skipped} skipped)`,
        variant: "success",
      })
      setFile(null)
      setPreview(null)
    } catch {
      addToast({ message: "Import failed", variant: "error" })
    }
  }

  function handleCancel() {
    setFile(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Data</CardTitle>
        <CardDescription>
          Restore data from a previous export. Duplicate entries will be skipped.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          type="file"
          accept=".json"
          onChange={handleFile}
          className="hidden"
        />

        {!preview && (
          <div
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center hover:bg-muted/50"
          >
            <Upload className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {parsing ? "Parsing..." : "Click to upload export file"}
            </p>
            <p className="text-xs text-muted-foreground">JSON format only</p>
          </div>
        )}

        {preview && (
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file?.name}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {preview.entries.length} entries found
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              This will restore data from your backup. Duplicate entries (same date +
              category) will be skipped.
            </p>

            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={importMutation.isPending}>
                {importMutation.isPending ? "Importing..." : "Confirm Import"}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
