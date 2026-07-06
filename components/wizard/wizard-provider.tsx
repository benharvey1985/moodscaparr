"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react"
import { z } from "zod"
import type { MoodCategory } from "@/types/mood"

const step1Schema = z.object({
  category: z.enum(["POSITIVE", "NEUTRAL", "NEGATIVE"]),
  moodIndex: z.number().min(0).max(18),
  intensity: z.number().min(1).max(10),
  date: z.string(),
})

const step2Schema = z.object({
  activities: z.array(z.string()).optional(),
  weather: z.string().optional(),
  sleepHours: z.number().optional(),
  sleepQuality: z.string().optional(),
  energyLevel: z.number().min(1).max(10).optional(),
  stressLevel: z.number().min(1).max(10).optional(),
})

const step3Schema = z.object({
  reflection1: z.string().max(500).optional(),
  reflection2: z.string().max(500).optional(),
  reflection3: z.string().max(500).optional(),
  reflection4: z.string().max(500).optional(),
})

const fullSchema = step1Schema.merge(step2Schema).merge(step3Schema)

type WizardFormData = z.infer<typeof fullSchema>

const defaultFormData: WizardFormData = {
  category: "NEUTRAL" as MoodCategory,
  moodIndex: 9,
  intensity: 5,
  date: new Date().toISOString().split("T")[0],
  activities: [],
  weather: undefined,
  sleepHours: undefined,
  sleepQuality: undefined,
  energyLevel: undefined,
  stressLevel: undefined,
  reflection1: undefined,
  reflection2: undefined,
  reflection3: undefined,
  reflection4: undefined,
}

interface WizardContextType {
  step: number
  setStep: (step: number) => void
  formData: WizardFormData
  updateFormData: (data: Partial<WizardFormData>) => void
  resetForm: (data?: WizardFormData) => void
  clearDraft: () => void
}

const WizardContext = createContext<WizardContextType | null>(null)

const DRAFT_KEY = "mood-draft"

export function WizardProvider({
  children,
  initialData,
}: {
  children: React.ReactNode
  initialData?: WizardFormData
}) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<WizardFormData>(
    initialData ?? defaultFormData
  )

  const updateFormData = useCallback(
    (data: Partial<WizardFormData>) => {
      setFormData((prev) => ({ ...prev, ...data }))
    },
    []
  )

  const resetForm = useCallback((data?: WizardFormData) => {
    setFormData(data ?? defaultFormData)
    setStep(0)
  }, [])

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_KEY)
    } catch {}
  }, [])

  useEffect(() => {
    if (initialData) return
    try {
      const saved = localStorage.getItem(DRAFT_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setFormData((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [initialData])

  useEffect(() => {
    if (initialData) return
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
    } catch {}
  }, [formData, initialData])

  return (
    <WizardContext.Provider
      value={{ step, setStep, formData, updateFormData, resetForm, clearDraft }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error("useWizard must be inside WizardProvider")
  return ctx
}

export { step1Schema, step2Schema, step3Schema, fullSchema }
export type { WizardFormData }
