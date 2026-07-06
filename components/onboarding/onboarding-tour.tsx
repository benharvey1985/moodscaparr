"use client"

import { useState } from "react"
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

interface OnboardingTourProps {
  isOpen: boolean
  onComplete: () => void
  onSkip: () => void
}

function OnboardingTour({ isOpen, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      handleFinish()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleFinish = async () => {
    try {
      await fetch("/api/user/onboarding-complete", { method: "POST" })
    } catch {
      // Tour still completes
    }
    onComplete()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onSkip() }}>
      <DialogContent className="sm:max-w-sm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="sr-only">Onboarding Tour</DialogTitle>
        </DialogHeader>
        <button
          onClick={onSkip}
          className="absolute right-3 top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="size-4" />
          <span className="sr-only">Skip</span>
        </button>
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
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`size-2 rounded-full transition-colors ${
                index === currentStep ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { OnboardingTour }
