"use client"

import { useWizard, fullSchema } from "./wizard-provider"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { REFLECTION_PROMPTS } from "@/components/history/reflection-prompts"

interface StepReflectionProps {
  onBack: () => void
  onSave: () => void
  isPending: boolean
}

export function StepReflection({ onBack, onSave, isPending }: StepReflectionProps) {
  const { formData, updateFormData } = useWizard()
  const valid = fullSchema.safeParse(formData).success

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Reflect</h2>
        <p className="text-sm text-muted-foreground">Take a moment to reflect. All fields are optional.</p>
      </div>

      {REFLECTION_PROMPTS.map(({ key, label }) => {
        const value = formData[key] ?? ""
        const inputId = `wizard-${key}`
        return (
          <div key={key} className="space-y-1.5">
            <label htmlFor={inputId} className="text-sm font-medium">{label}</label>
            <Textarea
              id={inputId}
              placeholder="Write your thoughts..."
              maxLength={500}
              rows={3}
              disabled={isPending}
              value={value}
              onChange={(event) => updateFormData({ [key]: event.target.value || null })}
            />
            <p className="text-right text-xs text-muted-foreground">{value.length}/500</p>
          </div>
        )
      })}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>Back</Button>
        <Button type="button" onClick={onSave} disabled={!valid || isPending}>Save Entry</Button>
      </div>
    </div>
  )
}
