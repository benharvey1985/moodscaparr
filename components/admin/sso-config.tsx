"use client"

import { useSSOConfig, useAdminMutations } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/toaster"
import { Globe, GitBranch } from "lucide-react"

const PROVIDER_INFO: Record<string, { name: string; icon: React.ReactNode }> = {
  google: { name: "Google", icon: <Globe className="size-5" /> },
  github: { name: "GitHub", icon: <GitBranch className="size-5" /> },
}

export function SSOConfig() {
  const { data: providers, isLoading } = useSSOConfig()
  const { toggleSSO } = useAdminMutations()
  const { addToast } = useToast()

  async function handleToggle(provider: string, current: boolean) {
    try {
      await toggleSSO.mutateAsync({ provider, enabled: !current })
      addToast({
        message: `${provider} ${!current ? "enabled" : "disabled"}`,
        variant: "success",
      })
    } catch {
      addToast({ message: "Failed to update SSO config", variant: "error" })
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-6">
              <div className="h-20 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">SSO Configuration</h2>
      <p className="text-sm text-muted-foreground">
        OAuth credentials must be configured in environment variables.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {providers?.map((p) => {
          const info = PROVIDER_INFO[p.provider] || {
            name: p.provider,
            icon: <Globe className="size-5" />,
          }
          return (
            <Card key={p.provider}>
              <CardContent className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                    {info.icon}
                  </div>
                  <div>
                    <p className="font-medium">{info.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.enabled ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                </div>
                <button
                  role="switch"
                  aria-checked={p.enabled}
                  onClick={() => handleToggle(p.provider, p.enabled)}
                  className={`relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors ${
                    p.enabled ? "bg-primary" : "bg-input"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform ${
                      p.enabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
