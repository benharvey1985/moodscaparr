"use client"

import { useWizard } from "./wizard-provider"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  ACTIVITIES,
  WEATHERS,
  SLEEP_QUALITIES,
} from "@/types/mood"
import { cn } from "@/lib/utils"

interface StepContextProps {
  onBack: () => void
  onNext: () => void
}

export function StepContext({ onBack, onNext }: StepContextProps) {
  const { formData, updateFormData } = useWizard()

  const selectedActivities = formData.activities ?? []

  function toggleActivity(activity: string) {
    const current = selectedActivities
    const next = current.includes(activity)
      ? current.filter((a) => a !== activity)
      : [...current, activity]
    updateFormData({ activities: next })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Add Context</h2>
        <p className="text-sm text-muted-foreground">
          What's been going on? All fields are optional.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Activities</label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITIES.map((activity) => {
            const isSelected = selectedActivities.includes(activity)
            return (
              <button
                key={activity}
                type="button"
                onClick={() => toggleActivity(activity)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-all",
                  isSelected
                    ? "border-mood-positive-medium bg-mood-positive-medium text-white"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                {activity}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Weather</label>
        <Select
          value={formData.weather ?? ""}
          onChange={(e) =>
            updateFormData({ weather: e.target.value || undefined })
          }
        >
          <option value="">Select weather</option>
          {WEATHERS.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Sleep (hours)</label>
          <Input
            type="number"
            min={0}
            max={24}
            step={0.5}
            placeholder="0-24"
            value={formData.sleepHours ?? ""}
            onChange={(e) =>
              updateFormData({
                sleepHours: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Sleep Quality</label>
          <Select
            value={formData.sleepQuality ?? ""}
            onChange={(e) =>
              updateFormData({ sleepQuality: e.target.value || undefined })
            }
          >
            <option value="">Select quality</option>
            {SLEEP_QUALITIES.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Energy Level: {formData.energyLevel ?? "-"}
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={formData.energyLevel ?? 5}
          onChange={(e) =>
            updateFormData({ energyLevel: Number(e.target.value) })
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-mood-positive-medium"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 - Low</span>
          <span>10 - High</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          Stress Level: {formData.stressLevel ?? "-"}
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={formData.stressLevel ?? 5}
          onChange={(e) =>
            updateFormData({ stressLevel: Number(e.target.value) })
          }
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-mood-negative-medium"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 - Low</span>
          <span>10 - High</span>
        </div>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  )
}
