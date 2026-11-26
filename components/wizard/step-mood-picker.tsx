"use client"

import { useWizard, step1Schema, fullSchema } from "./wizard-provider"
import { MOODS, type MoodCategory } from "@/types/mood"
import { shiftDateOnly, todayInTimeZone } from "@/lib/dates"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface StepMoodPickerProps {
  onSave: () => void
  onNext: () => void
  isPending: boolean
}

const categoryStyles: Record<MoodCategory, string> = {
  POSITIVE: "bg-mood-positive-light",
  NEUTRAL: "bg-mood-neutral-light",
  NEGATIVE: "bg-mood-negative-light",
}

export function StepMoodPicker({ onSave, onNext, isPending }: StepMoodPickerProps) {
  const { formData, updateFormData, timezone } = useWizard()
  const stepValid = step1Schema.safeParse(formData).success
  const saveValid = fullSchema.safeParse(formData).success

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">How are you feeling?</h2>
        <p className="text-sm text-muted-foreground">
          Select the mood that best describes how you feel right now.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(Object.entries(MOODS) as Array<[MoodCategory, (typeof MOODS)[MoodCategory]]>).map(
          ([category, moods]) => (
            <fieldset key={category} className="space-y-2">
              <legend className="mb-2 w-full rounded-xl bg-muted px-3 py-1.5 text-center text-sm font-semibold">
                {category.charAt(0) + category.slice(1).toLowerCase()}
              </legend>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {moods.map((mood, moodIndex) => {
                  const active = formData.category === category && formData.moodIndex === moodIndex
                  return (
                    <button
                      key={`${category}-${moodIndex}`}
                      type="button"
                      aria-pressed={active}
                      disabled={isPending}
                      onClick={() => updateFormData({ category, moodIndex })}
                      className={cn(
                        "flex min-h-11 cursor-pointer flex-col items-center gap-1 rounded-xl p-2 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50",
                        categoryStyles[category],
                        active && "ring-2 ring-foreground ring-offset-2"
                      )}
                    >
                      <span className="text-2xl">{mood.emoji}</span>
                      <span className="text-[0.875rem] leading-tight">{mood.label}</span>
                    </button>
                  )
                })}
              </div>
            </fieldset>
          )
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="wizard-intensity" className="text-sm font-medium">Intensity</label>
            <span className="text-sm text-muted-foreground">{formData.intensity}</span>
          </div>
          <input
            id="wizard-intensity"
            type="range"
            min={1}
            max={10}
            value={formData.intensity}
            disabled={isPending}
            onChange={(event) => updateFormData({ intensity: Number(event.target.value) })}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-border accent-mood-positive-medium"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 - Mild</span><span>10 - Intense</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="wizard-local-date" className="text-sm font-medium">Date</label>
          <div className="flex flex-wrap gap-2">
            <input
              id="wizard-local-date"
              type="date"
              value={formData.localDate}
              disabled={isPending}
              onChange={(event) => updateFormData({ localDate: event.target.value })}
              className="h-11 min-w-0 flex-1 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <div className="flex shrink-0 gap-1">
              {["Today", "Yesterday"].map((label) => (
                <button
                  key={label}
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    const today = todayInTimeZone(timezone)
                    onDate(label, today, updateFormData)
                  }}
                  className="h-11 cursor-pointer rounded-lg border border-input px-3 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Today and Yesterday use your profile timezone ({timezone}).</p>
        </div>
      </div>

      <div className="flex justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onSave} disabled={!saveValid || isPending}>
          Save
        </Button>
        <Button type="button" onClick={onNext} disabled={!stepValid || isPending}>
          Add More Detail
        </Button>
      </div>
    </div>
  )
}

function onDate(
  label: string,
  today: string,
  updateFormData: (data: { localDate: string }) => void
) {
  updateFormData({ localDate: label === "Today" ? today : shiftDateOnly(today, -1) })
}
