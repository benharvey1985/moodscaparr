"use client"

import { useState } from "react"
import { MessageSquare, RotateCcw } from "lucide-react"
import { ProfileForm } from "@/components/settings/profile-form"
import { AchievementSummary } from "@/components/settings/achievement-summary"
import { DataExport } from "@/components/settings/data-export"
import { DataImport } from "@/components/settings/data-import"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { DeleteAccount } from "@/components/settings/delete-account"
import { FeedbackHistory } from "@/components/feedback/feedback-history"
import { OnboardingTour } from "@/components/onboarding/onboarding-tour"

function SettingsContent() {
  const [historyOpen, setHistoryOpen] = useState(false)
  const [tourOpen, setTourOpen] = useState(false)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, achievements, feedback, and data
        </p>
      </div>

      <ProfileForm />

      <AchievementSummary />

      <Card>
        <CardHeader>
          <CardTitle>Feedback &amp; Help</CardTitle>
          <CardDescription>
            Review GitHub feedback drafts or revisit the introductory tour.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => setHistoryOpen(true)}>
            <MessageSquare className="mr-2 size-4" aria-hidden="true" />
            Feedback History
          </Button>
          <Button type="button" variant="outline" onClick={() => setTourOpen(true)}>
            <RotateCcw className="mr-2 size-4" aria-hidden="true" />
            Replay Tour
          </Button>
        </CardContent>
      </Card>

      <DataExport />

      <DataImport />

      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your mood data is private to your account. You can export or permanently delete it.
            Account deletion cannot be undone.
          </p>
          <DeleteAccount />
        </CardContent>
      </Card>

      <FeedbackHistory open={historyOpen} onOpenChange={setHistoryOpen} />
      <OnboardingTour
        isOpen={tourOpen}
        onComplete={() => setTourOpen(false)}
        onSkip={() => setTourOpen(false)}
      />
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
