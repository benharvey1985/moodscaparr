"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface TourStepProps {
  step: number
  title: string
  description: string
  icon: LucideIcon
  isActive: boolean
  isCompleted: boolean
}

function TourStep({ step, title, description, icon: Icon, isActive, isCompleted }: TourStepProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 text-center transition-all duration-300",
        isActive ? "opacity-100" : "hidden opacity-0"
      )}
    >
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-full",
          isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-8" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Step {step} of 3</p>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

export { TourStep }
