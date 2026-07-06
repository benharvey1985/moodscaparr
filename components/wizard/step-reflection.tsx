"use client"

import { useWizard } from "./wizard-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface StepReflectionProps {
  onBack: () => void
  onSave: () => void
}

const prompts = [
  { key: "reflection1" as const, label: "What went well?" },
  { key: "reflection2" as const, label: "What was challenging?" },
  { key: "reflection3" as const, label: "What are you grateful for?" },
  { key: "reflection4" as const, label: "What's on your mind?" },
]

export function StepReflection({ onBack, onSave }: StepReflectionProps) {
  const { formData, updateFormData } = useWizard()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Reflect</h2>
        <p className="text-sm text-muted-foreground">
          Take a moment to reflect. All fields are optional.
        </p>
      </div>

      {prompts.map(({ key, label }) => {
        const value = formData[key] ?? ""
        const count = value.length

        return (
          <div key={key} className="space-y-1.5">
            <label className="text-sm font-medium">{label}</label>
            <Textarea
              placeholder={`Write your thoughts...`}
              maxLength={500}
              rows={3}
              value={value}
              onChange={(e) =>
                updateFormData({ [key]: e.target.value || undefined })
              }
            />
            <p className="text-right text-xs text-muted-foreground">
              {count}/500
            </p>
          </div>
        )
      })}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onSave}>
          Save Entry
        </Button>
      </div>
    </div>
  )
}
