"use client"

import { ProfileForm } from "@/components/settings/profile-form"
import { AchievementSummary } from "@/components/settings/achievement-summary"
import { DataExport } from "@/components/settings/data-export"
import { DataImport } from "@/components/settings/data-import"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { DeleteAccount } from "@/components/settings/delete-account"

function SettingsContent() {
  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, achievements, and data
        </p>
      </div>

      <ProfileForm />

      <AchievementSummary />

      <DataExport />

      <DataImport />

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your data is stored securely and is only accessible to you. You can export or
            delete your data at any time.
          </p>
          <DeleteAccount />
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ErrorBoundary>
      <SettingsContent />
    </ErrorBoundary>
  )
}
