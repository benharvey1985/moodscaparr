"use client"

import { useRouter } from "next/navigation"
import { useWizard, WizardProvider } from "./wizard-provider"
import { StepMoodPicker } from "./step-mood-picker"
import { StepContext } from "./step-context"
import { StepReflection } from "./step-reflection"
import { useCreateMoodEntry, useUpdateMoodEntry } from "@/hooks/use-mood-entry"
import { useUnlockToast } from "@/components/achievements/unlock-toast"
import { cn } from "@/lib/utils"
import type { WizardFormData } from "./wizard-provider"
import type { UpdateMoodEntryInput } from "@/types/mood"
import { Button } from "@/components/ui/button"

const steps = ["Mood", "Context", "Reflect"]

interface WizardInnerProps {
  editId?: string
  onSuccess?: () => void
  onError?: (error: Error) => void
}

function WizardInner({ editId, onSuccess, onError }: WizardInnerProps) {
  const router = useRouter()
  const { step, setStep, formData, clearDraft } = useWizard()
  const createMutation = useCreateMoodEntry()
  const updateMutation = useUpdateMoodEntry()
  const { showUnlocks } = useUnlockToast()

  const isPending = createMutation.isPending || updateMutation.isPending

  async function handleSave() {
    const { activities, ...rest } = formData
    const body = {
      ...rest,
      activities: activities ?? [],
    }

    try {
      if (editId) {
        await updateMutation.mutateAsync({
          id: editId,
          data: body as UpdateMoodEntryInput,
        })
      } else {
        const result = await createMutation.mutateAsync(body)
        if (result.newlyUnlocked && result.newlyUnlocked.length > 0) {
          showUnlocks(result.newlyUnlocked.map((n) => n.badgeId))
        }
      }
      clearDraft()
      router.push("/dashboard")
    } catch (err) {
      onError?.(err as Error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {steps.map((label, idx) => (
          <div key={label} className="flex flex-1 items-center">
            <div
              className={cn(
                "flex items-center gap-2",
                idx <= step
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-medium",
                  idx < step
                    ? "bg-mood-positive-medium text-white"
                    : idx === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {idx + 1}
              </span>
              <span className="hidden text-sm font-medium sm:inline">
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1 rounded-full",
                  idx < step
                    ? "bg-mood-positive-medium"
                    : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {step === 0 && (
        <StepMoodPicker
          onSave={handleSave}
          onNext={() => setStep(1)}
        />
      )}
      {step === 1 && (
        <StepContext
          onBack={() => setStep(0)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <StepReflection
          onBack={() => setStep(1)}
          onSave={handleSave}
        />
      )}

      {(createMutation.isError || updateMutation.isError) && (
        <p className="text-sm text-destructive">
          {createMutation.error?.message ?? updateMutation.error?.message ?? "Something went wrong"}
        </p>
      )}
    </div>
  )
}

interface WizardPageProps {
  editId?: string
  initialData?: WizardFormData
}

export function WizardPage({ editId, initialData }: WizardPageProps) {
  return (
    <WizardProvider initialData={initialData}>
      <WizardInner editId={editId} />
    </WizardProvider>
  )
}
