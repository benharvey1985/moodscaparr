import { Suspense } from "react"
import { requireAuth } from "@/lib/auth-actions"
import { WizardEdit } from "./wizard-edit"
import { WizardSkeleton } from "@/components/ui/loading-skeleton"

export default async function WizardPageWrapper() {
  await requireAuth()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-8">
      <Suspense fallback={<WizardSkeleton />}>
        <WizardEdit />
      </Suspense>
    </div>
  )
}
