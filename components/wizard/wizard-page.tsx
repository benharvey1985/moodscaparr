"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useWizard, WizardProvider, fullSchema, type WizardFormData } from "./wizard-provider"
import { StepMoodPicker } from "./step-mood-picker"
import { StepContext } from "./step-context"
import { StepReflection } from "./step-reflection"
import { useCreateMoodEntry, useUpdateMoodEntry } from "@/hooks/use-mood-entry"
import { useProfile } from "@/hooks/use-profile"
import { MoodApiError } from "@/lib/api/mood-entries"
import { useUnlockToast } from "@/components/achievements/unlock-toast"
import { WizardSkeleton } from "@/components/ui/loading-skeleton"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"

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
  const { addToast } = useToast()
  const submittingRef = useRef(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [existingId, setExistingId] = useState<string | null>(null)

  const isPending = createMutation.isPending || updateMutation.isPending

  async function handleSave() {
    if (submittingRef.current || isPending) return
    const parsed = fullSchema.safeParse(formData)
    if (!parsed.success) {
      setValidationError("Choose a valid mood, date, and context before saving.")
      return
    }

    submittingRef.current = true
    setValidationError(null)
    setExistingId(null)
    try {
      if (editId) {
        await updateMutation.mutateAsync({ id: editId, data: parsed.data })
      } else {
        const result = await createMutation.mutateAsync(parsed.data)
        if (result.newlyUnlocked?.length) {
          showUnlocks(result.newlyUnlocked.map((unlock) => unlock.badgeId))
        }
      }
      clearDraft()
      onSuccess?.()
      router.push("/dashboard")
    } catch (saveError) {
      const error = saveError instanceof Error ? saveError : new Error("Could not save entry")
      if (error instanceof MoodApiError && error.status === 409 && error.existingId) {
        setExistingId(error.existingId)
      }
      setValidationError(error.message)
      addToast({ message: error.message, variant: "error" })
      onError?.(error)
    } finally {
      submittingRef.current = false
    }
  }

  function goToStep(nextStep: number) {
    if (!isPending && fullSchema.safeParse(formData).success) setStep(nextStep)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {steps.map((label, index) => (
          <div key={label} className="flex flex-1 items-center">
            <div className={cn("flex items-center gap-2", index <= step ? "text-foreground" : "text-muted-foreground")}>
              <span className={cn(
                "flex size-7 items-center justify-center rounded-full text-xs font-medium",
                index < step
                  ? "bg-mood-positive-medium text-white"
                  : index === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              )}>
                {index + 1}
              </span>
              <span className="hidden text-sm font-medium sm:inline">{label}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1 rounded-full", index < step ? "bg-mood-positive-medium" : "bg-border")} />
            )}
          </div>
        ))}
      </div>

      {step === 0 && <StepMoodPicker onSave={handleSave} onNext={() => goToStep(1)} isPending={isPending} />}
      {step === 1 && <StepContext onBack={() => goToStep(0)} onNext={() => goToStep(2)} isPending={isPending} />}
      {step === 2 && <StepReflection onBack={() => goToStep(1)} onSave={handleSave} isPending={isPending} />}

      {(validationError || createMutation.isError || updateMutation.isError) && (
        <div role="alert" className="space-y-2 text-sm text-destructive">
          <p>{validationError ?? createMutation.error?.message ?? updateMutation.error?.message}</p>
          {existingId && (
            <Link href={`/wizard?id=${encodeURIComponent(existingId)}`} className="inline-block underline">
              Edit the existing entry for this date
            </Link>
          )}
        </div>
      )}
    </div>
  )
}

interface WizardPageProps {
  editId?: string
  initialData?: WizardFormData
  initialLocalDate?: string
}

export function WizardPage({ editId, initialData, initialLocalDate }: WizardPageProps) {
  const profile = useProfile()

  if (profile.isError) {
    return (
      <div role="alert" className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Couldn&apos;t load your timezone</p>
        <Button variant="outline" onClick={() => profile.refetch()} disabled={profile.isFetching}>
          {profile.isFetching ? "Retrying..." : "Retry"}
        </Button>
      </div>
    )
  }

  if (profile.isLoading) return <WizardSkeleton />
  const timezone = profile.data?.profile?.timezone ?? "UTC"

  return (
    <WizardProvider initialData={initialData} initialLocalDate={initialLocalDate} timezone={timezone}>
      <WizardInner editId={editId} />
    </WizardProvider>
  )
}
