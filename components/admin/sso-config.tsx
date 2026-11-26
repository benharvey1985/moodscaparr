"use client"

import { useSSOConfig } from "@/hooks/use-admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Globe, GitBranch } from "lucide-react"

const PROVIDER_INFO = {
  google: {
    name: "Google",
    icon: Globe,
    variables: "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET",
    callbackPath: "/api/auth/callback/google",
  },
  github: {
    name: "GitHub",
    icon: GitBranch,
    variables: "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET",
    callbackPath: "/api/auth/callback/github",
  },
} as const

export function SSOConfig() {
  const { data: providers, isLoading, error, refetch, isFetching } = useSSOConfig()

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">SSO Configuration</h2>
        <p className="text-sm text-muted-foreground">
          Provider availability is read-only and controlled by server environment variables.
          Changes require a server restart and are never stored in the database.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2" aria-label="Loading SSO status">
          {[0, 1].map((index) => (
            <Card key={index}>
              <CardContent className="py-6">
                <div className="h-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="space-y-3 py-5">
            <p role="alert" className="text-sm text-destructive">
              Unable to load SSO status. Check your connection and retry.
            </p>
            <Button variant="outline" size="sm" disabled={isFetching} onClick={() => void refetch()}>
              {isFetching ? "Retrying..." : "Retry"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {providers?.map((provider) => {
            const info = PROVIDER_INFO[provider.provider as keyof typeof PROVIDER_INFO]
            if (!info) return null
            const Icon = info.icon
            return (
              <Card key={provider.provider}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="size-5" aria-hidden="true" />
                    {info.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className={provider.enabled ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                    {provider.enabled ? "Configured" : "Not configured"}
                  </p>
                  <p className="text-muted-foreground">
                    Set <code>{info.variables}</code> on the server.
                  </p>
                  <p className="text-muted-foreground">
                    Authorize <code>{`BETTER_AUTH_URL${info.callbackPath}`}</code> as the provider
                    callback URL, replacing the variable with your deployment origin.
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
