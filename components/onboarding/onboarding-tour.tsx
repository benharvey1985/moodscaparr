"use client"

import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { TourStep } from "./tour-step"
import { Heart, Smile, BarChart3, X } from "lucide-react"

const steps = [
  {
    title: "Welcome to Moodscaparr!",
    description: "Track your daily moods, discover patterns, and build self-awareness.",
    icon: Heart,
  },
  {
    title: "Log Your First Mood",
    description: "Use the Quick Log to jot down how you're feeling in just 3 taps, or use the full wizard for more detail.",
    icon: Smile,
  },
  {
    title: "Explore Your Insights",
    description: "Visit the Analytics page to see patterns, trends, and reflections over time.",
    icon: BarChart3,
  },
]

type CompletionAction = "skip" | "finish"

interface OnboardingTourProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
}

function OnboardingTour({ isOpen, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<CompletionAction | null>(null)
  const savingRef = useRef(false)

  async function persistCompletion(action: CompletionAction) {
    if (savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setError(null)
    setPendingAction(null)

    try {
      const response = await fetch("/api/user/onboarding-complete", {
        method: "POST",
        credentials: "include",
      })
      if (!response.ok) throw new Error("Could not save your tour progress")

      setCurrentStep(0)
      if (action === "finish") onComplete()
      else onSkip()
    } catch {
      setPendingAction(action)
      setError("Your tour dismissal could not be saved. Check your connection and retry.")
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  function handleNext() {
    if (saving || pendingAction) return
    if (currentStep < steps.length - 1) {
      setCurrentStep((previous) => previous + 1)
    } else {
      void persistCompletion("finish")
    }
  }

  function handleBack() {
    if (saving || pendingAction) return
    if (currentStep > 0) setCurrentStep((previous) => previous - 1)
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !saving) void persistCompletion("skip")
      }}
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={false} aria-busy={saving}>
        <DialogHeader>
          <DialogTitle className="sr-only">Onboarding Tour</DialogTitle>
        </DialogHeader>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Skip tour"
          disabled={saving}
          onClick={() => void persistCompletion("skip")}
          className="absolute top-2 right-2"
        >
          <X className="size-4" aria-hidden="true" />
        </Button>
        <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}. {steps[currentStep].description}
        </p>
        <div className="relative py-6">
          {steps.map((step, index) => (
            <TourStep
              key={index}
              step={index + 1}
              title={step.title}
              description={step.description}
              icon={step.icon}
              isActive={index === currentStep}
              isCompleted={index < currentStep}
            />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2" aria-hidden="true">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`size-2 rounded-full transition-colors motion-reduce:transition-none ${
                index === currentStep ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        {error && (
          <div role="alert" className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
            <p className="text-destructive">{error}</p>
            {pendingAction && (
              <Button type="button" variant="outline" size="sm" onClick={() => void persistCompletion(pendingAction)}>
                Retry
              </Button>
            )}
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0 || saving || pendingAction !== null}
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={saving || pendingAction !== null}
          >
            {saving ? "Saving..." : currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { OnboardingTour }
