"use client"

import { useState } from "react"
import { useInviteCodes, useAdminMutations } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useToast } from "@/components/ui/toaster"
import { Copy, Trash2, Plus } from "lucide-react"

export function InviteCodes() {
  const { data: codes, isLoading } = useInviteCodes()
  const { generateInviteCode, revokeInviteCode } = useAdminMutations()
  const { addToast } = useToast()
  const [maxUses, setMaxUses] = useState(1)
  const [expiresIn, setExpiresIn] = useState(7)

  async function handleGenerate() {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expiresIn)
      const code = await generateInviteCode.mutateAsync({
        maxUses,
        expiresAt: expiresAt.toISOString(),
      })
      addToast({ message: `Generated code: ${code.code}`, variant: "success" })
    } catch {
      addToast({ message: "Failed to generate code", variant: "error" })
    }
  }

  async function handleRevoke(id: string) {
    try {
      await revokeInviteCode.mutateAsync(id)
      addToast({ message: "Code revoked", variant: "success" })
    } catch {
      addToast({ message: "Failed to revoke code", variant: "error" })
    }
  }

  async function handleCopy(code: string) {
    try {
      await navigator.clipboard.writeText(code)
      addToast({ message: "Copied to clipboard", variant: "success" })
    } catch {
      addToast({ message: "Failed to copy", variant: "error" })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Invite Codes</h2>
        <p className="text-sm text-muted-foreground">
          Generate and manage invite codes for user registration.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium">Max Uses</label>
            <Input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
              className="w-20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Expires In (days)</label>
            <Input
              type="number"
              min={1}
              value={expiresIn}
              onChange={(e) => setExpiresIn(parseInt(e.target.value) || 7)}
              className="w-20"
            />
          </div>
          <Button onClick={handleGenerate}>
            <Plus className="mr-2 size-4" />
            Generate
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Max Uses</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && codes?.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No invite codes yet
                  </TableCell>
                </TableRow>
              )}
              {!isLoading &&
                codes?.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-mono text-xs">{code.code}</TableCell>
                    <TableCell className="tabular-nums">
                      {code.uses}/{code.maxUses}
                    </TableCell>
                    <TableCell className="tabular-nums">{code.maxUses}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(code.expiresAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={code.active ? "outline" : "secondary"}>
                        {code.active ? "Active" : "Revoked"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleCopy(code.code)}
                        >
                          <Copy className="size-3.5" />
                        </Button>
                        {code.active && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRevoke(code.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
