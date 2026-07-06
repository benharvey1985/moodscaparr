"use client"

import { useWizard } from "./wizard-provider"
import { MoodSelector } from "@/components/ui/mood-selector"
import { Button } from "@/components/ui/button"

interface StepMoodPickerProps {
  onSave: () => void
  onNext: () => void
}

export function StepMoodPicker({ onSave, onNext }: StepMoodPickerProps) {
  const { formData, updateFormData } = useWizard()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">How are you feeling?</h2>
        <p className="text-sm text-muted-foreground">
          Select the mood that best describes how you feel right now.
        </p>
      </div>

      <MoodSelector
        selectedCategory={formData.category}
        selectedMoodIndex={formData.moodIndex}
        onMoodSelect={(category, moodIndex) => {
          updateFormData({ category, moodIndex })
        }}
        intensity={formData.intensity}
        onIntensityChange={(intensity) => updateFormData({ intensity })}
        date={formData.date}
        onDateChange={(date) => updateFormData({ date })}
      />

      <div className="flex justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onSave}>
          Save
        </Button>
        <Button type="button" onClick={onNext} disabled={!formData.category}>
          Add More Detail
        </Button>
      </div>
    </div>
  )
}
