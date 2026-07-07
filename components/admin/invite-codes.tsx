"use client"

import { useState } from "react"
import { useInviteCodes, useAdminMutations, useSetting, useUpdateSetting } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useToast } from "@/components/ui/toaster"
import { Copy, Trash2, Plus, ShieldCheck, ShieldOff } from "lucide-react"

export function InviteCodes() {
  const { data: codes, isLoading } = useInviteCodes()
  const { generateInviteCode, revokeInviteCode } = useAdminMutations()
  const { addToast } = useToast()
  const { data: inviteOnlySetting, isLoading: settingLoading } = useSetting("invite_only")
  const updateSettingMut = useUpdateSetting()
  const inviteOnly = inviteOnlySetting?.value === "true"
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
        <CardContent className="flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              {inviteOnly ? <ShieldCheck className="size-5" /> : <ShieldOff className="size-5" />}
            </div>
            <div>
              <p className="font-medium">Invite-Only Mode</p>
              <p className="text-xs text-muted-foreground">
                {settingLoading
                  ? "Loading..."
                  : inviteOnly
                    ? "New users must enter an invite code to register"
                    : "Anyone can register freely"}
              </p>
            </div>
          </div>
          <button
            role="switch"
            aria-checked={inviteOnly}
            disabled={settingLoading || updateSettingMut.isPending}
            onClick={async () => {
              try {
                await updateSettingMut.mutateAsync({
                  key: "invite_only",
                  value: inviteOnly ? "false" : "true",
                })
                addToast({
                  message: inviteOnly ? "Invite-only mode disabled" : "Invite-only mode enabled",
                  variant: "success",
                })
              } catch {
                addToast({ message: "Failed to update setting", variant: "error" })
              }
            }}
            className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              inviteOnly ? "bg-primary" : "bg-input"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                inviteOnly ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generate New Code</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-6 p-5">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Max Uses</label>
            <Input
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
              className="w-28"
            />
          </div>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Expires In (days)</label>
            <Input
              type="number"
              min={1}
              value={expiresIn}
              onChange={(e) => setExpiresIn(parseInt(e.target.value) || 7)}
              className="w-28"
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
                      {(() => {
                        if (!code.active) return <Badge variant="secondary">Revoked</Badge>
                        if (code.uses >= code.maxUses) return <Badge variant="secondary">Exhausted</Badge>
                        if (new Date(code.expiresAt) < new Date()) return <Badge variant="secondary">Expired</Badge>
                        return <Badge variant="outline">Active</Badge>
                      })()}
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
                        {code.active && code.uses < code.maxUses && (
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
