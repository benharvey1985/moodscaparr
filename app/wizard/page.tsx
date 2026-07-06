import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-actions"
import { WizardEdit } from "./wizard-edit"
import { WizardSkeleton } from "@/components/ui/loading-skeleton"

export default async function WizardPageWrapper() {
  await requireAuth()

  return (
    <div className="space-y-6">
      <Suspense fallback={<WizardSkeleton />}>
        <WizardEdit />
      </Suspense>
    </div>
  )
}
