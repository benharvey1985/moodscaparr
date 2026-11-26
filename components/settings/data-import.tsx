"use client"

import { useRef, useState } from "react"
import { useImportData } from "@/hooks/use-profile"
import { previewImportFile, type ImportPreview } from "@/lib/api/profile"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Upload, FileText } from "lucide-react"
import { useToast } from "@/components/ui/toaster"

export function DataImport() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [parsing, setParsing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const importingRef = useRef(false)
  const importMutation = useImportData()
  const { addToast } = useToast()

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return

    setParsing(true)
    setFile(null)
    setPreview(null)
    try {
      const parsed = await previewImportFile(selected)
      setFile(selected)
      setPreview(parsed)
    } catch (parseError) {
      addToast({
        message: parseError instanceof Error ? parseError.message : "Invalid export file",
        variant: "error",
      })
      if (inputRef.current) inputRef.current.value = ""
    } finally {
      setParsing(false)
    }
  }

  async function handleImport() {
    if (!file || importingRef.current || importMutation.isPending) return
    importingRef.current = true
    try {
      const result = await importMutation.mutateAsync(file)
      addToast({
        message: `Imported ${result.imported}, skipped ${result.skipped}, conflicts ${result.conflicts}`,
        variant: "success",
      })
      setFile(null)
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ""
    } catch (importError) {
      addToast({
        message: importError instanceof Error ? importError.message : "Import failed",
        variant: "error",
      })
    } finally {
      importingRef.current = false
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
          Restore entries in transactional chunks of up to 500. Matching stable IDs are skipped; conflicting IDs are never overwritten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={inputRef}
          id="mood-import-file"
          type="file"
          accept=".json,application/json"
          onChange={handleFile}
          className="sr-only"
          disabled={parsing || importMutation.isPending}
        />

        {!preview && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={parsing || importMutation.isPending}
            className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-8 text-center hover:bg-muted/50 disabled:cursor-not-allowed"
          >
            <Upload className="size-8 text-muted-foreground" />
            <span className="text-sm font-medium">{parsing ? "Parsing..." : "Choose a JSON export file"}</span>
            <span className="text-xs text-muted-foreground">The file shape and entry count are validated before import.</span>
          </button>
        )}

        {preview && (
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{file?.name}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Version {preview.version} · {preview.entries.length} entries validated
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Same-user entries with the same stable ID and content are skipped. Another owner&apos;s ID or changed content is reported as a conflict. Date/category duplicates are preserved.
            </p>
            {importMutation.isError && (
              <p role="alert" className="text-sm text-destructive">{importMutation.error.message}</p>
            )}

            <div className="flex gap-2">
              <Button type="button" onClick={handleImport} disabled={importMutation.isPending || preview.entries.length === 0}>
                {importMutation.isPending ? "Importing..." : "Confirm Import"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={importMutation.isPending}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
