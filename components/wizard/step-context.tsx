"use client"

import { useWizard, step1Schema, step2Schema } from "./wizard-provider"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ACTIVITIES, WEATHERS, SLEEP_QUALITIES } from "@/types/mood"
import { cn } from "@/lib/utils"

interface StepContextProps {
  onBack: () => void
  onNext: () => void
  isPending: boolean
}

export function StepContext({ onBack, onNext, isPending }: StepContextProps) {
  const { formData, updateFormData } = useWizard()
  const selectedActivities = formData.activities
  const valid = step1Schema.safeParse(formData).success && step2Schema.safeParse(formData).success

  function toggleActivity(activity: string) {
    const next = selectedActivities.includes(activity)
      ? selectedActivities.filter((item) => item !== activity)
      : [...selectedActivities, activity]
    updateFormData({ activities: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Add Context</h2>
        <p className="text-sm text-muted-foreground">What&apos;s been going on? All fields are optional.</p>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Activities</legend>
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.map((activity) => {
            const selected = selectedActivities.includes(activity)
            return (
              <button
                key={activity}
                type="button"
                aria-pressed={selected}
                disabled={isPending}
                onClick={() => toggleActivity(activity)}
                className={cn(
                  "min-h-11 rounded-full border px-3 py-1 text-xs font-medium transition-all disabled:opacity-50",
                  selected
                    ? "border-mood-positive-medium bg-mood-positive-medium text-white"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                {activity}
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="space-y-2">
        <label htmlFor="wizard-weather" className="text-sm font-medium">Weather</label>
        <Select
          id="wizard-weather"
          value={formData.weather ?? ""}
          disabled={isPending}
          onChange={(event) => updateFormData({ weather: event.target.value || null })}
        >
          <option value="">Select weather</option>
          {WEATHERS.map((weather) => <option key={weather} value={weather}>{weather}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="wizard-sleep-hours" className="text-sm font-medium">Sleep (hours)</label>
          <Input
            id="wizard-sleep-hours"
            type="number"
            min={0}
            max={24}
            step={0.5}
            placeholder="0-24"
            disabled={isPending}
            value={formData.sleepHours ?? ""}
            onChange={(event) => updateFormData({ sleepHours: event.target.value ? Number(event.target.value) : null })}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="wizard-sleep-quality" className="text-sm font-medium">Sleep Quality</label>
          <Select
            id="wizard-sleep-quality"
            value={formData.sleepQuality ?? ""}
            disabled={isPending}
            onChange={(event) => updateFormData({ sleepQuality: event.target.value || null })}
          >
            <option value="">Select quality</option>
            {SLEEP_QUALITIES.map((quality) => <option key={quality} value={quality}>{quality}</option>)}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="wizard-energy" className="text-sm font-medium">Energy Level: {formData.energyLevel ?? "-"}</label>
        <input
          id="wizard-energy"
          type="range"
          min={1}
          max={10}
          value={formData.energyLevel ?? 5}
          disabled={isPending}
          onChange={(event) => updateFormData({ energyLevel: Number(event.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-mood-positive-medium"
        />
        <div className="flex justify-between text-xs text-muted-foreground"><span>1 - Low</span><span>10 - High</span></div>
      </div>

      <div className="space-y-2">
        <label htmlFor="wizard-stress" className="text-sm font-medium">Stress Level: {formData.stressLevel ?? "-"}</label>
        <input
          id="wizard-stress"
          type="range"
          min={1}
          max={10}
          value={formData.stressLevel ?? 5}
          disabled={isPending}
          onChange={(event) => updateFormData({ stressLevel: Number(event.target.value) })}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-mood-negative-medium"
        />
        <div className="flex justify-between text-xs text-muted-foreground"><span>1 - Low</span><span>10 - High</span></div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={isPending}>Back</Button>
        <Button type="button" onClick={onNext} disabled={!valid || isPending}>Next</Button>
      </div>
    </div>
  )
}
