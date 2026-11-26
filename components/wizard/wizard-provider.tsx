"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"
import { z } from "zod"
import {
  createMoodEntrySchema,
  createMoodEntryBaseSchema,
  isValidMoodSelection,
} from "@/lib/mood-validation"
import { isValidDateOnly, todayInTimeZone } from "@/lib/dates"
import { authClient } from "@/lib/auth-client"
import { WizardSkeleton } from "@/components/ui/loading-skeleton"

function refineWizardMoodSelection(
  data: { category: unknown; moodIndex: unknown },
  ctx: z.RefinementCtx
) {
  if (data.category === null || data.moodIndex === null) {
    if (data.category !== null || data.moodIndex !== null) {
      ctx.addIssue({ code: "custom", message: "Choose a mood", path: ["moodIndex"] })
    }
  } else if (!isValidMoodSelection(data.category, data.moodIndex)) {
    ctx.addIssue({
      code: "custom",
      message: "moodIndex must belong to the selected category",
      path: ["moodIndex"],
    })
  }
}

const wizardDraftSchema = z
  .object({
    category: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]).nullable(),
    moodIndex: z.number().int().min(0).nullable(),
    intensity: z.number().int().min(1).max(10),
    localDate: z.string().refine(isValidDateOnly, "Choose a valid date"),
    activities: z.array(z.string()).max(50),
    weather: z.string().nullable().optional(),
    sleepHours: z.number().min(0).max(24).nullable().optional(),
    sleepQuality: z.string().nullable().optional(),
    energyLevel: z.number().int().min(1).max(10).nullable().optional(),
    stressLevel: z.number().int().min(1).max(10).nullable().optional(),
    reflection1: z.string().max(500).nullable().optional(),
    reflection2: z.string().max(500).nullable().optional(),
    reflection3: z.string().max(500).nullable().optional(),
    reflection4: z.string().max(500).nullable().optional(),
  })
  .superRefine(refineWizardMoodSelection)

export const step1Schema = createMoodEntryBaseSchema.pick({
  category: true,
  moodIndex: true,
  intensity: true,
  localDate: true,
}).superRefine(refineWizardMoodSelection)
export const step2Schema = createMoodEntryBaseSchema.pick({
  activities: true,
  weather: true,
  sleepHours: true,
  sleepQuality: true,
  energyLevel: true,
  stressLevel: true,
})
export const step3Schema = createMoodEntryBaseSchema.pick({
  reflection1: true,
  reflection2: true,
  reflection3: true,
  reflection4: true,
})
export const fullSchema = createMoodEntrySchema

export type WizardFormData = z.infer<typeof wizardDraftSchema>

function defaultFormData(timezone: string, initialLocalDate?: string): WizardFormData {
  return {
    category: null,
    moodIndex: null,
    intensity: 5,
    localDate: isValidDateOnly(initialLocalDate) ? initialLocalDate : todayInTimeZone(timezone),
    activities: [],
    weather: null,
    sleepHours: null,
    sleepQuality: null,
    energyLevel: null,
    stressLevel: null,
    reflection1: null,
    reflection2: null,
    reflection3: null,
    reflection4: null,
  }
}

interface WizardContextType {
  step: number
  setStep: (step: number) => void
  formData: WizardFormData
  timezone: string
  updateFormData: (data: Partial<WizardFormData>) => void
  resetForm: (data?: WizardFormData) => void
  clearDraft: () => void
}

const WizardContext = createContext<WizardContextType | null>(null)
const LEGACY_DRAFT_KEY = "mood-draft"

export function moodDraftKey(userId: string): string {
  return `${LEGACY_DRAFT_KEY}:${userId}`
}

export function WizardProvider({
  children,
  initialData,
  initialLocalDate,
  timezone = "UTC",
}: {
  children: React.ReactNode
  initialData?: WizardFormData
  initialLocalDate?: string
  timezone?: string
}) {
  const { data: session } = authClient.useSession()
  const userId = session?.user.id
  const requestedLocalDate = isValidDateOnly(initialLocalDate) ? initialLocalDate : undefined
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<{ userId: string | null; data: WizardFormData }>(() => ({
    userId: null,
    data: defaultFormData(timezone, requestedLocalDate),
  }))
  const [hydratedUserId, setHydratedUserId] = useState<string | null>(null)
  const draftReady = !!userId && hydratedUserId === userId
  const formData = draft.userId === userId
    ? draft.data
    : defaultFormData(timezone, requestedLocalDate)

  const updateFormData = useCallback((data: Partial<WizardFormData>) => {
    if (!userId) return
    setDraft((previous) => ({
      userId,
      data: {
        ...(previous.userId === userId
          ? previous.data
          : defaultFormData(timezone, requestedLocalDate)),
        ...data,
      },
    }))
  }, [userId, timezone, requestedLocalDate])

  const resetForm = useCallback((data?: WizardFormData) => {
    if (!userId) return
    setDraft({ userId, data: data ?? defaultFormData(timezone, requestedLocalDate) })
    setStep(0)
  }, [userId, timezone, requestedLocalDate])

  const clearDraft = useCallback(() => {
    if (!userId) return
    try {
      localStorage.removeItem(moodDraftKey(userId))
      localStorage.removeItem(LEGACY_DRAFT_KEY)
    } catch {}
  }, [userId])

  useEffect(() => {
    if (!userId) return
    let active = true

    void Promise.resolve().then(() => {
      if (!active) return
      let nextData = initialData ?? defaultFormData(timezone, requestedLocalDate)
      try {
        localStorage.removeItem(LEGACY_DRAFT_KEY)
        if (!initialData) {
          const saved = localStorage.getItem(moodDraftKey(userId))
          if (saved) {
            const parsed = wizardDraftSchema.safeParse(JSON.parse(saved))
            if (parsed.success) {
              nextData = requestedLocalDate
                ? { ...parsed.data, localDate: requestedLocalDate }
                : parsed.data
            }
          }
        }
      } catch {}

      if (active) {
        setDraft({ userId, data: nextData })
        setHydratedUserId(userId)
      }
    })

    return () => { active = false }
  }, [initialData, requestedLocalDate, timezone, userId])

  useEffect(() => {
    if (!userId || initialData || !draftReady) return
    try { localStorage.setItem(moodDraftKey(userId), JSON.stringify(formData)) } catch {}
  }, [formData, initialData, userId, draftReady])

  if (!userId || !draftReady) return <WizardSkeleton />

  return (
    <WizardContext.Provider
      value={{ step, setStep, formData, timezone, updateFormData, resetForm, clearDraft }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) throw new Error("useWizard must be inside WizardProvider")
  return context
}
